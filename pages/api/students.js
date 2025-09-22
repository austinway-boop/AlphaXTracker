const sheetsDB = require('../../lib/sheets-database');
const { DEFAULT_STUDENTS } = require('../../lib/fallback-data');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    let allStudents = [];
    let usingFallback = false;
    
    // Try Google Sheets first
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        allStudents = await sheetsDB.getAllStudents();
      }
    } catch (error) {
      console.log('Google Sheets unavailable, using fallback data');
      usingFallback = true;
    }
    
    // Use fallback data if Sheets fails or returns empty
    if (!allStudents || allStudents.length === 0) {
      allStudents = DEFAULT_STUDENTS;
      usingFallback = true;
    }
    
    // Format response
    const formattedStudents = allStudents.map(student => ({
      id: student.id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: student.fullName || `${student.firstName} ${student.lastName}`,
      honors: student.honors || false,
      points: student.points || 0,
      status: student.status || 'active',
      lastActivity: student.lastActivity || null
    }));
    
    return res.status(200).json({
      success: true,
      students: formattedStudents,
      totalStudents: formattedStudents.length,
      ...(usingFallback && { 
        notice: 'Using demo data. Configure Google Sheets for full functionality.' 
      })
    });
    
  } catch (error) {
    console.error('Error fetching students:', error);
    // Even on error, return fallback data so the app works
    return res.status(200).json({
      success: true,
      students: DEFAULT_STUDENTS.map(student => ({
        id: student.id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: student.fullName,
        honors: student.honors || false,
        points: student.points || 0,
        status: student.status || 'active',
        lastActivity: student.lastActivity || null
      })),
      totalStudents: DEFAULT_STUDENTS.length,
      notice: 'Using demo data due to server error'
    });
  }
}