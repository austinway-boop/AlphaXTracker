// API endpoint for checking today's goal status
import dataManager from '../../../../lib/data-manager';

export default async function handler(req, res) {
  const { studentId } = req.query;
  
  console.log(`[API /goals/check/${studentId}] Checking today's goals`);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check today's goals using data manager
    const todayStatus = await dataManager.checkTodayGoals(studentId);
    
    console.log(`[API /goals/check/${studentId}] Today's status:`, todayStatus);

    // Set cache headers for efficiency
    res.setHeader('Cache-Control', 'private, max-age=60');
    
    return res.status(200).json({
      success: true,
      ...todayStatus
    });

  } catch (error) {
    console.error(`[API /goals/check/${studentId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check goals',
      message: error.message
    });
  }
}