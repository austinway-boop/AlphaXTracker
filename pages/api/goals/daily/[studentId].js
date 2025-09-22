const sheetsDB = require('../../../../lib/sheets-database');
const { DEFAULT_PROFILES, DEFAULT_STUDENTS } = require('../../../../lib/fallback-data');

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
    let profile = null;
    let student = null;
    let usingFallback = false;

    // Try Google Sheets first
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        profile = await sheetsDB.getProfile(studentIdNum);
        student = await sheetsDB.getStudent(studentIdNum);
      }
    } catch (error) {
      console.log('Google Sheets unavailable, using fallback');
      usingFallback = true;
    }

    // Use fallback data if needed
    if (!profile || !student || usingFallback) {
      profile = DEFAULT_PROFILES[studentIdNum] || {};
      student = DEFAULT_STUDENTS.find(s => s.id === studentIdNum);
      usingFallback = true;
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Generate daily goal data
    const today = new Date();
    const dailyData = {
      studentId: studentIdNum,
      studentName: student.fullName,
      date: today.toISOString().split('T')[0],
      goals: {
        daily: profile.dailyGoal || 10,
        session: profile.sessionGoal || 100
      },
      completed: {
        brainlift: profile.brainliftCompleted || false,
        dailyGoal: profile.dailyGoalCompleted || false
      },
      lastCompleted: {
        brainlift: profile.lastBrainliftDate || null,
        dailyGoal: profile.lastDailyGoalDate || null
      },
      socialMedia: {
        x: {
          goal: profile.goalX || 3,
          platform: profile.platformX || '@student'
        },
        youtube: {
          goal: profile.goalYouTube || 2,
          platform: profile.platformYouTube || 'student_yt'
        },
        tiktok: {
          goal: profile.goalTikTok || 2,
          platform: profile.platformTikTok || '@student'
        },
        instagram: {
          goal: profile.goalInstagram || 2,
          platform: profile.platformInstagram || 'student_ig'
        }
      },
      projectOneliner: profile.projectOneliner || 'Working on project',
      points: student.points || 0
    };

    return res.status(200).json({
      success: true,
      data: dailyData,
      ...(usingFallback && { 
        notice: 'Using demo data. Configure Google Sheets for full functionality.' 
      })
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