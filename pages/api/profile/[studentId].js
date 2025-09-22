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

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Check if goals from Sheets were completed today
    const sheetsBrainliftToday = profile.lastBrainliftDate && profile.lastBrainliftDate.startsWith(today);
    const sheetsDailyGoalToday = profile.lastDailyGoalDate && profile.lastDailyGoalDate.startsWith(today);
    
    // Get Simple Storage data as fallback/override
    const goalStatus = await SimpleStorage.getGoalStatus(studentIdNum);
    const storageBrainliftToday = goalStatus.lastBrainliftDate && goalStatus.lastBrainliftDate.startsWith(today);
    const storageDailyGoalToday = goalStatus.lastDailyGoalDate && goalStatus.lastDailyGoalDate.startsWith(today);
    
    console.log(`[Profile API] Student ${studentIdNum} - Today: ${today}`);
    console.log(`[Profile API] From Sheets:`, {
      brainlift: profile.brainliftCompleted,
      brainliftDate: profile.lastBrainliftDate,
      brainliftToday: sheetsBrainliftToday,
      dailyGoal: profile.dailyGoalCompleted,
      dailyGoalDate: profile.lastDailyGoalDate,
      dailyGoalToday: sheetsDailyGoalToday
    });
    console.log(`[Profile API] From Storage:`, {
      brainlift: goalStatus.brainliftCompleted,
      brainliftDate: goalStatus.lastBrainliftDate,
      brainliftToday: storageBrainliftToday,
      dailyGoal: goalStatus.dailyGoalCompleted,
      dailyGoalDate: goalStatus.lastDailyGoalDate,
      dailyGoalToday: storageDailyGoalToday
    });
    
    // Merge profile - show as completed only if completed TODAY
    const mergedProfile = {
      ...profile,
      // Brainlift is completed if either Sheets or Storage says it was completed today
      brainliftCompleted: (sheetsBrainliftToday && profile.brainliftCompleted) || 
                         (storageBrainliftToday && goalStatus.brainliftCompleted),
      lastBrainliftDate: profile.lastBrainliftDate || goalStatus.lastBrainliftDate || null,
      // Daily Goal is completed if either Sheets or Storage says it was completed today
      dailyGoalCompleted: (sheetsDailyGoalToday && profile.dailyGoalCompleted) || 
                         (storageDailyGoalToday && goalStatus.dailyGoalCompleted),
      lastDailyGoalDate: profile.lastDailyGoalDate || goalStatus.lastDailyGoalDate || null,
      totalPoints: goalStatus.totalPoints || profile.points || 0
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