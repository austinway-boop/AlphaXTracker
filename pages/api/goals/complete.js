const redisDB = require('../../../lib/redis-database');

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
    let studentId, type;
    
    if (req.method === 'POST') {
      studentId = req.body.studentId || req.body.student_id || req.body.id;
      type = req.body.type || req.body.goalType || req.body.goal_type;
    } else {
      studentId = req.query.studentId || req.query.student_id || req.query.id;
      type = req.query.type || req.query.goalType || req.query.goal_type;
    }

    // Log for debugging
    console.log('Goals complete request:', { method: req.method, studentId, type });

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // Normalize type variations
    if (type === 'brainlift' || type === 'dailyGoal') {
      // Already in correct format
    } else if (type) {
      const typeLower = type.toLowerCase();
      if (typeLower === 'daily' || typeLower === 'daily_goal' || typeLower === 'dailygoal') {
        type = 'dailyGoal';
      } else if (typeLower === 'brainlift' || typeLower === 'brain' || typeLower === 'brain_lift') {
        type = 'brainlift';
      } else {
        type = null;
      }
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Goal type is required. Must be "brainlift" or "dailyGoal"',
        validTypes: ['brainlift', 'dailyGoal']
      });
    }

    const studentIdNum = parseInt(studentId);
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize Redis database
    const dbInitialized = await redisDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }
    
    // Get student to verify they exist
    const student = await redisDB.getStudentById(studentIdNum);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Get current today's goals
    const todayGoals = await redisDB.getTodayGoals(studentIdNum);
    
    // Update today's goals (NOT the profile)
    const updates = {
      date: today
    };
    
    if (type === 'brainlift') {
      updates.brainliftCompleted = true;
    } else if (type === 'dailyGoal') {
      updates.dailyGoalCompleted = true;
    }
    
    // Save to today's goals
    await redisDB.updateTodayGoals(studentIdNum, updates);
    
    // Update points
    const pointsToAdd = type === 'brainlift' ? 10 : 5;
    await redisDB.updateStudent(studentIdNum, {
      points: (student.points || 0) + pointsToAdd,
      lastActivity: new Date().toISOString()
    });
    
    console.log(`[Complete API] Marked ${type} complete for student ${studentIdNum} on ${today}`);

    // Return success
    return res.status(200).json({
      success: true,
      message: `${type === 'brainlift' ? 'Brainlift' : 'Daily Goal'} marked as complete`,
      studentId: studentIdNum,
      type,
      completedAt: today,
      pointsAwarded: pointsToAdd,
      persisted: true
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