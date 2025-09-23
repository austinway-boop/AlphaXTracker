const redisDB = require('../../../lib/redis-database');

export default async function handler(req, res) {
  const { studentId } = req.query;
  
  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: 'Student ID is required'
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
  
  // Handle POST request - Save profile data
  if (req.method === 'POST') {
    try {
      const profileData = req.body;
      
      console.log(`[Profile API] Saving profile for student ${studentIdNum}:`, profileData);
      
      // Save to Redis
      const updatedProfile = await redisDB.updateProfile(studentIdNum, {
        ...profileData,
        studentId: studentIdNum,
        lastUpdated: new Date().toISOString()
      });
      
      // Also add to goal history if relevant fields changed
      if (profileData.dailyGoal || profileData.sessionGoal || profileData.projectOneliner) {
        const today = new Date().toISOString().split('T')[0];
        await redisDB.addGoalHistory(studentIdNum, {
          date: today,
          dailyGoal: profileData.dailyGoal,
          sessionGoal: profileData.sessionGoal,
          projectOneliner: profileData.projectOneliner,
          dailyGoalCompleted: profileData.dailyGoalCompleted || false,
          brainliftCompleted: profileData.brainliftCompleted || false,
          audienceX: profileData.goals?.x || 0,
          audienceYouTube: profileData.goals?.youtube || 0,
          audienceTikTok: profileData.goals?.tiktok || 0,
          audienceInstagram: profileData.goals?.instagram || 0
        });
      }
      
      console.log(`[Profile API] Profile saved successfully for student ${studentIdNum}`);
      
      return res.status(200).json({
        success: true,
        message: 'Profile saved successfully',
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save profile',
        error: error.message
      });
    }
  }
  
  // Handle GET request - Fetch profile data
  if (req.method === 'GET') {
    try {
      // Get student from Redis
      const student = await redisDB.getStudentById(studentIdNum);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
          studentId: studentIdNum
        });
      }
      
      // Get profile from Redis
      const profile = await redisDB.getProfile(studentIdNum);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        studentId: studentIdNum
      });
    }
    
    // Get today's date and today's goals
    const today = new Date().toISOString().split('T')[0];
    const todayGoals = await redisDB.getTodayGoals(studentIdNum);
    
    // Check if goals were completed today
    const todayBrainliftCompleted = todayGoals.brainliftCompleted || false;
    const todayDailyGoalCompleted = todayGoals.dailyGoalCompleted || false;
    
    console.log(`[Profile API] Student ${studentIdNum} - Today: ${today}`);
    console.log(`[Profile API] Today's Goals:`, {
      brainlift: todayBrainliftCompleted,
      dailyGoal: todayDailyGoalCompleted
    });
    console.log(`[Profile API] Profile Data:`, {
      brainlift: profile.brainliftCompleted,
      brainliftDate: profile.lastBrainliftDate,
      dailyGoal: profile.dailyGoalCompleted,
      dailyGoalDate: profile.lastDailyGoalDate
    });
    
    // Merge profile with today's completion status
    const mergedProfile = {
      ...profile,
      // Use today's goals for current completion status
      brainliftCompleted: todayBrainliftCompleted,
      dailyGoalCompleted: todayDailyGoalCompleted,
      // Keep the dates from today's goals if they are completed today
      lastBrainliftDate: todayBrainliftCompleted ? today : (profile.lastBrainliftDate || null),
      lastDailyGoalDate: todayDailyGoalCompleted ? today : (profile.lastDailyGoalDate || null),
      totalPoints: student.points || 0
    };
    
    console.log(`Profile API - Final merged profile:`, {
      brainlift: mergedProfile.brainliftCompleted,
      dailyGoal: mergedProfile.dailyGoalCompleted,
      points: mergedProfile.totalPoints
    });

      return res.status(200).json({
        success: true,
        profile: {
          ...mergedProfile,
          student: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            fullName: student.fullName,
            email: student.email
          }
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error.message
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}