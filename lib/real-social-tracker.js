const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Directory to store historical data
const HISTORY_DIR = path.join(process.cwd(), 'data', 'history');

// Ensure history directory exists
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

// Get historical data file path for a student
function getHistoryFilePath(studentId) {
  return path.join(HISTORY_DIR, `student_${studentId}_history.json`);
}

// Load historical data for a student
function loadHistoricalData(studentId) {
  const filePath = getHistoryFilePath(studentId);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return {};
}

// Save historical data for a student
function saveHistoricalData(studentId, data) {
  const filePath = getHistoryFilePath(studentId);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// REAL YouTube tracking using RSS feeds (NO API NEEDED!)
async function checkYouTubePostsReal(channelHandle, date) {
  if (!channelHandle) return 0;
  
  let handle = channelHandle.replace('@', '').trim();
  
  try {
    // Try multiple RSS feed formats
    const rssUrls = [
      `https://www.youtube.com/feeds/videos.xml?channel_id=${handle}`, // If it's a channel ID
      `https://www.youtube.com/feeds/videos.xml?user=${handle}`, // If it's a username
      `https://www.youtube.com/feeds/videos.xml?handle=@${handle}` // If it's a handle
    ];
    
    let videoCount = 0;
    const targetDate = new Date(date).toDateString();
    
    for (const rssUrl of rssUrls) {
      try {
        console.log(`Checking YouTube RSS: ${rssUrl}`);
        const response = await axios.get(rssUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.data) {
          const $ = cheerio.load(response.data, { xmlMode: true });
          const entries = $('entry');
          
          entries.each((i, entry) => {
            const published = $(entry).find('published').text();
            if (published) {
              const videoDate = new Date(published).toDateString();
              if (videoDate === targetDate) {
                videoCount++;
                const title = $(entry).find('title').text();
                console.log(`Found video on ${date}: ${title}`);
              }
            }
          });
          
          if (entries.length > 0) {
            // Found valid RSS feed, stop trying others
            break;
          }
        }
      } catch (err) {
        // Try next RSS format
        continue;
      }
    }
    
    // If no RSS worked, try scraping the channel page directly
    if (videoCount === 0 && handle) {
      try {
        const channelUrl = handle.startsWith('UC') ? 
          `https://www.youtube.com/channel/${handle}` : 
          `https://www.youtube.com/@${handle}`;
        
        console.log(`Trying to scrape YouTube channel: ${channelUrl}`);
        
        const response = await axios.get(channelUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        // YouTube page scraping is complex
        // Without RSS feed working, we can't get real data
        // Return 0 to indicate no data available
        if (response.data && response.data.includes('channelId')) {
          console.log('Channel exists but cannot get real post data without RSS/API');
        }
      } catch (err) {
        console.log(`Could not scrape YouTube channel: ${err.message}`);
      }
    }
    
    return videoCount;
  } catch (error) {
    console.error('Error checking YouTube:', error.message);
    // Return 0 if we can't check
    return 0;
  }
}

// Twitter/X tracking using Nitter instances (public Twitter viewers)
async function checkTwitterPostsReal(handle, date) {
  if (!handle) return 0;
  
  const username = handle.replace('@', '').toLowerCase();
  
  try {
    // Try Nitter instances (public Twitter mirrors)
    const nitterInstances = [
      'nitter.net',
      'nitter.42l.fr',
      'nitter.pussthecat.org',
      'nitter.fdn.fr',
      'nitter.1d4.us'
    ];
    
    let tweetCount = 0;
    const targetDate = new Date(date).toDateString();
    
    for (const instance of nitterInstances) {
      try {
        const url = `https://${instance}/${username}`;
        console.log(`Checking Twitter via ${instance}`);
        
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.data) {
          const $ = cheerio.load(response.data);
          
          // Look for tweet timestamps
          $('.timeline-item .tweet-date').each((i, elem) => {
            const tweetDate = $(elem).attr('title');
            if (tweetDate && new Date(tweetDate).toDateString() === targetDate) {
              tweetCount++;
            }
          });
          
          if (tweetCount > 0) {
            break; // Found tweets, stop checking other instances
          }
        }
      } catch (err) {
        // Try next instance
        continue;
      }
    }
    
    // If we couldn't check, return 0 (no data available)
    return tweetCount;
  } catch (error) {
    console.error('Error checking Twitter:', error.message);
    // Return 0 if we can't check
    return 0;
  }
}

// TikTok tracking (limited without API, but we can try)
async function checkTikTokPostsReal(username, date) {
  if (!username) return 0;
  
  const handle = username.replace('@', '');
  
  try {
    // TikTok web scraping is heavily restricted
    // We can try to access the profile page
    const url = `https://www.tiktok.com/@${handle}`;
    console.log(`Checking TikTok: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.data && response.data.includes(handle)) {
      // Profile exists, but we can't get real data without API
      // Return 0 to indicate no data available
      return 0;
    }
  } catch (error) {
    console.log('TikTok check failed, no data available');
  }
  
  // No data available
  return 0;
}

// Instagram tracking (very limited without API)
async function checkInstagramPostsReal(username, date) {
  if (!username) return 0;
  
  const handle = username.replace('@', '');
  
  try {
    // Instagram heavily blocks scraping
    // We can try bibliogram instances (Instagram viewers)
    const bibliogramInstances = [
      'bibliogram.art',
      'bibliogram.snopyta.org'
    ];
    
    for (const instance of bibliogramInstances) {
      try {
        const url = `https://${instance}/u/${handle}`;
        console.log(`Checking Instagram via ${instance}`);
        
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.data) {
          // Parse for post dates if available
          const $ = cheerio.load(response.data);
          // Look for post timestamps
          // This is limited as Instagram blocks most scraping
        }
      } catch (err) {
        continue;
      }
    }
  } catch (error) {
    console.log('Instagram check failed, no data available');
  }
  
  // No data available
  return 0;
}

// Main function to check all platforms for a specific date
async function checkAllPlatformsForDate(platforms, date, studentId) {
  // Load historical data
  const history = loadHistoricalData(studentId);
  
  // Check if we already have data for this date
  if (history[date]) {
    console.log(`Using cached data for ${date}`);
    return history[date];
  }
  
  console.log(`Checking real social media activity for ${date}`);
  
  // Check each platform with real methods where possible
  const results = {
    x: 0,
    youtube: 0,
    tiktok: 0,
    instagram: 0
  };
  
  // Check YouTube (REAL RSS FEEDS!)
  if (platforms?.youtube) {
    results.youtube = await checkYouTubePostsReal(platforms.youtube, date);
    console.log(`YouTube posts for ${platforms.youtube} on ${date}: ${results.youtube}`);
  }
  
  // Check Twitter/X
  if (platforms?.x) {
    results.x = await checkTwitterPostsReal(platforms.x, date);
    console.log(`Twitter posts for ${platforms.x} on ${date}: ${results.x}`);
  }
  
  // Check TikTok
  if (platforms?.tiktok) {
    results.tiktok = await checkTikTokPostsReal(platforms.tiktok, date);
    console.log(`TikTok posts for ${platforms.tiktok} on ${date}: ${results.tiktok}`);
  }
  
  // Check Instagram
  if (platforms?.instagram) {
    results.instagram = await checkInstagramPostsReal(platforms.instagram, date);
    console.log(`Instagram posts for ${platforms.instagram} on ${date}: ${results.instagram}`);
  }
  
  // Save to history
  history[date] = results;
  saveHistoricalData(studentId, history);
  
  return results;
}

// Get historical data for a date range
async function getHistoricalData(studentId, platforms, startDate, endDate) {
  const history = loadHistoricalData(studentId);
  const results = {};
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    if (!history[dateStr]) {
      // Generate data for this date if not exists
      history[dateStr] = await checkAllPlatformsForDate(platforms, dateStr, studentId);
    }
    
    results[dateStr] = history[dateStr];
  }
  
  // Save updated history
  saveHistoricalData(studentId, history);
  
  return results;
}

// Test function to check a real YouTube channel
async function testYouTube() {
  // Test with a known YouTube channel
  const testChannels = [
    'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast channel ID
    'MrBeast', // Username
    '@MrBeast' // Handle
  ];
  
  const today = new Date().toISOString().split('T')[0];
  
  for (const channel of testChannels) {
    console.log(`\nTesting YouTube channel: ${channel}`);
    const count = await checkYouTubePostsReal(channel, today);
    console.log(`Videos posted today: ${count}`);
  }
}

// Export functions
module.exports = {
  checkAllPlatformsForDate,
  getHistoricalData,
  checkYouTubePostsReal,
  checkTwitterPostsReal,
  checkTikTokPostsReal,
  checkInstagramPostsReal,
  testYouTube
};
