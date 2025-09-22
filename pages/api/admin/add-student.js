import { getAuth } from '../../../lib/auth';
const sheetsDB = require('../../../lib/sheets-database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Verify admin authentication
  const auth = await getAuth(req);
  if (!auth.loggedIn || auth.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }

  try {
    const { firstName, lastName, email, password, honors, groupId } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Initialize Sheets database
    const dbInitialized = await sheetsDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }

    // Generate email if not provided
    const studentEmail = email || `${firstName}.${lastName}@alpha.school`.toLowerCase();

    // Check if student already exists
    const existingStudent = await sheetsDB.getStudentByEmail(studentEmail);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists'
      });
    }

    // Create new student
    const newStudent = await sheetsDB.addStudent({
      email: studentEmail,
      password: password || 'Iloveschool',
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      honors: honors || false,
      groupId: groupId || null,
      school: 'Alpha High School',
      status: 'Active',
      points: 0
    });

    // Create initial profile
    await sheetsDB.updateProfile(newStudent.id, {
      studentId: newStudent.id,
      dailyGoal: '',
      sessionGoal: '',
      projectOneliner: '',
      brainliftCompleted: false,
      lastBrainliftDate: null,
      goals: { x: 0, youtube: 0, tiktok: 0, instagram: 0 },
      platforms: { x: '', youtube: '', tiktok: '', instagram: '' }
    });

    return res.status(200).json({
      success: true,
      message: 'Student added successfully',
      student: newStudent
    });
  } catch (error) {
    console.error('Error adding student:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding student'
    });
  }
}