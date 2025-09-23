/**
 * API to clear goal completion status (for testing/reset)
 */

const redisDB = require('../../../lib/redis-database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    const studentIdNum = parseInt(studentId);
    
    // Initialize Redis database
    const dbInitialized = await redisDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }
    
    // Clear today's goals in Redis
    const today = new Date().toISOString().split('T')[0];
    await redisDB.updateTodayGoals(studentIdNum, {
      date: today,
      brainliftCompleted: false,
      dailyGoalCompleted: false
    });
    
    // Also clear from profile
    await redisDB.updateProfile(studentIdNum, {
      brainliftCompleted: false,
      lastBrainliftDate: null,
      dailyGoalCompleted: false,
      lastDailyGoalDate: null
    });

    return res.status(200).json({
      success: true,
      message: 'Goals cleared successfully',
      studentId: studentIdNum
    });

  } catch (error) {
    console.error('Error clearing goals:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear goals',
      message: error.message
    });
  }
}
