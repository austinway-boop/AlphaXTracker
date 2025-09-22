// API endpoint for fetching goal history
import dataManager from '../../../../lib/data-manager';
import { getGoogleSheetsDB } from '../../../../lib/sheets-database';

export default async function handler(req, res) {
  const { studentId } = req.query;
  const days = parseInt(req.query.days) || 30;
  const refresh = req.query.refresh === 'true';
  
  console.log(`[API /goals/history/${studentId}] Request:`, {
    days,
    refresh
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear cache if refresh requested
    if (refresh) {
      dataManager.clearCache(studentId);
      console.log(`[API /goals/history/${studentId}] Cache cleared for refresh`);
    }

    // Get history from data manager (local-first)
    let history = await dataManager.getGoalHistory(studentId, days);
    
    console.log(`[API /goals/history/${studentId}] Retrieved ${history.length} entries from local`);

    // Try to sync with Google Sheets in background (don't block)
    if (!refresh) {
      setTimeout(async () => {
        try {
          const { sheetsDB, available } = await getGoogleSheetsDB();
          if (available && sheetsDB) {
            if (refresh) {
              sheetsDB.clearCache(`history:${studentId}`);
            }
            const sheetsHistory = await sheetsDB.getGoalHistory(studentId, days);
            if (sheetsHistory && sheetsHistory.length > 0) {
              // Update local with Sheets data
              for (const entry of sheetsHistory) {
                await dataManager.addGoalHistory(studentId, entry);
              }
              console.log(`[API /goals/history/${studentId}] Synced ${sheetsHistory.length} entries from Sheets`);
            }
          }
        } catch (error) {
          console.error(`[API /goals/history/${studentId}] Sheets sync error:`, error.message);
        }
      }, 100);
    }

    return res.status(200).json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error(`[API /goals/history/${studentId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch goal history',
      message: error.message
    });
  }
}