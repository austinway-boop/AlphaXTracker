// API endpoint for fetching batch leaderboard data
import dataManager from '../../../lib/data-manager';
import { getGoogleSheetsDB } from '../../../lib/sheets-database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentIds, days = 30 } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'Student IDs array required' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Fetch data for all students
    const results = await Promise.all(
      studentIds.map(async (studentId) => {
        try {
          // Get today's goal status from data manager
          const todayStatus = await dataManager.checkTodayGoals(studentId);
          
          // Get profile for additional data
          const profile = await dataManager.getProfile(studentId);
          
          // Get history for weekly/monthly stats
          const history = await dataManager.getGoalHistory(studentId, days);
          
          // Calculate weekly goals (last 7 days)
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7);
          const weekStartStr = weekStart.toISOString().split('T')[0];
          
          const weeklyHistory = history.filter(entry => entry.date >= weekStartStr);
          const weeklyBrainlift = weeklyHistory.filter(h => h.brainliftCompleted).length;
          const weeklyDailyGoals = weeklyHistory.filter(h => h.dailyGoalCompleted).length;
          
          // Calculate monthly goals (based on days parameter)
          const monthlyBrainlift = history.filter(h => h.brainliftCompleted).length;
          const monthlyDailyGoals = history.filter(h => h.dailyGoalCompleted).length;
          
          // Calculate audience building
          const audienceTotal = (profile.goals?.x || 0) + 
                               (profile.goals?.youtube || 0) + 
                               (profile.goals?.tiktok || 0) + 
                               (profile.goals?.instagram || 0);
          
          return {
            studentId,
            todayBrainlift: todayStatus.brainlift,
            todayDailyGoal: todayStatus.dailyGoal,
            weeklyBrainlift,
            weeklyDailyGoals,
            monthlyBrainlift,
            monthlyDailyGoals,
            audienceBuilding: audienceTotal,
            lastUpdated: profile.updatedAt || new Date().toISOString()
          };
        } catch (error) {
          console.error(`Error fetching data for student ${studentId}:`, error);
          return {
            studentId,
            todayBrainlift: false,
            todayDailyGoal: false,
            weeklyBrainlift: 0,
            weeklyDailyGoals: 0,
            monthlyBrainlift: 0,
            monthlyDailyGoals: 0,
            audienceBuilding: 0,
            error: error.message
          };
        }
      })
    );

    // Try to sync with Google Sheets in background (don't block response)
    setTimeout(async () => {
      try {
        const { sheetsDB, available } = await getGoogleSheetsDB();
        if (available && sheetsDB) {
          // Sync any pending data
          console.log('[Batch Leaderboard] Background sync with Google Sheets...');
        }
      } catch (error) {
        console.error('[Batch Leaderboard] Background sync error:', error.message);
      }
    }, 100);

    return res.status(200).json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in batch leaderboard data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard data',
      message: error.message
    });
  }
}