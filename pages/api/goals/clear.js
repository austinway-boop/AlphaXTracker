/**
 * API to clear goal completion status (for testing/reset)
 */

const VercelStorage = require('../../../lib/vercel-storage');
const sheetsDB = require('../../../lib/sheets-database');

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
    
    // Clear from Vercel Storage
    await VercelStorage.saveGoalStatus(studentIdNum, 'brainlift', false);
    await VercelStorage.saveGoalStatus(studentIdNum, 'dailyGoal', false);
    
    // Clear from Google Sheets
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        await sheetsDB.updateProfile(studentIdNum, {
          brainliftCompleted: false,
          lastBrainliftDate: '',
          dailyGoalCompleted: false,
          lastDailyGoalDate: ''
        });
      }
    } catch (error) {
      console.log('Could not clear from Sheets:', error.message);
    }

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
