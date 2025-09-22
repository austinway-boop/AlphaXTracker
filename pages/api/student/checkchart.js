const sheetsDB = require('../../../lib/sheets-database');
const { DEFAULT_STUDENTS, DEFAULT_PROFILES } = require('../../../lib/fallback-data');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
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

    // Format data for checkchart
    const checkchartData = students.map(student => {
      const profile = student.profile || {};
      return {
        id: student.id,
        name: student.fullName || `${student.firstName} ${student.lastName}`,
        email: student.email,
        status: student.honors ? 'Honors' : 'Regular',
        points: student.points || 0,
        dailyGoal: profile.dailyGoal || 10,
        sessionGoal: profile.sessionGoal || 100,
        brainliftCompleted: profile.brainliftCompleted || false,
        dailyGoalCompleted: profile.dailyGoalCompleted || false,
        projectOneliner: profile.projectOneliner || 'Working on project',
        lastActivity: student.lastActivity || null,
        platforms: {
          x: {
            goal: profile.goalX || 3,
            handle: profile.platformX || `@${student.firstName?.toLowerCase()}`
          },
          youtube: {
            goal: profile.goalYouTube || 2,
            handle: profile.platformYouTube || `${student.firstName?.toLowerCase()}_yt`
          },
          tiktok: {
            goal: profile.goalTikTok || 2,
            handle: profile.platformTikTok || `@${student.firstName?.toLowerCase()}`
          },
          instagram: {
            goal: profile.goalInstagram || 2,
            handle: profile.platformInstagram || `${student.firstName?.toLowerCase()}_ig`
          }
        }
      };
    });

    // Sort by points (highest first)
    checkchartData.sort((a, b) => b.points - a.points);

    return res.status(200).json({
      success: true,
      students: checkchartData,
      totalStudents: checkchartData.length,
      timestamp: new Date().toISOString(),
      ...(usingFallback && { 
        notice: 'Using demo data. Configure Google Sheets for full functionality.' 
      })
    });

  } catch (error) {
    console.error('Error in student checkchart:', error);
    // Return fallback data even on error
    const fallbackData = DEFAULT_STUDENTS.map(student => ({
      id: student.id,
      name: student.fullName,
      email: student.email,
      status: student.honors ? 'Honors' : 'Regular',
      points: student.points || 0,
      dailyGoal: DEFAULT_PROFILES[student.id]?.dailyGoal || 10,
      sessionGoal: DEFAULT_PROFILES[student.id]?.sessionGoal || 100,
      brainliftCompleted: false,
      dailyGoalCompleted: false,
      projectOneliner: DEFAULT_PROFILES[student.id]?.projectOneliner || 'Working on project',
      lastActivity: student.lastActivity,
      platforms: {
        x: { goal: 3, handle: `@${student.firstName.toLowerCase()}` },
        youtube: { goal: 2, handle: `${student.firstName.toLowerCase()}_yt` },
        tiktok: { goal: 2, handle: `@${student.firstName.toLowerCase()}` },
        instagram: { goal: 2, handle: `${student.firstName.toLowerCase()}_ig` }
      }
    }));

    return res.status(200).json({
      success: true,
      students: fallbackData.sort((a, b) => b.points - a.points),
      totalStudents: fallbackData.length,
      timestamp: new Date().toISOString(),
      notice: 'Using demo data due to server error'
    });
  }
}