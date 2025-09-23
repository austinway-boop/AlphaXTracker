import jwt from 'jsonwebtoken';
const redisDB = require('../../../lib/redis-database');

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'Admin@Alpha.school',
  password: 'FutureOfEducation',
  role: 'admin'
};

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'alphax-tracker-secret-key-2024';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const emailLower = email.toLowerCase();

    // Check admin credentials FIRST (always works)
    if (emailLower === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
      // Generate JWT token for admin
      const token = jwt.sign(
        { 
          email: email,
          role: ADMIN_CREDENTIALS.role,
          loginTime: new Date().toISOString()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        role: ADMIN_CREDENTIALS.role,
        user: {
          email: email,
          role: ADMIN_CREDENTIALS.role
        }
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

    // Find student by email in Redis
    const student = await redisDB.getStudentByEmail(emailLower);
    
    // Update last activity if found and password matches
    if (student && password === (student.password || 'Iloveschool')) {
      await redisDB.updateStudent(student.id, {
        lastActivity: new Date().toISOString()
      });
    }
    
    // Check student credentials
    if (student && password === (student.password || 'Iloveschool')) {
      // Ensure student has a profile (create if doesn't exist)
      let profile = await redisDB.getProfile(student.id);
      if (!profile || Object.keys(profile).length === 0) {
        console.log(`[Login] Creating initial profile for student ${student.id}`);
        profile = await redisDB.updateProfile(student.id, {
          studentId: student.id,
          dailyGoal: '',
          sessionGoal: '',
          projectOneliner: '',
          brainliftCompleted: false,
          lastBrainliftDate: null,
          dailyGoalCompleted: false,
          lastDailyGoalDate: null,
          goals: { x: 0, youtube: 0, tiktok: 0, instagram: 0 },
          platforms: { x: '', youtube: '', tiktok: '', instagram: '' },
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Generate JWT token for student
      const token = jwt.sign(
        { 
          email: student.email,
          role: 'student',
          userId: student.id,
          studentId: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          honors: student.honors || false,
          loginTime: new Date().toISOString()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        role: 'student',
        user: {
          id: student.id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: student.fullName,
          role: 'student',
          honors: student.honors || false
        }
      });
    }

    // Invalid credentials
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}