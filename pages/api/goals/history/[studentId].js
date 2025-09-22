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
    let student = null;
    let usingFallback = false;

    // Try Google Sheets first
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        student = await sheetsDB.getStudent(studentIdNum);
      }
    } catch (error) {
      console.log('Google Sheets unavailable, using fallback');
      usingFallback = true;
    }

    // Use fallback data if needed
    if (!student || usingFallback) {
      student = DEFAULT_STUDENTS.find(s => s.id === studentIdNum);
      usingFallback = true;
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Generate mock history data (last 30 days)
    const history = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate random but consistent data based on date
      const seed = studentIdNum + i;
      const completed = {
        brainlift: (seed % 3) > 0,
        dailyGoal: (seed % 2) === 0,
        x: Math.min(seed % 4, 3),
        youtube: Math.min(seed % 3, 2),
        tiktok: Math.min(seed % 3, 2),
        instagram: Math.min(seed % 3, 2)
      };
      
      history.push({
        date: dateStr,
        completed,
        points: completed.brainlift ? 10 : 0 + completed.dailyGoal ? 5 : 0,
        totalPoints: student.points - (i * 5) // Simulate gradual point accumulation
      });
    }

    return res.status(200).json({
      success: true,
      studentId: studentIdNum,
      studentName: student.fullName,
      history,
      summary: {
        totalDays: 30,
        brainliftCompletions: history.filter(h => h.completed.brainlift).length,
        dailyGoalCompletions: history.filter(h => h.completed.dailyGoal).length,
        currentStreak: Math.floor(Math.random() * 7) + 1,
        longestStreak: Math.floor(Math.random() * 15) + 5,
        totalPoints: student.points || 0
      },
      ...(usingFallback && { 
        notice: 'Using demo data. Configure Google Sheets for full functionality.' 
      })
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