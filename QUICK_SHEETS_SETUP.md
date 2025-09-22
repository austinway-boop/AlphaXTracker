# Quick Google Sheets Setup Guide

## ⚠️ Security Warning
If you've shared your API key publicly, regenerate it immediately in the Google Cloud Console.

## What You Need
You need a **Service Account JSON file**, not just an API key. Here's how to get it:

## Step-by-Step Setup (5 minutes)

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- Click the project dropdown at the top
- Click "New Project" or select an existing one
- Name it "AlphaXTracker" (or similar)

### 3. Enable Google Sheets API
- In the left menu, go to **APIs & Services** → **Library**
- Search for "**Google Sheets API**"
- Click on it and press **ENABLE**

### 4. Create Service Account
- Go to **APIs & Services** → **Credentials**
- Click **+ CREATE CREDENTIALS** → **Service Account**
- Fill in:
  - Service account name: `alphax-sheets-service`
  - Service account ID: (auto-fills)
  - Description: `AlphaXTracker Sheets Integration`
- Click **CREATE AND CONTINUE**
- For role, select **Project** → **Editor**
- Click **CONTINUE** then **DONE**

### 5. Generate JSON Key File
- Click on the service account you just created
- Go to the **KEYS** tab
- Click **ADD KEY** → **Create new key**
- Select **JSON**
- Click **CREATE**
- **A JSON file will download automatically**

### 6. Set Up the JSON File
- Rename the downloaded file to `google-credentials.json`
- Move it to your AlphaXTracker folder: `/Users/austinway/Desktop/AlphaXTracker/`
- The file should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "alphax-sheets-service@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 7. Share Your Spreadsheet
- Open your spreadsheet: https://docs.google.com/spreadsheets/d/1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0/edit
- Click the **Share** button (top right)
- Copy the `client_email` from your JSON file (looks like: something@project.iam.gserviceaccount.com)
- Paste it in the "Add people and groups" field
- Set permission to **Editor**
- **UNCHECK** "Notify people" (service accounts don't have email)
- Click **Share**

### 8. Test the Integration
1. Make sure your dev server is running
2. Log in as admin
3. Go to Settings tab
4. You should see "Google Sheets Integration" with status "Connected"
5. Click "Sync All Data to Sheets"

## Troubleshooting

### "Not Configured" Status
- Make sure `google-credentials.json` is in the project root
- Check that the file is valid JSON
- Ensure you've shared the spreadsheet with the service account email

### "Permission Denied" 
- The spreadsheet must be shared with the service account's email
- The service account needs Editor permissions

### Still Using API Key?
API keys alone won't work for this integration. You MUST use a Service Account with JSON credentials.

## Need Help?
If you're still stuck:
1. Double-check the service account email is added to the spreadsheet
2. Make sure the JSON file is named exactly `google-credentials.json`
3. Restart your development server after adding the credentials file
