import jwt from 'jsonwebtoken';
const sheetsDB = require('../../../lib/sheets-database');

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
    // Initialize Sheets database
    const dbInitialized = await sheetsDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed. Please check Google Sheets configuration.'
      });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const emailLower = email.toLowerCase();

    // Check admin credentials
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

    // Check Google Sheets for student credentials
    const student = await sheetsDB.getStudentByEmail(emailLower);
    
    if (student && password === (student.password || 'Iloveschool')) {
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

      // Update last activity
      await sheetsDB.updateStudent(student.id, {
        lastActivity: new Date().toISOString()
      });

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
      message: 'Internal server error'
    });
  }
}