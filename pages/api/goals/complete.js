const sheetsDB = require('../../../lib/sheets-database');
const { DEFAULT_PROFILES } = require('../../../lib/fallback-data');
const VercelStorage = require('../../../lib/vercel-storage');

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
    
    // Save to Vercel KV Storage (persists across deployments)
    const updatedStatus = await VercelStorage.saveGoalStatus(studentIdNum, type, true);
    console.log(`Updated ${type} for student ${studentIdNum} in Vercel Storage:`, updatedStatus);
    
    // Try to update in Google Sheets first
    let sheetsUpdated = false;
    let profileUpdated = false;
    
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        // Get current profile first
        const currentProfile = await sheetsDB.getProfile(studentIdNum) || {};
        
        // Prepare update data
        const updateData = {
          ...currentProfile,
          dailyGoal: currentProfile.dailyGoal || 'Complete daily tasks',
          sessionGoal: currentProfile.sessionGoal || '100 points',
          projectOneliner: currentProfile.projectOneliner || 'Working on project'
        };
        
        if (type === 'brainlift') {
          updateData.brainliftCompleted = true;
          updateData.lastBrainliftDate = today;
        } else {
          updateData.dailyGoalCompleted = true;
          updateData.lastDailyGoalDate = today;
        }
        
        profileUpdated = await sheetsDB.updateProfile(studentIdNum, updateData);
        console.log(`Profile update result for ${type}:`, profileUpdated ? 'SUCCESS' : 'FAILED');
        
        // Also update points
        if (profileUpdated) {
          const student = await sheetsDB.getStudent(studentIdNum);
          if (student) {
            const pointsToAdd = type === 'brainlift' ? 10 : 5;
            await sheetsDB.updateStudent(studentIdNum, {
              points: (student.points || 0) + pointsToAdd,
              lastActivity: today
            });
          }
          sheetsUpdated = true;
        }
      }
    } catch (error) {
      console.error('Error updating in Sheets:', error.message);
      console.log('Using memory store as fallback');
    }

    // Return success with the updated status
    return res.status(200).json({
      success: true,
      message: `${type === 'brainlift' ? 'Brainlift' : 'Daily Goal'} marked as complete`,
      studentId: studentIdNum,
      type,
      completedAt: today,
      pointsAwarded: type === 'brainlift' ? 10 : 5,
      persisted: sheetsUpdated,
      updatedStatus: {
        brainliftCompleted: type === 'brainlift' ? true : updatedStatus.brainliftCompleted,
        dailyGoalCompleted: type === 'dailyGoal' ? true : updatedStatus.dailyGoalCompleted,
        lastBrainliftDate: type === 'brainlift' ? today : updatedStatus.lastBrainliftDate,
        lastDailyGoalDate: type === 'dailyGoal' ? today : updatedStatus.lastDailyGoalDate
      }
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