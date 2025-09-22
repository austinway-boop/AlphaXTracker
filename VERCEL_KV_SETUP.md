# Vercel KV Storage Setup Guide

## What is Vercel KV?

Vercel KV is a serverless Redis database that's perfect for storing session data, goal completions, and other small data that needs to persist across deployments.

## Setup Instructions

### 1. Enable Vercel KV in Your Project

1. Go to your Vercel Dashboard
2. Navigate to your AlphaXTracker project
3. Click on the **"Storage"** tab
4. Click **"Create Database"**
5. Select **"KV"** (Redis-compatible)
6. Choose a name (e.g., "alphax-goals")
7. Select your preferred region
8. Click **"Create"**

### 2. Environment Variables

Once KV is created, Vercel automatically adds these environment variables to your project:

- `KV_REST_API_URL` - The URL for your KV database
- `KV_REST_API_TOKEN` - Authentication token
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only token (optional)

**These are added automatically! No manual setup needed.**

### 3. How It Works

The app now uses a 3-tier storage system:

```
1. Browser LocalStorage (Instant)
   ↓
2. Vercel KV Storage (Persistent)
   ↓
3. Google Sheets (Long-term backup)
```

### 4. Data Stored in Vercel KV

- **Goal Completions**: Daily goal and Brainlift status
- **Student Profiles**: Cached profile data
- **Points**: Total points earned today
- **Timestamps**: When goals were completed

### 5. Data Persistence

- **Goal data**: Expires after 24 hours (resets daily)
- **Profile data**: Expires after 7 days (cached for performance)
- **Automatic cleanup**: Old data is automatically removed

### 6. Testing Your Setup

After enabling KV, deploy your app and:

1. Log in as a student
2. Check a goal checkbox
3. Refresh the page - checkbox should stay checked
4. Check from a different browser - should still be checked!

### 7. Monitoring

View your KV usage in the Vercel Dashboard:
- Storage → Your KV Database → Analytics
- See reads, writes, and data stored

### 8. Benefits

✅ **No more lost checkboxes** - Data persists across deployments
✅ **Global performance** - Data is cached at edge locations
✅ **Automatic scaling** - Handles any number of students
✅ **Zero configuration** - Works immediately after enabling
✅ **Free tier included** - Generous limits for most use cases

### 9. Fallback Behavior

If Vercel KV is not configured:
- App falls back to in-memory storage (works locally)
- Google Sheets still works as backup if configured
- LocalStorage keeps working in browser

### 10. Troubleshooting

**Checkboxes not persisting?**
- Check Vercel Dashboard → Storage → Make sure KV is enabled
- Check Function Logs for any KV errors
- Redeploy after enabling KV

**Getting KV errors?**
- Make sure you're on a paid Vercel plan (KV requires Pro or higher for production)
- Check your KV usage limits in dashboard

## Cost

Vercel KV Free Tier includes:
- 30,000 requests per month
- 256 MB storage
- Perfect for this application!

For larger usage, see [Vercel KV Pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)
