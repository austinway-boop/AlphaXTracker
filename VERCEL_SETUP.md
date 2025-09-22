# Vercel Deployment Setup Guide

This guide will help you deploy AlphaXTracker to Vercel with all required environment variables and secrets properly configured.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. Your various API credentials ready

## Method 1: Deploy via Vercel CLI (Recommended)

### Step 1: Initial Deployment

```bash
cd /path/to/AlphaXTracker
vercel
```

Follow the prompts to link to your Vercel account and project.

### Step 2: Set Environment Variables

You can set environment variables using the Vercel CLI:

```bash
# Set secrets (sensitive data)
vercel secrets add slack_bot_token "xoxb-your-bot-token"
vercel secrets add slack_refresh_token "xoxe-your-refresh-token"
vercel secrets add slack_client_id "your-client-id"
vercel secrets add slack_client_secret "your-client-secret"

# Set environment variables
vercel env add JWT_SECRET
vercel env add GOOGLE_SHEET_ID
vercel env add GOOGLE_SHEETS_CREDENTIALS
vercel env add TWITTER_BEARER_TOKEN
```

## Method 2: Deploy via Vercel Dashboard

### Step 1: Import Project

1. Go to https://vercel.com/new
2. Import your GitHub repository: `https://github.com/austinway-boop/AlphaXTracker`
3. Select the repository and click "Import"

### Step 2: Configure Environment Variables

Before deploying, add all environment variables in the Vercel dashboard:

1. In your project settings, go to "Settings" → "Environment Variables"
2. Add the following variables:

#### Required Variables

| Variable Name | Description | How to Get |
|--------------|-------------|------------|
| `JWT_SECRET` | Authentication secret | Generate a strong random string (e.g., use `openssl rand -base64 32`) |
| `GOOGLE_SHEET_ID` | Your Google Sheet ID | From your sheet URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit` |
| `GOOGLE_SHEETS_CREDENTIALS` | Service account JSON | From Google Cloud Console (see below) |

#### Slack Integration (Required for Slack features)

| Variable Name | Description | How to Get |
|--------------|-------------|------------|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token | From https://api.slack.com/apps → OAuth & Permissions |
| `SLACK_REFRESH_TOKEN` | OAuth Refresh Token | From OAuth flow |
| `SLACK_CLIENT_ID` | App Client ID | From Basic Information in Slack App |
| `SLACK_CLIENT_SECRET` | App Client Secret | From Basic Information in Slack App |

#### Social Media APIs (Optional but recommended)

| Variable Name | Description | How to Get |
|--------------|-------------|------------|
| `TWITTER_BEARER_TOKEN` | X/Twitter API Bearer Token | From https://developer.twitter.com |
| `YOUTUBE_API_KEY` | YouTube Data API Key | From Google Cloud Console |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Basic Display Token | From Facebook Developers |
| `TIKTOK_API_KEY` | TikTok API Key | Requires API approval from TikTok |

### Step 3: Fix the Current Error

Since you're getting the error about `SLACK_BOT_TOKEN`, you have two options:

#### Option A: Add Slack Integration (Recommended)

1. Create a Slack App at https://api.slack.com/apps
2. Get your Bot Token from "OAuth & Permissions"
3. In Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Add `SLACK_BOT_TOKEN` with your token value
   - Add other Slack variables as well

#### Option B: Temporarily Disable Slack (Quick Fix)

1. Modify `vercel.json` to remove Slack references:

```json
{
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

2. Comment out Slack initialization in `/lib/slack.js`:

```javascript
// const slack = new WebClient(process.env.SLACK_BOT_TOKEN || 'dummy-token');
```

## Getting Google Sheets Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Create new service account
   - Download JSON key file
5. Copy the entire JSON content
6. In Vercel, add it as `GOOGLE_SHEETS_CREDENTIALS` (paste the entire JSON as a string)

## Getting Slack Tokens

1. Create a Slack App at https://api.slack.com/apps
2. Add OAuth Scopes:
   - `chat:write`
   - `users:read`
   - `channels:read`
3. Install to your workspace
4. Copy the Bot User OAuth Token (starts with `xoxb-`)
5. For refresh token, you'll need to implement OAuth flow

## Deployment Command

After setting all environment variables:

```bash
# Deploy to production
vercel --prod

# Or just deploy to preview
vercel
```

## Troubleshooting

### Error: Secret does not exist

This means the environment variable is configured to use a Vercel secret that hasn't been created yet. Either:
1. Create the secret using `vercel secrets add`
2. Or add the environment variable directly in the dashboard

### Error: Google Sheets not accessible

Make sure to:
1. Share your Google Sheet with the service account email
2. The email is in the credentials JSON under `client_email`

### Slack features not working

Ensure:
1. Bot is added to the channels it needs to access
2. All required OAuth scopes are added
3. Tokens are valid and not expired

## Security Notes

- Never commit `.env` files to git
- Always use Vercel secrets for sensitive data
- Rotate tokens regularly
- Use different credentials for development and production

## Support

If you encounter issues:
1. Check Vercel logs: `vercel logs`
2. Verify all environment variables are set: `vercel env ls`
3. Ensure your GitHub repository is up to date
