import { getAuth } from '../../../../lib/auth';
const redisDB = require('../../../../lib/redis-database');

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
  const studentIdNum = parseInt(studentId);

  // Initialize Redis database
  const dbInitialized = await redisDB.initialize();
  if (!dbInitialized) {
    return res.status(500).json({
      success: false,
      message: 'Database initialization failed'
    });
  }

  if (req.method === 'GET') {
    try {
      // Get student data from Redis
      const student = await redisDB.getStudentById(studentIdNum);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get profile data from Redis
      const profile = await redisDB.getProfile(studentIdNum);

      // Get today's goals
      const todayGoals = await redisDB.getTodayGoals(studentIdNum);

      // Combine student, profile, and today's goals data
      const fullProfile = {
        ...student,
        ...profile,
        // Override with today's completion status
        brainliftCompleted: todayGoals.brainliftCompleted || false,
        dailyGoalCompleted: todayGoals.dailyGoalCompleted || false,
        studentId: studentIdNum
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
        await redisDB.updateStudent(studentIdNum, studentUpdates);
      }

      // Update profile data
      if (Object.keys(profileUpdates).length > 0) {
        await redisDB.updateProfile(studentIdNum, profileUpdates);
      }

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
      await redisDB.deleteStudent(studentIdNum);
      
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