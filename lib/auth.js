import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'alphax-tracker-secret-key-2024';

export async function getAuth(req) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        loggedIn: false,
        role: null,
        userId: null,
        studentId: null
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      return {
        loggedIn: true,
        role: decoded.role || 'student',
        userId: decoded.userId || decoded.studentId,
        studentId: decoded.studentId || decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        honors: decoded.honors || false
      };
    } catch (error) {
      // Invalid or expired token
      return {
        loggedIn: false,
        role: null,
        userId: null,
        studentId: null
      };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      loggedIn: false,
      role: null,
      userId: null,
      studentId: null
    };
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
