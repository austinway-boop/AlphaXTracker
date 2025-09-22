const sheetsDB = require('../../../lib/sheets-database');
const { DEFAULT_PROFILES } = require('../../../lib/fallback-data');

export default async function handler(req, res) {
  // Accept both GET and POST for flexibility
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get parameters from either body (POST) or query (GET)
    const { studentId, type } = req.method === 'POST' ? req.body : req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    if (!type || !['brainlift', 'dailyGoal'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal type. Must be "brainlift" or "dailyGoal"'
      });
    }

    const studentIdNum = parseInt(studentId);
    const today = new Date().toISOString();
    
    // Try to update in Google Sheets
    let updated = false;
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        const updateData = {};
        if (type === 'brainlift') {
          updateData.brainliftCompleted = true;
          updateData.lastBrainliftDate = today;
        } else {
          updateData.dailyGoalCompleted = true;
          updateData.lastDailyGoalDate = today;
        }
        
        updated = await sheetsDB.updateProfile(studentIdNum, updateData);
        
        // Also update points
        if (updated) {
          const student = await sheetsDB.getStudent(studentIdNum);
          if (student) {
            const pointsToAdd = type === 'brainlift' ? 10 : 5;
            await sheetsDB.updateStudent(studentIdNum, {
              points: (student.points || 0) + pointsToAdd,
              lastActivity: today
            });
          }
        }
      }
    } catch (error) {
      console.log('Could not update in Sheets, using local state only');
    }

    // Return success (even if only updated locally)
    return res.status(200).json({
      success: true,
      message: `${type === 'brainlift' ? 'Brainlift' : 'Daily Goal'} marked as complete`,
      studentId: studentIdNum,
      type,
      completedAt: today,
      pointsAwarded: type === 'brainlift' ? 10 : 5,
      persisted: updated
    });

  } catch (error) {
    console.error('Error completing goal:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete goal',
      message: error.message
    });
  }
}