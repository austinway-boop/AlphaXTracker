import { getAuth } from '../../../../lib/auth';
const sheetsDB = require('../../../../lib/sheets-database');

export default async function handler(req, res) {
  // Verify admin authentication
  const auth = await getAuth(req);
  if (!auth.loggedIn || auth.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }

  const { studentId } = req.query;

  // Initialize Sheets database
  const dbInitialized = await sheetsDB.initialize();
  if (!dbInitialized) {
    return res.status(500).json({
      success: false,
      message: 'Database initialization failed'
    });
  }

  if (req.method === 'GET') {
    try {
      // Get student data
      const student = await sheetsDB.getStudentById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get profile data
      const profile = await sheetsDB.getProfile(studentId);

      // Combine student and profile data
      const fullProfile = {
        ...student,
        ...profile,
        studentId: parseInt(studentId)
      };

      return res.status(200).json({
        success: true,
        profile: fullProfile
      });
    } catch (error) {
      console.error('Error fetching student profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching student profile'
      });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Separate student and profile updates
      const studentFields = ['email', 'password', 'firstName', 'lastName', 'fullName', 'honors', 'groupId', 'school', 'status', 'points'];
      const studentUpdates = {};
      const profileUpdates = {};

      Object.keys(updates).forEach(key => {
        if (studentFields.includes(key)) {
          studentUpdates[key] = updates[key];
        } else {
          profileUpdates[key] = updates[key];
        }
      });

      // Update student data if needed
      if (Object.keys(studentUpdates).length > 0) {
        await sheetsDB.updateStudent(studentId, studentUpdates);
      }

      // Update profile data
      await sheetsDB.updateProfile(studentId, profileUpdates);

      return res.status(200).json({
        success: true,
        message: 'Student profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating student profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating student profile'
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sheetsDB.deleteStudent(studentId);
      
      return res.status(200).json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting student'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}