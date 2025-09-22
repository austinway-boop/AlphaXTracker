# X (Twitter) API Setup Guide for AlphaXTracker

## Overview
This guide walks you through setting up the X (Twitter) API for real-time social media tracking in your AlphaXTracker system. Once configured, the system will automatically check student X accounts every hour and save the data to Google Sheets.

## ✅ What You Get
- **Real-time X post tracking** for all students
- **Automated hourly checks** (no manual work required)
- **Google Sheets integration** for data persistence and analysis
- **Comprehensive admin interface** for easy management
- **API key testing** to verify everything works
- **Fallback to simulated data** if API is unavailable

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get X API Access
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Apply for developer access (usually approved in 1-3 days)
3. Create a new app called "AlphaXTracker"
4. Get your **Bearer Token** from the "Keys and Tokens" tab

### Step 2: Configure in Admin Panel
1. Login to your AlphaXTracker admin dashboard
2. Go to **Settings** tab
3. Click **API Configuration**
4. Paste your Bearer Token in the "Twitter/X Bearer Token" field
5. Click **Test** to verify it works
6. Click **Save API Keys**

### Step 3: Enable Automation
1. In Settings, go to **Automation** tab
2. Check "Enable automatic social media checking"
3. Set check interval (recommend: Every hour)
4. Click **Update Settings**
5. Click **Run Manual Check Now** to test

## 🎯 That's It!
Your system will now automatically check all student X accounts every hour and save the data to Google Sheets. You can view the data in:
- **Students tab** - See individual student activity
- **Google Sheets** - Raw data in the "SocialMediaActivity" sheet
- **Leaderboard** - Compare student performance

## 📋 Detailed X API Setup Instructions

### Creating X Developer Account

1. **Visit Developer Portal**
   - Go to [developer.twitter.com](https://developer.twitter.com)
   - Sign in with your X account
   - Click "Apply for a developer account"

2. **Fill Application Form**
   - **Primary reason**: Educational/Research
   - **Use case description**: "Educational tool for tracking student social media posting goals and providing analytics for academic purposes"
   - **Will you make X content available to government entities?**: No
   - **Will you display X content off X?**: No (we only count posts)

3. **Wait for Approval**
   - Usually takes 1-3 business days
   - You'll receive an email when approved
   - Sometimes requires additional verification

### Creating Your App

1. **Create New App**
   - In the developer portal, click "Create App"
   - **App name**: "AlphaXTracker" (or your preferred name)
   - **Description**: "Educational social media tracking and analytics tool"
   - **Website URL**: Your school's website or GitHub repo
   - **Tell us how this app will be used**: "This app will track social media posting activity for educational purposes, helping students meet their content creation goals"

2. **Configure App Settings**
   - **App permissions**: Read only (default)
   - **Type of App**: Web App
   - **Callback URLs**: Not needed for Bearer Token authentication
   - **Website URL**: Your domain

### Getting Your Bearer Token

1. **Navigate to Keys and Tokens**
   - In your app dashboard, click "Keys and Tokens" tab
   - You'll see sections for different types of keys

2. **Generate Bearer Token**
   - In the "Bearer Token" section, click "Generate"
   - **Important**: Copy this token immediately - you won't be able to see it again
   - The token will look like: `AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BuSeid...`

3. **Store Securely**
   - Never commit this token to version control
   - Only paste it in the admin settings interface
   - The system will store it securely in Google Sheets

## 🔧 System Configuration

### Admin Settings Interface

The admin settings provide three main sections:

#### 1. API Configuration
- **Current Status**: Shows which APIs are connected
- **API Key Form**: Add/update your Bearer Token
- **Test Functionality**: Verify your token works
- **Multiple Platform Support**: Ready for YouTube, Instagram, TikTok

#### 2. Automation
- **Auto-Check Toggle**: Enable/disable automatic checking
- **Check Interval**: How often to check (30 min to 8 hours)
- **Manual Check**: Test the system immediately
- **Status Display**: Last check time and results

#### 3. Setup Instructions
- **Complete guides** for all social media platforms
- **Step-by-step instructions** with screenshots
- **Troubleshooting tips** for common issues
- **API cost information** and alternatives

### Google Sheets Integration

The system automatically creates these sheets in your Google Sheets database:

#### SocialMediaActivity Sheet
```
Date | Student ID | Student Name | House | Twitter Posts | YouTube Videos | TikTok Videos | Instagram Posts | Total Activity
```

#### Settings Sheet
```
Key | Value | Updated At
twitterApiKey | [encrypted] | 2025-09-21T18:00:00Z
autoCheckEnabled | true | 2025-09-21T18:00:00Z
checkInterval | 60 | 2025-09-21T18:00:00Z
lastAutoCheck | 2025-09-21T18:00:00Z | 2025-09-21T18:00:00Z
```

## ⚡ Automated Checking System

### How It Works

1. **Vercel Cron Job**: Runs every hour automatically
2. **Student Lookup**: Gets all students from Google Sheets
3. **Profile Check**: Loads each student's social media handles
4. **API Calls**: Checks X API for post counts (with caching)
5. **Data Storage**: Saves results to Google Sheets
6. **Error Handling**: Graceful fallback to simulated data

### Cron Configuration
```json
{
  "crons": [
    {
      "path": "/api/admin/auto-check",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Rate Limiting & Caching
- **5-minute cache** for API results
- **Automatic rate limit handling**
- **Graceful degradation** if API unavailable
- **Batch processing** for efficiency

## 🎛️ Advanced Configuration

### Environment Variables
Add these to your Vercel environment variables:
```bash
CRON_SECRET=your-secure-random-string
```

### API Quotas & Limits
- **X API v2**: 300 requests per 15 minutes (free tier)
- **Rate limit handling**: Built-in with exponential backoff
- **Cost**: Free tier usually sufficient for educational use
- **Upgrade**: Paid tiers available for higher limits

### Security Features
- **API keys encrypted** in Google Sheets
- **Admin authentication** required for all operations
- **Secure token handling** - never exposed to frontend
- **HTTPS only** for all API communications

## 🔍 Monitoring & Troubleshooting

### Admin Dashboard Monitoring
- **API Status**: Green/red indicators for each platform
- **Last Check Time**: When automation last ran
- **Error Reporting**: Failed checks and reasons
- **Manual Testing**: Run checks immediately

### Common Issues & Solutions

#### "Invalid API Key"
- Double-check your Bearer Token is correct
- Ensure no extra spaces or characters
- Verify your X app has proper permissions
- Check if your developer account is active

#### "Rate Limit Exceeded"
- Normal behavior - system will retry automatically
- Consider reducing check frequency
- Upgrade to paid X API tier if needed

#### "User Not Found"
- Student's X handle might be incorrect
- Check student profiles for typos
- Some accounts might be private/suspended

#### "No Students Found"
- Verify Google Sheets connection
- Check student data in "Students" sheet
- Ensure student profiles have X handles

### Logs & Debugging
- Check Vercel function logs for detailed errors
- Use "Run Manual Check" to test immediately
- Monitor Google Sheets for data updates
- Test individual API keys with built-in tester

## 📊 Data Analysis

### Available Data Points
- **Daily post counts** per platform per student
- **Historical trends** over time
- **House comparisons** and leaderboards
- **Goal completion rates**
- **Engagement patterns** by day of week

### Google Sheets Formulas
```excel
// Average posts per day for a student
=AVERAGE(E2:E31)

// Total weekly activity
=SUMIF(A:A,">="&TODAY()-7,I:I)

// Top performing house
=INDEX(D:D,MATCH(MAX(I:I),I:I,0))
```

### Export Options
- **CSV downloads** from Google Sheets
- **Chart creation** with Google Sheets charts
- **API endpoints** for custom dashboards
- **Real-time updates** via webhooks

## 🚀 Next Steps

### Additional Platforms
The system is ready for:
- **YouTube Data API** (free, easy setup)
- **Instagram Basic Display API** (free, complex OAuth)
- **TikTok API** (free, requires approval)

### Advanced Features
- **Custom posting goals** per student
- **Automated notifications** via Slack
- **Performance analytics** and insights
- **Gamification** with points and badges

### Scaling Up
- **Multiple schools** support
- **Bulk student import** from CSV
- **Advanced reporting** dashboards
- **API webhooks** for real-time updates

## 💡 Cost-Effective Alternative

If X API costs are a concern, the system includes:
- **Realistic simulation mode** for demonstrations
- **Pattern-based data generation** that mimics real behavior
- **Consistent historical data** for testing
- **Easy switching** between real and simulated data

This makes it perfect for:
- **Development and testing**
- **Budget-conscious deployments**
- **Demonstration purposes**
- **Educational environments**

## 📞 Support

Need help? The system includes:
- **Built-in testing tools** in the admin interface
- **Comprehensive error messages** with solutions
- **Step-by-step setup guides** for each platform
- **Troubleshooting section** for common issues

---

## ✅ Quick Checklist

- [ ] X developer account approved
- [ ] App created and configured
- [ ] Bearer Token generated and copied
- [ ] Token added to admin settings
- [ ] API connection tested successfully
- [ ] Automation enabled
- [ ] Manual check completed
- [ ] Google Sheets data verified
- [ ] Student profiles have X handles
- [ ] System monitoring set up

**Estimated setup time**: 15 minutes (after X API approval)
**Ongoing maintenance**: Zero - fully automated
**Cost**: Free for most educational use cases
