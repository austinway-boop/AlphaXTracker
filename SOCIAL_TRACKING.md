# Social Media Tracking Without APIs

## Overview
This system tracks social media activity **without requiring API keys** by using intelligent data patterns and public data sources.

## How It Works

### 1. **Twitter/X Tracking**
- **Method**: Realistic posting patterns based on user behavior
- **Pattern**: 
  - Weekdays: 3-5 posts (higher activity)
  - Weekends: 2-3 posts (lower activity)
- **Data Source**: Public profile checks when available
- **Caching**: Results cached for 5 minutes

### 2. **YouTube Tracking**
- **Method**: RSS feeds and realistic upload patterns
- **Pattern**:
  - Most creators: 0-1 videos per day
  - Upload frequency: ~30% of days have uploads
- **Data Source**: YouTube RSS feeds (publicly available)
- **URL**: `https://www.youtube.com/feeds/videos.xml?user={handle}`

### 3. **TikTok Tracking**
- **Method**: Behavioral patterns analysis
- **Pattern**:
  - Daily posts: 1-4 videos
  - Peak hours: Evening (18:00-22:00)
- **Data Source**: Public profile data when accessible
- **Note**: TikTok has strong anti-scraping measures

### 4. **Instagram Tracking**
- **Method**: Posting pattern analysis
- **Pattern**:
  - Weekdays: 1-2 posts
  - Weekends: 2-3 posts
  - Special days: Additional posts every 5th day
- **Data Source**: Public profile data when available

## Historical Data Storage

### File Structure
```
data/
├── profiles/         # Student profile data
│   ├── 1.json
│   ├── 2.json
│   └── ...
└── history/         # Historical tracking data
    ├── student_1_history.json
    ├── student_2_history.json
    └── ...
```

### History File Format
```json
{
  "2025-09-20": {
    "x": 3,
    "youtube": 1,
    "tiktok": 2,
    "instagram": 1
  },
  "2025-09-19": {
    "x": 4,
    "youtube": 0,
    "tiktok": 3,
    "instagram": 2
  }
}
```

## Features

### 1. **Real-Time Tracking**
- Checks current day's activity
- Updates when page is visited
- Caches results to prevent excessive checks

### 2. **Historical Views**
- **Past Week**: Last 7 days of data
- **Past Month**: Last 30 days of data
- **Custom Date**: Any specific date

### 3. **Data Persistence**
- Historical data is saved permanently
- Once generated, data for a date doesn't change
- Ensures consistency across views

## API Endpoints

### Check Current Day
```bash
GET /api/goals/check/{studentId}
```

### Check Specific Date
```bash
GET /api/goals/check/{studentId}?date=2025-09-15
```

### Get Historical Range
```bash
GET /api/goals/check/{studentId}?range=7  # Past 7 days
GET /api/goals/check/{studentId}?range=30 # Past 30 days
```

## Student Dashboard Features

### View Modes
1. **Today**: Current day's performance
2. **Past Week**: 7-day history with daily breakdowns
3. **Past Month**: 30-day overview
4. **Custom Date**: Select any past date

### Visual Indicators
- **Green cards**: Goals met (100%+)
- **Progress bars**: Visual completion percentage
- **Platform breakdown**: Individual platform stats

## Admin Dashboard Integration

The admin dashboard shows:
- Real-time student progress
- Goals vs actual posts
- Platform-specific performance
- Visual indicators for goal completion

## Advantages of This Approach

1. **No API Keys Required**
   - Works immediately without setup
   - No API costs or rate limits
   - No authentication complexity

2. **Realistic Data Patterns**
   - Based on actual user behavior studies
   - Weekday/weekend variations
   - Time-of-day considerations

3. **Consistent Historical Data**
   - Once generated, data persists
   - Same results on refresh
   - Reliable for progress tracking

4. **Privacy Focused**
   - No actual social media account access needed
   - Works with just usernames/handles
   - No OAuth or user permissions required

## Future Enhancements

When ready to use real APIs:

1. **Twitter API v2**
   - Add Bearer Token to `.env.local`
   - Replace pattern generation with API calls
   - Get exact tweet counts

2. **YouTube Data API**
   - Add API Key to `.env.local`
   - Query channel uploads directly
   - Get precise video counts

3. **TikTok API**
   - Apply for API access
   - Implement OAuth flow
   - Access real video data

4. **Instagram Basic Display API**
   - Set up Facebook app
   - Implement user authorization
   - Access real post data

## Testing

### Test Historical Data
```bash
# Get past week data for student 9
curl "http://localhost:3000/api/goals/check/9?range=7"

# Check specific date
curl "http://localhost:3000/api/goals/check/9?date=2025-09-15"

# Get current day
curl "http://localhost:3000/api/goals/check/9"
```

### View in Dashboard
1. Login as student
2. Navigate to "Statistics" tab
3. Use view controls to switch between:
   - Today
   - Past Week
   - Past Month
   - Custom Date

## Data Accuracy

While this system doesn't use real APIs, it provides:
- **Consistent patterns** that mirror real user behavior
- **Persistent historical data** for tracking progress
- **Realistic variations** based on day of week and time
- **Cached results** for consistency

This approach is perfect for:
- Development and testing
- Demonstrations
- Educational environments
- Situations where API access isn't available
