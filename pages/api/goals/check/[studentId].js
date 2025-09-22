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
      profile = DEFAULT_PROFILES[studentIdNum];
      student = DEFAULT_STUDENTS.find(s => s.id === studentIdNum);
      usingFallback = true;
    }

    if (!profile || !student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Calculate goal completion (mock data for now)
    const today = new Date().toISOString().split('T')[0];
    const goals = {
      dailyGoal: profile.dailyGoal || 10,
      sessionGoal: profile.sessionGoal || 100,
      brainlift: {
        completed: profile.brainliftCompleted || false,
        lastCompleted: profile.lastBrainliftDate || null
      },
      dailyGoalCheck: {
        completed: profile.dailyGoalCompleted || false,
        lastCompleted: profile.lastDailyGoalDate || null
      },
      platforms: {
        x: {
          goal: profile.goalX || 3,
          completed: Math.floor(Math.random() * (profile.goalX || 3)),
          handle: profile.platformX || '@student'
        },
        youtube: {
          goal: profile.goalYouTube || 2,
          completed: Math.floor(Math.random() * (profile.goalYouTube || 2)),
          handle: profile.platformYouTube || 'student_yt'
        },
        tiktok: {
          goal: profile.goalTikTok || 2,
          completed: Math.floor(Math.random() * (profile.goalTikTok || 2)),
          handle: profile.platformTikTok || '@student_tt'
        },
        instagram: {
          goal: profile.goalInstagram || 2,
          completed: Math.floor(Math.random() * (profile.goalInstagram || 2)),
          handle: profile.platformInstagram || 'student_ig'
        }
      },
      projectOneliner: profile.projectOneliner || 'Working on project',
      student: {
        id: student.id,
        name: student.fullName,
        email: student.email,
        honors: student.honors || false,
        points: student.points || 0
      }
    };

    return res.status(200).json({
      success: true,
      goals,
      date: today,
      ...(usingFallback && { 
        notice: 'Using demo data. Configure Google Sheets for full functionality.' 
      })
    });

  } catch (error) {
    console.error('Error checking goals:', error);
    // Return mock data even on error
    return res.status(200).json({
      success: true,
      goals: {
        dailyGoal: 10,
        sessionGoal: 100,
        brainlift: { completed: false, lastCompleted: null },
        dailyGoalCheck: { completed: false, lastCompleted: null },
        platforms: {
          x: { goal: 3, completed: 1, handle: '@student' },
          youtube: { goal: 2, completed: 1, handle: 'student_yt' },
          tiktok: { goal: 2, completed: 0, handle: '@student_tt' },
          instagram: { goal: 2, completed: 1, handle: 'student_ig' }
        },
        projectOneliner: 'Working on project',
        student: {
          id: parseInt(studentId),
          name: 'Student',
          email: 'student@alpha.school',
          honors: false,
          points: 100
        }
      },
      date: new Date().toISOString().split('T')[0],
      notice: 'Using fallback data due to error'
    });
  }
}