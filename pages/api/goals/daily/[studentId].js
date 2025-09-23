const redisDB = require('../../../../lib/redis-database');

export default async function handler(req, res) {
  const { studentId } = req.query;
  
  if (!studentId) {
    return res.status(400).json({
      success: false,
      error: 'Student ID is required'
    });
  }

  try {
    const studentIdNum = parseInt(studentId);
    
    // Initialize Redis database
    const dbInitialized = await redisDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }
    
    // Get student from Redis
    const student = await redisDB.getStudentById(studentIdNum);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Get profile from Redis
    const profile = await redisDB.getProfile(studentIdNum);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }
    
    // Get today's goals status
    const todayGoals = await redisDB.getTodayGoals(studentIdNum);

    // Generate daily goal data
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const dailyData = {
      studentId: studentIdNum,
      studentName: student.fullName,
      date: todayStr,
      goals: {
        daily: profile.dailyGoal || 10,
        session: profile.sessionGoal || 100
      },
      completed: {
        // Use today's goals for completion status
        brainlift: todayGoals.brainliftCompleted || false,
        dailyGoal: todayGoals.dailyGoalCompleted || false
      },
      lastCompleted: {
        brainlift: todayGoals.brainliftCompleted ? todayStr : profile.lastBrainliftDate || null,
        dailyGoal: todayGoals.dailyGoalCompleted ? todayStr : profile.lastDailyGoalDate || null
      },
      socialMedia: {
        x: {
          goal: profile.goals?.x || 3,
          platform: profile.platforms?.x || '@student'
        },
        youtube: {
          goal: profile.goals?.youtube || 2,
          platform: profile.platforms?.youtube || 'student_yt'
        },
        tiktok: {
          goal: profile.goals?.tiktok || 2,
          platform: profile.platforms?.tiktok || '@student'
        },
        instagram: {
          goal: profile.goals?.instagram || 2,
          platform: profile.platforms?.instagram || 'student_ig'
        }
      },
      projectOneliner: profile.projectOneliner || 'Working on project',
      points: student.points || 0
    };

    return res.status(200).json({
      success: true,
      data: dailyData
    });

  } catch (error) {
    console.error('Error getting daily goals:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get daily goals',
      message: error.message
    });
  }
}