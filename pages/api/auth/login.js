import jwt from 'jsonwebtoken';
const sheetsDB = require('../../../lib/sheets-database');
const { DEFAULT_STUDENTS } = require('../../../lib/fallback-data');

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

    let student = null;
    let usingFallback = false;

    // Try Google Sheets first (if configured)
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        student = await sheetsDB.getStudentByEmail(emailLower);
        
        // Update last activity if found
        if (student && password === (student.password || 'Iloveschool')) {
          await sheetsDB.updateStudent(student.id, {
            lastActivity: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.log('Google Sheets not available, using fallback data');
      usingFallback = true;
    }

    // Fallback to default data if Google Sheets fails or student not found
    if (!student || usingFallback) {
      student = DEFAULT_STUDENTS.find(s => s.email.toLowerCase() === emailLower);
      usingFallback = true;
    }
    
    // Check student credentials
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
          loginTime: new Date().toISOString(),
          usingFallback: usingFallback
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
        },
        ...(usingFallback && { 
          notice: 'Using demo data. Configure Google Sheets for full functionality.' 
        })
      });
    }

    // Invalid credentials
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      hint: usingFallback ? 'Try Admin@Alpha.school / FutureOfEducation or any student email with password: Iloveschool' : undefined
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