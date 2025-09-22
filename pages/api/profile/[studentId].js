const sheetsDB = require('../../../lib/sheets-database');
const { DEFAULT_STUDENTS, DEFAULT_PROFILES } = require('../../../lib/fallback-data');

export default async function handler(req, res) {
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
    console.log('Google Sheets unavailable, using fallback data');
    usingFallback = true;
  }

  // Use fallback data if Sheets fails
  if (!profile || !student || usingFallback) {
    const studentIdNum = parseInt(studentId);
    profile = DEFAULT_PROFILES[studentIdNum];
    student = DEFAULT_STUDENTS.find(s => s.id === studentIdNum);
    usingFallback = true;
  }

  if (!profile || !student) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  return res.status(200).json({
    success: true,
    profile: {
      ...profile,
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
}