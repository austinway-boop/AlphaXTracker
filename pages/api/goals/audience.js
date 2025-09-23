const redisDB = require('../../../lib/redis-database');
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

    // Initialize Redis database
    const dbInitialized = await redisDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's goals from Redis
    const todayGoals = await redisDB.getTodayGoals(studentId) || {};

    // Update audience building data
    const audienceData = todayGoals.audienceGoals || {
      x: 0,
      youtube: 0,
      tiktok: 0,
      instagram: 0
    };

    // Update the specific platform
    switch (platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        audienceData.x = Math.max(audienceData.x, count);
        break;
      case 'youtube':
        audienceData.youtube = Math.max(audienceData.youtube, count);
        break;
      case 'tiktok':
        audienceData.tiktok = Math.max(audienceData.tiktok, count);
        break;
      case 'instagram':
        audienceData.instagram = Math.max(audienceData.instagram, count);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid platform. Must be x, youtube, tiktok, or instagram'
        });
    }

    // Update today's goals with new audience data
    await redisDB.updateTodayGoals(studentId, {
      audienceGoals: audienceData
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
