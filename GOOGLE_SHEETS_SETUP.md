# Google Sheets Integration Setup

This guide will help you set up Google Sheets integration for AlphaXTracker to sync all data to the spreadsheet.

## Spreadsheet URL
The application is configured to use this spreadsheet:
https://docs.google.com/spreadsheets/d/1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0/edit

## Setup Steps

### 1. Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

### 2. Create Service Account Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `alphax-tracker-service`
   - Description: `Service account for AlphaXTracker Sheets integration`
4. Click "Create and Continue"
5. Grant the role: `Editor` or `Owner`
6. Click "Done"

### 3. Generate JSON Key

1. Find your service account in the credentials list
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Select "JSON" format
6. Download the JSON file

### 4. Configure the Application

#### Option A: Using Environment Variable (Recommended for Production)

1. Copy the entire contents of the downloaded JSON file
2. Set it as an environment variable:
   ```bash
   export GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
   ```
3. Or add it to your `.env.local` file:
   ```
   GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
   ```

#### Option B: Using Local File (Development)

1. Rename the downloaded JSON file to `google-credentials.json`
2. Place it in the root directory of the AlphaXTracker project
3. Add `google-credentials.json` to your `.gitignore` file (IMPORTANT!)

### 5. Share the Spreadsheet with Service Account

1. Open the Google Sheets spreadsheet
2. Click the "Share" button
3. Add the service account email (found in your JSON credentials as `client_email`)
4. Give it "Editor" permissions
5. Click "Send"

## Data Structure

The integration will automatically create and manage these sheets:

### Students Sheet
- ID, First Name, Last Name, Email, House, Honors
- Daily Goal, Session Goal, Project Oneliner
- Social Media Goals (Instagram, TikTok, YouTube, Twitter)

### Goals Sheet
- Date, Student ID, Student Name, Goal Type
- Goal Text, Completed, Completion Time, Points

### History Sheet
- Date, Student ID, Student Name
- Daily Goal, Daily Completed, Session Goal
- Brainlift Completed, Audience Goals Met
- Total Points, Notes

### Houses Sheet
- House ID, House Name, Total Students
- Daily Points, Weekly Points, Monthly Points

### DailyTracking Sheet
- Date, Student ID, Student Name, House
- Goal Set, Goal Completed, Points

## Features

Once configured, the application will:

1. **Sync Students**: Automatically sync all student data to the Students sheet
2. **Track Goals**: Log all goal settings and completions to the Goals sheet
3. **Record History**: Maintain a complete history of daily activities
4. **Update House Points**: Real-time house competition tracking
5. **Daily Tracking**: Detailed daily performance logs

## Troubleshooting

### "Google Sheets credentials not found"
- Ensure the JSON credentials are properly configured
- Check that the environment variable is set correctly
- Verify the `google-credentials.json` file exists in the root directory

### "Permission denied" errors
- Make sure the spreadsheet is shared with the service account email
- Verify the service account has Editor permissions on the spreadsheet

### "API not enabled" errors
- Go to Google Cloud Console
- Enable the Google Sheets API for your project

## Security Notes

⚠️ **NEVER commit your credentials to version control**
- Add `google-credentials.json` to `.gitignore`
- Use environment variables for production deployments
- Rotate keys regularly for security

## Support

For issues with the Google Sheets integration, check:
1. The service account has proper permissions
2. The spreadsheet ID is correct
3. The Google Sheets API is enabled
4. Network connectivity to Google APIs
