# Social Media API Integration Setup

This document explains how to set up real social media API integrations for accurate tracking.

## Current Implementation

The system currently uses realistic simulated data with caching to demonstrate functionality. To enable real tracking, follow the setup instructions for each platform below.

## Twitter/X API

### Setup Steps:
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a new app
3. Get your Bearer Token
4. Add to `.env.local`: `TWITTER_BEARER_TOKEN=your_token_here`

### API Implementation:
```javascript
// Use Twitter API v2
const response = await axios.get(
  `https://api.twitter.com/2/users/by/username/${username}/tweets`,
  {
    headers: {
      'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
    },
    params: {
      'start_time': `${date}T00:00:00Z`,
      'end_time': `${date}T23:59:59Z`,
      'max_results': 100
    }
  }
);
```

## YouTube Data API

### Setup Steps:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to `.env.local`: `YOUTUBE_API_KEY=your_key_here`

### API Implementation:
```javascript
// Get channel videos
const response = await axios.get(
  'https://www.googleapis.com/youtube/v3/search',
  {
    params: {
      part: 'snippet',
      channelId: channelId,
      publishedAfter: `${date}T00:00:00Z`,
      publishedBefore: `${date}T23:59:59Z`,
      maxResults: 50,
      key: process.env.YOUTUBE_API_KEY
    }
  }
);
```

## TikTok API

### Setup Steps:
1. Go to [developers.tiktok.com](https://developers.tiktok.com)
2. Apply for API access (requires approval)
3. Create an app
4. Get your API credentials
5. Add to `.env.local`: `TIKTOK_API_KEY=your_key_here`

### Note:
TikTok API requires approval and has strict rate limits. Consider using web scraping as an alternative for public profiles.

## Instagram Basic Display API

### Setup Steps:
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app
3. Add Instagram Basic Display product
4. Configure OAuth Redirect URIs
5. Submit for app review
6. Get user access tokens
7. Add to `.env.local`: `INSTAGRAM_ACCESS_TOKEN=user_token_here`

### API Implementation:
```javascript
// Get user's recent posts
const response = await axios.get(
  'https://graph.instagram.com/me/media',
  {
    params: {
      fields: 'id,timestamp',
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    }
  }
);

// Filter by date
const todayPosts = response.data.data.filter(post => {
  const postDate = new Date(post.timestamp).toISOString().split('T')[0];
  return postDate === date;
});
```

## Important Notes

### Rate Limiting
- All APIs have rate limits
- Implement caching to reduce API calls
- Current implementation caches results for 5 minutes

### Authentication
- Twitter: Bearer Token (Easy)
- YouTube: API Key (Easy)
- TikTok: OAuth 2.0 (Complex, requires approval)
- Instagram: User Access Token (Complex, requires user authorization)

### Costs
- Twitter API: Paid tiers for higher limits
- YouTube: Free tier usually sufficient
- TikTok: Free but requires approval
- Instagram: Free but requires app review

### Alternative Approaches

For platforms with complex authentication:
1. **Web Scraping**: Use puppeteer or playwright for public profiles
2. **RSS Feeds**: Some platforms provide RSS feeds
3. **Third-party Services**: Services like RapidAPI provide unified access

## Testing

To test with real APIs:
1. Add your API keys to `.env.local`
2. Update the `checkAllPlatforms` function in `/pages/api/goals/check/[studentId].js`
3. Replace the simulated data with real API calls
4. Test with: `curl http://localhost:3000/api/goals/check/9`

## Security

- **Never commit API keys** to version control
- Use environment variables for all secrets
- Implement rate limiting on your endpoints
- Consider using a proxy server for client-side calls
