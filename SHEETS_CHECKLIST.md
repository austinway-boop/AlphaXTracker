# Google Sheets Setup Checklist

## Your Service Account
✅ **Email:** `alphax-sheets-service@room5-472703.iam.gserviceaccount.com`  
✅ **Project:** room5-472703

## Setup Tasks

### ☐ 1. Download JSON Credentials
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Select project: **room5-472703**
- [ ] Navigate to **IAM & Admin** → **Service Accounts**
- [ ] Click on `alphax-sheets-service@room5-472703.iam.gserviceaccount.com`
- [ ] Go to **Keys** tab
- [ ] Click **ADD KEY** → **Create new key**
- [ ] Select **JSON** format
- [ ] Click **CREATE** (file downloads automatically)

### ☐ 2. Install Credentials File
- [ ] Find the downloaded JSON file (probably in Downloads folder)
- [ ] Rename it to exactly: `google-credentials.json`
- [ ] Move it to: `/Users/austinway/Desktop/AlphaXTracker/`
- [ ] Verify it's in the right place by running:
  ```bash
  ls -la /Users/austinway/Desktop/AlphaXTracker/google-credentials.json
  ```

### ☐ 3. Share the Spreadsheet
- [ ] Open the spreadsheet: [AlphaXData](https://docs.google.com/spreadsheets/d/1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0/edit)
- [ ] Click the **Share** button (top right)
- [ ] In "Add people and groups" paste: `alphax-sheets-service@room5-472703.iam.gserviceaccount.com`
- [ ] Set permission to: **Editor**
- [ ] **IMPORTANT:** Uncheck "Notify people" (service accounts don't have email)
- [ ] Click **Share**

### ☐ 4. Test the Integration
- [ ] Make sure your dev server is running (port 3000 or 3002)
- [ ] Log in as admin
- [ ] Go to **Settings** tab
- [ ] Check "Google Sheets Integration" section
- [ ] Should show: **Connected** ✅
- [ ] Click **"Sync All Data to Sheets"**
- [ ] Check the spreadsheet for data

## Troubleshooting

### If Status Shows "Not Configured"
1. Check the JSON file is named exactly `google-credentials.json`
2. Check it's in the project root: `/Users/austinway/Desktop/AlphaXTracker/`
3. Restart the dev server after adding the file

### If You Get "Permission Denied"
1. Make sure you shared the spreadsheet with the exact email
2. Make sure you gave **Editor** permissions (not Viewer)
3. Try removing and re-adding the service account to the spreadsheet

### If Sync Fails
1. Check the browser console for errors
2. Make sure you're logged in as admin
3. Try refreshing the page and trying again

## Quick Test Commands

Test if credentials file exists:
```bash
ls -la /Users/austinway/Desktop/AlphaXTracker/google-credentials.json
```

Check if it's valid JSON:
```bash
python3 -m json.tool < /Users/austinway/Desktop/AlphaXTracker/google-credentials.json > /dev/null && echo "✅ Valid JSON" || echo "❌ Invalid JSON"
```

## Success Indicators
When everything is working:
- Settings page shows "Connected" status
- Clicking "Sync All Data" completes without errors
- The spreadsheet populates with:
  - Students sheet with all student data
  - Goals sheet with goal completions
  - History sheet with daily tracking
  - Houses sheet with house points
  - DailyTracking sheet with performance data

## Need Help?
If you're stuck:
1. Double-check the service account email is exactly: `alphax-sheets-service@room5-472703.iam.gserviceaccount.com`
2. Make sure the JSON file has these fields:
   - `"type": "service_account"`
   - `"project_id": "room5-472703"`
   - `"client_email": "alphax-sheets-service@room5-472703.iam.gserviceaccount.com"`
3. The file should be about 2-3 KB in size
