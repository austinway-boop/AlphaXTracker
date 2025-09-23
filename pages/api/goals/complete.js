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
    let studentId, type, completed;
    
    if (req.method === 'POST') {
      studentId = req.body.studentId || req.body.student_id || req.body.id;
      type = req.body.type || req.body.goalType || req.body.goal_type;
      // Get the completed status - if not provided, default to true (marking as complete)
      completed = req.body.completed !== undefined ? req.body.completed : true;
    } else {
      studentId = req.query.studentId || req.query.student_id || req.query.id;
      type = req.query.type || req.query.goalType || req.query.goal_type;
      completed = req.query.completed !== undefined ? 
        (req.query.completed === 'true' || req.query.completed === '1') : true;
    }

    // Log for debugging
    console.log('[Complete API] Request:', { 
      method: req.method, 
      studentId, 
      type, 
      completed,
      body: req.body 
    });

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
    
    // Determine what's changing
    const previousStatus = type === 'brainlift' ? 
      todayGoals.brainliftCompleted : todayGoals.dailyGoalCompleted;
    
    // Update today's goals based on the completed parameter
    const updates = {
      date: today
    };
    
    if (type === 'brainlift') {
      updates.brainliftCompleted = completed;
    } else if (type === 'dailyGoal') {
      updates.dailyGoalCompleted = completed;
    }
    
    // Save to today's goals
    const updatedGoals = await redisDB.updateTodayGoals(studentIdNum, updates);
    
    // Also update the profile to ensure persistence
    const profileUpdates = {};
    if (type === 'brainlift') {
      profileUpdates.brainliftCompleted = completed;
      profileUpdates.lastBrainliftDate = completed ? today : null;
    } else if (type === 'dailyGoal') {
      profileUpdates.dailyGoalCompleted = completed;
      profileUpdates.lastDailyGoalDate = completed ? today : null;
    }
    
    await redisDB.updateProfile(studentIdNum, profileUpdates);
    
    // Update points - add if completing, subtract if uncompleting
    const pointsChange = type === 'brainlift' ? 10 : 5;
    let newPoints = student.points || 0;
    
    if (completed && !previousStatus) {
      // Marking as complete when it wasn't
      newPoints += pointsChange;
    } else if (!completed && previousStatus) {
      // Unmarking when it was complete
      newPoints = Math.max(0, newPoints - pointsChange);
    }
    
    await redisDB.updateStudent(studentIdNum, {
      points: newPoints,
      lastActivity: new Date().toISOString()
    });
    
    // Add to history
    await redisDB.addGoalHistory(studentIdNum, {
      date: today,
      brainliftCompleted: type === 'brainlift' ? completed : todayGoals.brainliftCompleted,
      dailyGoalCompleted: type === 'dailyGoal' ? completed : todayGoals.dailyGoalCompleted,
      dailyGoal: profileUpdates.dailyGoal || '',
      sessionGoal: profileUpdates.sessionGoal || '',
      projectOneliner: profileUpdates.projectOneliner || ''
    });
    
    console.log(`[Complete API] ${completed ? 'Marked' : 'Unmarked'} ${type} for student ${studentIdNum} on ${today}`);

    // Return success with updated status
    return res.status(200).json({
      success: true,
      message: `${type === 'brainlift' ? 'Brainlift' : 'Daily Goal'} ${completed ? 'marked as complete' : 'unmarked'}`,
      studentId: studentIdNum,
      type,
      completed,
      completedAt: completed ? today : null,
      pointsAwarded: completed ? pointsChange : -pointsChange,
      totalPoints: newPoints,
      persisted: true,
      updatedGoals: updatedGoals
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