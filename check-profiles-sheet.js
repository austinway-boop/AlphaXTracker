#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function checkProfilesSheet() {
  console.log('Checking Profiles Sheet Structure...\n');

  const credentialsPath = path.join(__dirname, 'google-credentials.json');
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const spreadsheetId = '1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0';

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Check if Profiles sheet exists
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const profileSheet = metadata.data.sheets.find(s => s.properties.title === 'Profiles');
    
    if (!profileSheet) {
      console.log('❌ Profiles sheet does not exist!');
      console.log('Available sheets:', metadata.data.sheets.map(s => s.properties.title).join(', '));
      
      // Create Profiles sheet
      console.log('\nCreating Profiles sheet...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Profiles',
                gridProperties: { rowCount: 1000, columnCount: 20 }
              }
            }
          }]
        }
      });
      
      // Add headers
      const headers = [
        'StudentID', 'DailyGoal', 'SessionGoal', 'ProjectOneliner', 
        'BrainliftCompleted', 'LastBrainliftDate', 'DailyGoalCompleted', 'LastDailyGoalDate',
        'GoalX', 'GoalYouTube', 'GoalTikTok', 'GoalInstagram',
        'PlatformX', 'PlatformYouTube', 'PlatformTikTok', 'PlatformInstagram', 
        'LastUpdated'
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Profiles!A1:Q1',
        valueInputOption: 'RAW',
        requestBody: { values: [headers] }
      });
      
      console.log('✓ Created Profiles sheet with headers');
      
    } else {
      console.log('✓ Profiles sheet exists');
      
      // Get headers
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Profiles!A1:Q1'
      });
      
      if (response.data.values && response.data.values[0]) {
        console.log('Headers:', response.data.values[0].join(', '));
      } else {
        console.log('⚠️  No headers found in Profiles sheet');
      }
      
      // Get data count
      const dataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Profiles!A:A'
      });
      
      const rowCount = dataResponse.data.values ? dataResponse.data.values.length : 0;
      console.log(`Data rows: ${rowCount - 1} (excluding header)`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkProfilesSheet().catch(console.error);
