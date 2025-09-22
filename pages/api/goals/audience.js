const sheetsDB = require('../../../lib/sheets-database');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'alphax-tracker-secret-key-2024');
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    const { studentId, platform, count } = req.body;

    // Check permissions - students can only update their own data
    if (decoded.role === 'student' && decoded.studentId !== parseInt(studentId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: You can only update your own data' 
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

    const today = new Date().toISOString().split('T')[0];

    // Get current profile to merge data
    const currentProfile = await sheetsDB.getProfile(studentId) || {};
    
    // Get today's existing goal history or create new entry
    const existingHistory = await sheetsDB.getGoalHistory(studentId, 1);
    const todayEntry = existingHistory.find(entry => entry.date === today) || {};

    // Update audience building data
    const audienceData = {
      audienceX: todayEntry.audienceX || 0,
      audienceYouTube: todayEntry.audienceYouTube || 0,
      audienceTikTok: todayEntry.audienceTikTok || 0,
      audienceInstagram: todayEntry.audienceInstagram || 0
    };

    // Update the specific platform
    switch (platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        audienceData.audienceX = Math.max(audienceData.audienceX, count);
        break;
      case 'youtube':
        audienceData.audienceYouTube = Math.max(audienceData.audienceYouTube, count);
        break;
      case 'tiktok':
        audienceData.audienceTikTok = Math.max(audienceData.audienceTikTok, count);
        break;
      case 'instagram':
        audienceData.audienceInstagram = Math.max(audienceData.audienceInstagram, count);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid platform. Must be x, youtube, tiktok, or instagram'
        });
    }

    // Add/update goal history entry with audience data
    await sheetsDB.addGoalHistory({
      studentId: parseInt(studentId),
      date: today,
      dailyGoal: currentProfile.dailyGoal || todayEntry.dailyGoal || '',
      dailyGoalCompleted: currentProfile.dailyGoalCompleted || todayEntry.dailyGoalCompleted || false,
      sessionGoal: currentProfile.sessionGoal || todayEntry.sessionGoal || '',
      projectOneliner: currentProfile.projectOneliner || todayEntry.projectOneliner || '',
      brainliftCompleted: currentProfile.brainliftCompleted || todayEntry.brainliftCompleted || false,
      ...audienceData
    });

    return res.status(200).json({
      success: true,
      message: `${platform} audience data updated successfully`,
      audienceData
    });

  } catch (error) {
    console.error('Error updating audience data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating audience data'
    });
  }
}
