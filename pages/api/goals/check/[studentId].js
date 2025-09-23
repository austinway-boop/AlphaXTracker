const redisDB = require('../../../../lib/redis-database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { studentId } = req.query;
  const studentIdNum = parseInt(studentId);
  const today = new Date().toISOString().split('T')[0];

  try {
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
        message: 'Student not found',
        studentId: studentIdNum
      });
    }

    // Get profile for default goals
    const profile = await redisDB.getProfile(studentIdNum);
    
    // Get TODAY's specific goal status (not from profile!)
    const todayGoals = await redisDB.getTodayGoals(studentIdNum);
    
    // Use today's goals for completion status, profile for defaults
    const dailyCompleted = todayGoals.dailyGoalCompleted || false;
    const brainliftCompleted = todayGoals.brainliftCompleted || false;
    const audienceGoals = todayGoals.audienceGoals || {};

    // Prepare response
    const response = {
      success: true,
      goals: {
        dailyGoal: student.honors ? 15 : 10,
        sessionGoal: student.honors ? 150 : 100,
        brainlift: {
          completed: brainliftCompleted,
          lastCompleted: brainliftCompleted ? today : null
        },
        dailyGoalCheck: {
          completed: dailyCompleted,
          lastCompleted: dailyCompleted ? today : null
        },
        platforms: {
          x: {
            goal: profile?.goals?.x || 3,
            completed: audienceGoals.x || 0,
            handle: profile?.platforms?.x || '@student'
          },
          youtube: {
            goal: profile?.goals?.youtube || 2,
            completed: audienceGoals.youtube || 0,
            handle: profile?.platforms?.youtube || 'student_yt'
          },
          tiktok: {
            goal: profile?.goals?.tiktok || 2,
            completed: audienceGoals.tiktok || 0,
            handle: profile?.platforms?.tiktok || '@student_tt'
          },
          instagram: {
            goal: profile?.goals?.instagram || 2,
            completed: audienceGoals.instagram || 0,
            handle: profile?.platforms?.instagram || 'student_ig'
          }
        },
        projectOneliner: profile?.projectOneliner || 'Working on project',
        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          honors: student.honors,
          points: student.points || 0
        }
      },
      date: today
    };

    console.log(`[Check API] Goals for student ${studentIdNum} on ${today}:`, {
      brainlift: brainliftCompleted,
      dailyGoal: dailyCompleted
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching goals:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching goals',
      error: error.message
    });
  }
}