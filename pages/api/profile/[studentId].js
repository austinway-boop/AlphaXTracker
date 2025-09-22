const sheetsDB = require('../../../lib/sheets-database');
const { DEFAULT_STUDENTS, DEFAULT_PROFILES } = require('../../../lib/fallback-data');
const SimpleStorage = require('../../../lib/simple-storage');

export default async function handler(req, res) {
  try {
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    let profile = null;
    let student = null;
    let usingFallback = false;

    // Try Google Sheets first
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        profile = await sheetsDB.getProfile(parseInt(studentId));
        student = await sheetsDB.getStudent(parseInt(studentId));
      }
    } catch (error) {
      console.log('Google Sheets unavailable, using fallback data:', error.message);
      usingFallback = true;
    }

    const studentIdNum = parseInt(studentId);
    
    // Use fallback data if Sheets fails
    if (!profile || !student || usingFallback) {
      profile = DEFAULT_PROFILES[studentIdNum];
      student = DEFAULT_STUDENTS.find(s => s.id === studentIdNum);
      usingFallback = true;
    }

    if (!profile || !student) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        studentId: studentIdNum
      });
    }

    // Merge with Simple Storage data to get persistent goal completions
    const goalStatus = await SimpleStorage.getGoalStatus(studentIdNum);
    console.log(`Profile API - Storage status for student ${studentIdNum}:`, goalStatus);
    console.log(`Profile API - Profile from Sheets/Fallback:`, {
      brainlift: profile.brainliftCompleted,
      dailyGoal: profile.dailyGoalCompleted
    });
    
    // Priority: Simple Storage > Sheets > Default
    const mergedProfile = {
      ...profile,
      brainliftCompleted: goalStatus.brainliftCompleted || profile.brainliftCompleted || false,
      lastBrainliftDate: goalStatus.lastBrainliftDate || profile.lastBrainliftDate || null,
      dailyGoalCompleted: goalStatus.dailyGoalCompleted || profile.dailyGoalCompleted || false,
      lastDailyGoalDate: goalStatus.lastDailyGoalDate || profile.lastDailyGoalDate || null,
      totalPoints: goalStatus.totalPoints || 0
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
      },
      ...(usingFallback && { 
        notice: 'Using demo data. Configure Google Sheets for full functionality.' 
      })
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    // Return a valid JSON error response
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}