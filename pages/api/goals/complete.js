const sheetsDB = require('../../../lib/sheets-database');
const { DEFAULT_PROFILES } = require('../../../lib/fallback-data');
const memoryStore = require('../../../lib/memory-store');

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
    // Also check for variations in parameter names
    let studentId, type;
    
    if (req.method === 'POST') {
      studentId = req.body.studentId || req.body.student_id || req.body.id;
      type = req.body.type || req.body.goalType || req.body.goal_type;
    } else {
      studentId = req.query.studentId || req.query.student_id || req.query.id;
      type = req.query.type || req.query.goalType || req.query.goal_type;
    }

    // Log for debugging
    console.log('Goals complete request:', { method: req.method, studentId, type, body: req.body, query: req.query });

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required',
        received: { body: req.body, query: req.query }
      });
    }

    // Normalize type variations - handle exact matches first
    if (type === 'brainlift' || type === 'dailyGoal') {
      // Already in correct format
    } else if (type) {
      const typeLower = type.toLowerCase();
      // Handle variations
      if (typeLower === 'daily' || typeLower === 'daily_goal' || typeLower === 'dailygoal') {
        type = 'dailyGoal';
      } else if (typeLower === 'brainlift' || typeLower === 'brain' || typeLower === 'brain_lift') {
        type = 'brainlift';
      } else {
        // Unknown type
        type = null;
      }
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Goal type is required. Must be "brainlift" or "dailyGoal"',
        received: req.body.goalType || req.body.type || req.query.type,
        validTypes: ['brainlift', 'dailyGoal'],
        requestData: { body: req.body, query: req.query }
      });
    }

    const studentIdNum = parseInt(studentId);
    const today = new Date().toISOString();
    
    // Always update in memory store (persists during session)
    const updatedStatus = memoryStore.updateGoalStatus(studentIdNum, type, true);
    console.log(`Updated ${type} for student ${studentIdNum} in memory store:`, updatedStatus);
    
    // Try to update in Google Sheets as well
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
      console.log('Could not update in Sheets, using memory store only');
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