import { getAuth } from '../../../lib/auth';
const redisDB = require('../../../lib/redis-database');

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

    // Initialize Redis database
    const dbInitialized = await redisDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }

    // Generate email if not provided
    const studentEmail = email || `${firstName}.${lastName}@alpha.school`.toLowerCase();

    // Check if student already exists
    const existingStudent = await redisDB.getStudentByEmail(studentEmail);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists'
      });
    }

    // Create new student in Redis
    const newStudent = await redisDB.addStudent({
      email: studentEmail,
      password: password || 'Iloveschool',
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      honors: honors || false,
      house: groupId || (honors ? 'House 1' : 'House 2'),
      school: 'Alpha High School',
      status: 'active',
      points: 0
    });

    // Create initial profile in Redis
    await redisDB.updateProfile(newStudent.id, {
      studentId: newStudent.id,
      dailyGoal: '',
      sessionGoal: '',
      projectOneliner: '',
      brainliftCompleted: false,
      lastBrainliftDate: null,
      dailyGoalCompleted: false,
      lastDailyGoalDate: null,
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