const axios = require('axios');
const cheerio = require('cheerio');

// Cache for API results to avoid rate limiting
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(platform, handle, date) {
  return `${platform}:${handle}:${date}`;
}

function getCachedResult(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedResult(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Twitter/X tracking using API
async function checkTwitterPosts(handle, date, apiKey = null) {
  if (!handle) return 0;
  
  // Remove @ if present
  const username = handle.replace('@', '');
  const cacheKey = getCacheKey('twitter', username, date);
  
  const cached = getCachedResult(cacheKey);
  if (cached !== null) return cached;
  
  try {
    // Get API key from settings if not provided
    if (!apiKey) {
      const sheetsDB = require('./google-sheets');
      await sheetsDB.initialize();
      const settings = await sheetsDB.getSettings();
      apiKey = settings.twitterApiKey;
    }

    if (!apiKey) {
      // No API key available - return 0
      setCachedResult(cacheKey, 0);
      return 0;
    }

    // First get user ID
    const userResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 10000
    });

    if (!userResponse.data?.data?.id) {
      console.log(`Twitter user ${username} not found`);
      setCachedResult(cacheKey, 0);
      return 0;
    }

    const userId = userResponse.data.data.id;

    // Get tweets for the specific date
    const tweetsResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      params: {
        'start_time': `${date}T00:00:00Z`,
        'end_time': `${date}T23:59:59Z`,
        'max_results': 100
      },
      timeout: 10000
    });
    
    const count = tweetsResponse.data?.meta?.result_count || 0;
    setCachedResult(cacheKey, count);
    return count;
  } catch (error) {
    console.error('Error checking Twitter posts:', error.message);
    
    // If API error, return 0
    setCachedResult(cacheKey, 0);
    return 0;
  }
}

// YouTube tracking using YouTube Data API
async function checkYouTubePosts(channelHandle, date, apiKey = null) {
  if (!channelHandle) return 0;
  
  const handle = channelHandle.replace('@', '');
  const cacheKey = getCacheKey('youtube', handle, date);
  
  const cached = getCachedResult(cacheKey);
  if (cached !== null) return cached;
  
  try {
    // Get API key from settings if not provided
    if (!apiKey) {
      const sheetsDB = require('./google-sheets');
      await sheetsDB.initialize();
      const settings = await sheetsDB.getSettings();
      apiKey = settings.youtubeApiKey;
    }

    if (!apiKey) {
      // No API key available - return 0
      setCachedResult(cacheKey, 0);
      return 0;
    }

    // First, try to get channel ID from handle
    let channelId = null;
    
    // Try different methods to find the channel
    try {
      // Method 1: Search by channel name/handle
      const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: handle,
          type: 'channel',
          maxResults: 1,
          key: apiKey
        },
        timeout: 10000
      });
      
      channelId = channelResponse.data?.items?.[0]?.id?.channelId;
    } catch (searchError) {
      console.log(`YouTube channel search failed for ${handle}:`, searchError.message);
    }

    // Method 2: If handle starts with UC, it might be a channel ID
    if (!channelId && handle.startsWith('UC')) {
      channelId = handle;
    }

    // Method 3: Try with @ prefix if it's a new-style handle
    if (!channelId && !handle.startsWith('@')) {
      try {
        const handleResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: `@${handle}`,
            type: 'channel',
            maxResults: 1,
            key: apiKey
          },
          timeout: 10000
        });
        
        channelId = handleResponse.data?.items?.[0]?.id?.channelId;
      } catch (handleError) {
        console.log(`YouTube handle search failed for @${handle}:`, handleError.message);
      }
    }

    if (!channelId) {
      console.log(`YouTube channel not found for handle: ${handle}`);
      setCachedResult(cacheKey, 0);
      return 0;
    }
    
    // Get videos uploaded on the specific date
    const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        channelId: channelId,
        publishedAfter: `${date}T00:00:00Z`,
        publishedBefore: `${date}T23:59:59Z`,
        type: 'video',
        maxResults: 50,
        key: apiKey
      },
      timeout: 10000
    });
    
    const count = videosResponse.data?.items?.length || 0;
    setCachedResult(cacheKey, count);
    return count;
  } catch (error) {
    console.error('Error checking YouTube posts:', error.message);
    
    // If API error, return 0
    setCachedResult(cacheKey, 0);
    return 0;
  }
}

// TikTok tracking (requires approved API access)
async function checkTikTokPosts(username, date) {
  if (!username) return 0;
  
  const handle = username.replace('@', '');
  const cacheKey = getCacheKey('tiktok', handle, date);
  
  const cached = getCachedResult(cacheKey);
  if (cached !== null) return cached;
  
  // TikTok API requires OAuth and approval - not implemented
  // Return 0 until real API is configured
  setCachedResult(cacheKey, 0);
  return 0;
}

// Instagram tracking (requires Instagram Basic Display API)
async function checkInstagramPosts(username, date) {
  if (!username) return 0;
  
  const handle = username.replace('@', '');
  const cacheKey = getCacheKey('instagram', handle, date);
  
  const cached = getCachedResult(cacheKey);
  if (cached !== null) return cached;
  
  // Instagram API requires complex OAuth setup - not implemented
  // Return 0 until real API is configured
  setCachedResult(cacheKey, 0);
  return 0;
}

// Main function to check all platforms
async function checkAllPlatforms(platforms, date) {
  const results = {};
  
  if (platforms.x) {
    results.x = await checkTwitterPosts(platforms.x, date);
  } else {
    results.x = 0;
  }
  
  if (platforms.youtube) {
    results.youtube = await checkYouTubePosts(platforms.youtube, date);
  } else {
    results.youtube = 0;
  }
  
  if (platforms.tiktok) {
    results.tiktok = await checkTikTokPosts(platforms.tiktok, date);
  } else {
    results.tiktok = 0;
  }
  
  if (platforms.instagram) {
    results.instagram = await checkInstagramPosts(platforms.instagram, date);
  } else {
    results.instagram = 0;
  }
  
  return results;
}

// Export functions
module.exports = {
  checkAllPlatforms,
  checkTwitterPosts,
  checkYouTubePosts,
  checkTikTokPosts,
  checkInstagramPosts
};
