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

    // Get real goal history from Redis (last 30 days)
    const history = await redisDB.getGoalHistory(studentIdNum, 30);
    
    // If no history, generate empty entries for visualization
    const fullHistory = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find existing history entry for this date
      const existingEntry = history.find(h => h.date === dateStr);
      
      if (existingEntry) {
        fullHistory.push({
          date: dateStr,
          completed: {
            brainlift: existingEntry.brainliftCompleted || false,
            dailyGoal: existingEntry.dailyGoalCompleted || false,
            x: existingEntry.audienceX || 0,
            youtube: existingEntry.audienceYouTube || 0,
            tiktok: existingEntry.audienceTikTok || 0,
            instagram: existingEntry.audienceInstagram || 0
          },
          points: (existingEntry.brainliftCompleted ? 10 : 0) + (existingEntry.dailyGoalCompleted ? 5 : 0),
          dailyGoal: existingEntry.dailyGoal || '',
          sessionGoal: existingEntry.sessionGoal || '',
          projectOneliner: existingEntry.projectOneliner || ''
        });
      } else {
        // No data for this date - add empty entry
        fullHistory.push({
          date: dateStr,
          completed: {
            brainlift: false,
            dailyGoal: false,
            x: 0,
            youtube: 0,
            tiktok: 0,
            instagram: 0
          },
          points: 0,
          dailyGoal: '',
          sessionGoal: '',
          projectOneliner: ''
        });
      }
    }
    
    // Calculate summary statistics
    const brainliftCompletions = fullHistory.filter(h => h.completed.brainlift).length;
    const dailyGoalCompletions = fullHistory.filter(h => h.completed.dailyGoal).length;
    
    // Calculate current streak
    let currentStreak = 0;
    for (let i = fullHistory.length - 1; i >= 0; i--) {
      if (fullHistory[i].completed.brainlift || fullHistory[i].completed.dailyGoal) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const entry of fullHistory) {
      if (entry.completed.brainlift || entry.completed.dailyGoal) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return res.status(200).json({
      success: true,
      studentId: studentIdNum,
      studentName: student.fullName,
      history: fullHistory,
      summary: {
        totalDays: 30,
        brainliftCompletions,
        dailyGoalCompletions,
        currentStreak,
        longestStreak,
        totalPoints: student.points || 0
      }
    });

  } catch (error) {
    console.error('Error getting goal history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get goal history',
      message: error.message
    });
  }
}