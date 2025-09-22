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
    // Initialize Sheets database
    const dbInitialized = await sheetsDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }

    // Reset all session goals in Google Sheets
    await sheetsDB.resetAllSessionGoals();

    return res.status(200).json({
      success: true,
      message: 'All session goals have been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting session goals:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting session goals'
    });
  }
}