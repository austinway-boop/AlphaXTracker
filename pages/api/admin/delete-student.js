import { getAuth } from '../../../lib/auth';
const sheetsDB = require('../../../lib/sheets-database');

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
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

    // Mark student as deleted in Google Sheets
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