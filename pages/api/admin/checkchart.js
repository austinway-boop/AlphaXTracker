const sheetsDB = require('../../../lib/sheets-database');
const { DEFAULT_STUDENTS, DEFAULT_PROFILES } = require('../../../lib/fallback-data');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let students = [];
    let usingFallback = false;

    // Try Google Sheets first
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        students = await sheetsDB.getAllStudents();
        
        // Get profiles for each student
        for (let student of students) {
          const profile = await sheetsDB.getProfile(student.id);
          if (profile) {
            student.profile = profile;
          }
        }
      }
    } catch (error) {
      console.log('Google Sheets unavailable, using fallback data');
      usingFallback = true;
    }

    // Use fallback data if needed
    if (!students || students.length === 0 || usingFallback) {
      students = DEFAULT_STUDENTS.map(student => ({
        ...student,
        profile: DEFAULT_PROFILES[student.id] || {}
      }));
      usingFallback = true;
    }

    // Format response
    const chartData = students.map(student => ({
      id: student.id,
      name: student.fullName || `${student.firstName} ${student.lastName}`,
      email: student.email,
      status: student.status || 'active',
      points: student.points || 0,
      dailyGoal: student.profile?.dailyGoal || 0,
      sessionGoal: student.profile?.sessionGoal || 0,
      brainliftCompleted: student.profile?.brainliftCompleted || false,
      dailyGoalCompleted: student.profile?.dailyGoalCompleted || false,
      projectOneliner: student.profile?.projectOneliner || '',
      lastActivity: student.lastActivity || null
    }));

    return res.status(200).json({
      success: true,
      students: chartData,
      totalStudents: chartData.length,
      ...(usingFallback && { 
        notice: 'Using demo data. Configure Google Sheets for full functionality.' 
      })
    });

  } catch (error) {
    console.error('Error in checkchart:', error);
    // Return fallback data even on error
    const fallbackData = DEFAULT_STUDENTS.map(student => ({
      id: student.id,
      name: student.fullName,
      email: student.email,
      status: student.status,
      points: student.points,
      dailyGoal: DEFAULT_PROFILES[student.id]?.dailyGoal || 0,
      sessionGoal: DEFAULT_PROFILES[student.id]?.sessionGoal || 0,
      brainliftCompleted: DEFAULT_PROFILES[student.id]?.brainliftCompleted || false,
      dailyGoalCompleted: DEFAULT_PROFILES[student.id]?.dailyGoalCompleted || false,
      projectOneliner: DEFAULT_PROFILES[student.id]?.projectOneliner || '',
      lastActivity: student.lastActivity
    }));

    return res.status(200).json({
      success: true,
      students: fallbackData,
      totalStudents: fallbackData.length,
      notice: 'Using demo data due to server error'
    });
  }
}