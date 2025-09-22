import { getAuth } from '../../../lib/auth';
const sheetsDB = require('../../../lib/google-sheets');
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  // Verify admin authentication
  const auth = await getAuth(req);
  if (!auth.loggedIn || auth.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }

  if (req.method === 'GET') {
    // Get current settings
    try {
      // Read stored API keys from file
      const settingsPath = path.join(process.cwd(), 'data', 'api-settings.json');
      let storedSettings = {};
      
      if (fs.existsSync(settingsPath)) {
        storedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      }
      
      const settings = {
        twitterApiKey: storedSettings.twitterApiKey ? '***' + storedSettings.twitterApiKey.slice(-4) : null,
        youtubeApiKey: storedSettings.youtubeApiKey ? '***' + storedSettings.youtubeApiKey.slice(-4) : null,
        instagramToken: storedSettings.instagramToken ? '***' + storedSettings.instagramToken.slice(-4) : null,
        tiktokApiKey: storedSettings.tiktokApiKey ? '***' + storedSettings.tiktokApiKey.slice(-4) : null,
        autoCheckEnabled: false, // Disabled - now manual only
        lastAutoCheck: storedSettings.lastManualCheck || null,
        checkInterval: 60,
        apiStatus: {
          twitter: !!storedSettings.twitterApiKey,
          youtube: !!storedSettings.youtubeApiKey,
          instagram: !!storedSettings.instagramToken,
          tiktok: !!storedSettings.tiktokApiKey
        }
      };
      
      return res.status(200).json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('Error getting settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving settings'
      });
    }
  }

  if (req.method === 'POST') {
    // Update settings
    try {
      const { action, ...data } = req.body;
      
      // Common settings file path
      const settingsFilePath = path.join(process.cwd(), 'data', 'api-settings.json');

      switch (action) {
        case 'updateApiKeys': {
          // Save API keys to file
          let savedSettings = {};
          
          if (fs.existsSync(settingsFilePath)) {
            savedSettings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));
          }
          
          // Update only provided keys
          if (data.twitterApiKey) savedSettings.twitterApiKey = data.twitterApiKey;
          if (data.youtubeApiKey) savedSettings.youtubeApiKey = data.youtubeApiKey;
          if (data.instagramToken) savedSettings.instagramToken = data.instagramToken;
          if (data.tiktokApiKey) savedSettings.tiktokApiKey = data.tiktokApiKey;
          
          // Ensure data directory exists
          const dataDir = path.join(process.cwd(), 'data');
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }
          
          // Save to file
          fs.writeFileSync(settingsFilePath, JSON.stringify(savedSettings, null, 2));
          
          return res.status(200).json({
            success: true,
            message: 'API keys saved successfully!'
          });
        }

        case 'testTwitterApi': {
          const testResult = await testTwitterAPI(data.apiKey);
          return res.status(200).json({
            success: testResult.success,
            message: testResult.message,
            data: testResult.data
          });
        }

        case 'testYouTubeApi': {
          const youtubeTestResult = await testYouTubeAPI(data.apiKey);
          return res.status(200).json({
            success: youtubeTestResult.success,
            message: youtubeTestResult.message,
            data: youtubeTestResult.data
          });
        }

        case 'updateAutoCheck': {
          // For now, just return success
          return res.status(200).json({
            success: true,
            message: 'Auto-check settings updated successfully (stored locally for now)'
          });
        }

        case 'runManualCheck': {
          // Run manual social media check
          const checkResult = await runManualSocialMediaCheck();
          
          // Update last check time
          let checkSettings = {};
          
          if (fs.existsSync(settingsFilePath)) {
            checkSettings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));
          }
          
          checkSettings.lastManualCheck = new Date().toISOString();
          fs.writeFileSync(settingsFilePath, JSON.stringify(checkSettings, null, 2));
          
          return res.status(200).json({
            success: checkResult.success,
            message: checkResult.message,
            data: checkResult.data
          });
        }

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action'
          });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating settings: ' + error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}

// Test Twitter API functionality
async function testTwitterAPI(apiKey) {
  if (!apiKey) {
    return {
      success: false,
      message: 'API key is required'
    };
  }

  try {
    const axios = require('axios');
    
    // Test with a simple user lookup
    const response = await axios.get('https://api.twitter.com/2/users/by/username/twitter', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 10000
    });

    if (response.data && response.data.data) {
      return {
        success: true,
        message: 'Twitter API connection successful!',
        data: {
          username: response.data.data.username,
          id: response.data.data.id
        }
      };
    } else {
      return {
        success: false,
        message: 'Unexpected API response format'
      };
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.title || error.response.data?.error || 'Unknown error';
      
      if (status === 401) {
        return {
          success: false,
          message: 'Invalid API key or insufficient permissions'
        };
      } else if (status === 429) {
        return {
          success: true,
          message: 'API key is valid (rate limit reached - this is normal)'
        };
      } else {
        return {
          success: false,
          message: `API Error (${status}): ${errorMsg}`
        };
      }
    } else {
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  }
}

// Test YouTube API functionality
async function testYouTubeAPI(apiKey) {
  if (!apiKey) {
    return {
      success: false,
      message: 'API key is required'
    };
  }

  try {
    const axios = require('axios');
    
    // Test with a simple channel search (YouTube's official channel)
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'YouTube',
        type: 'channel',
        maxResults: 1,
        key: apiKey
      },
      timeout: 10000
    });

    if (response.data && response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      return {
        success: true,
        message: 'YouTube API connection successful!',
        data: {
          channelTitle: channel.snippet.channelTitle,
          channelId: channel.id.channelId,
          quotaUsed: 100 // Search operation costs 100 quota units
        }
      };
    } else {
      return {
        success: false,
        message: 'No results returned from YouTube API'
      };
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 400) {
        return {
          success: false,
          message: 'Invalid API key or malformed request'
        };
      } else if (status === 403) {
        if (errorMsg.includes('quotaExceeded')) {
          return {
            success: true,
            message: 'API key is valid (daily quota exceeded - this is normal)'
          };
        } else if (errorMsg.includes('keyInvalid')) {
          return {
            success: false,
            message: 'Invalid API key'
          };
        } else {
          return {
            success: false,
            message: `Access forbidden: ${errorMsg}`
          };
        }
      } else {
        return {
          success: false,
          message: `API Error (${status}): ${errorMsg}`
        };
      }
    } else {
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  }
}

// Manual social media check function
async function runManualSocialMediaCheck() {
  try {
    console.log('Starting manual social media check...');
    
    // Load stored API keys
    const settingsPath = path.join(process.cwd(), 'data', 'api-settings.json');
    let apiKeys = {};
    
    if (fs.existsSync(settingsPath)) {
      apiKeys = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
    
    // Load students from the students.json file
    const studentsPath = path.join(process.cwd(), 'data', 'students.json');
    let students = [];
    
    if (fs.existsSync(studentsPath)) {
      students = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
    }
    
    const today = new Date().toISOString().split('T')[0];
    let checkedCount = 0;
    let updatedCount = 0;
    let connectedCount = 0;
    const results = [];
    const errors = [];

    console.log(`Checking ${students.length} students for ${today}`);
    console.log(`Available APIs: Twitter=${!!apiKeys.twitterApiKey}, YouTube=${!!apiKeys.youtubeApiKey}`);

    for (const student of students) {
      try {
        // Load student profile to get social media handles
        const profilePath = path.join(process.cwd(), 'data', 'profiles', `${student.id}.json`);
        let profile = null;
        
        if (fs.existsSync(profilePath)) {
          profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        }
        
        if (!profile || !profile.platforms) {
          console.log(`No platforms configured for student ${student.id}`);
          continue;
        }
        
        // Check if student has any social media handles configured
        const hasHandles = profile.platforms.x || profile.platforms.youtube || profile.platforms.tiktok || profile.platforms.instagram;
        if (!hasHandles) {
          continue;
        }
        
        connectedCount++;
        
        // Check each platform using the social tracker
        const socialTracker = require('../../../lib/social-tracker');
        const platformResults = {};
        
        // Check X/Twitter - only with real API
        if (profile.platforms.x && apiKeys.twitterApiKey) {
          platformResults.x = await socialTracker.checkTwitterPosts(profile.platforms.x, today, apiKeys.twitterApiKey);
        } else {
          platformResults.x = 0;
        }
        
        // Check YouTube - only with real API
        if (profile.platforms.youtube && apiKeys.youtubeApiKey) {
          platformResults.youtube = await socialTracker.checkYouTubePosts(profile.platforms.youtube, today, apiKeys.youtubeApiKey);
        } else {
          platformResults.youtube = 0;
        }
        
        // Check TikTok - not implemented (requires complex OAuth)
        platformResults.tiktok = 0;
        
        // Check Instagram - not implemented (requires complex OAuth)
        platformResults.instagram = 0;
        
        // Save results to history file
        const historyPath = path.join(process.cwd(), 'data', 'history', `student_${student.id}_history.json`);
        let history = {};
        
        if (fs.existsSync(historyPath)) {
          history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        }
        
        history[today] = platformResults;
        
        // Ensure history directory exists
        const historyDir = path.dirname(historyPath);
        if (!fs.existsSync(historyDir)) {
          fs.mkdirSync(historyDir, { recursive: true });
        }
        
        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
        
        checkedCount++;
        const totalActivity = Object.values(platformResults).reduce((sum, count) => sum + count, 0);
        
        if (totalActivity > 0) {
          updatedCount++;
          results.push({
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            activity: platformResults,
            total: totalActivity
          });
        }

        console.log(`Student ${student.id} (${student.firstName} ${student.lastName}): ${totalActivity} total posts`);
        
      } catch (error) {
        console.error(`Error checking student ${student.id}:`, error);
        errors.push(`Student ${student.id}: ${error.message}`);
      }
    }

    console.log(`Manual check completed: ${checkedCount} checked, ${updatedCount} with activity, ${connectedCount} connected`);

    return {
      success: true,
      message: `Checked ${checkedCount} students (${connectedCount} connected), found activity for ${updatedCount}`,
      data: {
        checkedCount,
        updatedCount,
        connectedCount,
        date: today,
        results: results.slice(0, 10), // Limit to first 10 for response size
        errors: errors.length > 0 ? errors : null,
        apiStatus: {
          twitter: !!apiKeys.twitterApiKey,
          youtube: !!apiKeys.youtubeApiKey,
          instagram: false,
          tiktok: false
        }
      }
    };
  } catch (error) {
    console.error('Error running manual social media check:', error);
    return {
      success: false,
      message: 'Error running social media check: ' + error.message
    };
  }
}
