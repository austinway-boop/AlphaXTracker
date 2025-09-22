#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function fixProfilesSheet() {
  console.log('Fixing Profiles Sheet Structure...\n');

  const credentialsPath = path.join(__dirname, 'google-credentials.json');
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const spreadsheetId = '1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0';

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Get current headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Profiles!A1:Z1'
    });
    
    const currentHeaders = response.data.values ? response.data.values[0] : [];
    console.log('Current headers:', currentHeaders.length);
    
    // The correct headers should be:
    const correctHeaders = [
      'StudentID',           // A
      'DailyGoal',          // B
      'SessionGoal',        // C
      'ProjectOneliner',    // D
      'BrainliftCompleted', // E
      'LastBrainliftDate',  // F
      'DailyGoalCompleted', // G (MISSING!)
      'LastDailyGoalDate',  // H (MISSING!)
      'GoalX',              // I (currently at G)
      'GoalYouTube',        // J (currently at H)
      'GoalTikTok',         // K (currently at I)
      'GoalInstagram',      // L (currently at J)
      'PlatformX',          // M (currently at K)
      'PlatformYouTube',    // N (currently at L)
      'PlatformTikTok',     // O (currently at M)
      'PlatformInstagram',  // P (currently at N)
      'LastUpdated'         // Q (currently at O)
    ];
    
    console.log('\nUpdating headers to include missing columns...');
    
    // Update the headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Profiles!A1:Q1',
      valueInputOption: 'RAW',
      requestBody: { values: [correctHeaders] }
    });
    
    console.log('✓ Headers updated successfully!');
    console.log('\nNew structure:');
    correctHeaders.forEach((header, index) => {
      const col = String.fromCharCode(65 + index); // A, B, C...
      console.log(`  ${col}: ${header}`);
    });
    
    // Get existing data
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Profiles!A2:Q100'
    });
    
    const existingData = dataResponse.data.values || [];
    console.log(`\nFound ${existingData.length} existing profile records`);
    
    if (existingData.length > 0) {
      // Fix existing data by shifting columns
      const fixedData = existingData.map(row => {
        // Old structure: ID, Daily, Session, Project, BrainliftComp, BrainliftDate, GoalX, ...
        // New structure: ID, Daily, Session, Project, BrainliftComp, BrainliftDate, DailyComp, DailyDate, GoalX, ...
        const newRow = [];
        newRow[0] = row[0]; // StudentID
        newRow[1] = row[1]; // DailyGoal
        newRow[2] = row[2]; // SessionGoal
        newRow[3] = row[3]; // ProjectOneliner
        newRow[4] = row[4]; // BrainliftCompleted
        newRow[5] = row[5]; // LastBrainliftDate
        newRow[6] = 'false'; // DailyGoalCompleted (new)
        newRow[7] = ''; // LastDailyGoalDate (new)
        newRow[8] = row[6]; // GoalX
        newRow[9] = row[7]; // GoalYouTube
        newRow[10] = row[8]; // GoalTikTok
        newRow[11] = row[9]; // GoalInstagram
        newRow[12] = row[10]; // PlatformX
        newRow[13] = row[11]; // PlatformYouTube
        newRow[14] = row[12]; // PlatformTikTok
        newRow[15] = row[13]; // PlatformInstagram
        newRow[16] = row[14] || new Date().toISOString(); // LastUpdated
        return newRow;
      });
      
      // Update all data
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Profiles!A2:Q${existingData.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values: fixedData }
      });
      
      console.log('✓ Updated existing profile data with new columns');
    }
    
    console.log('\n✅ Profiles sheet structure fixed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixProfilesSheet().catch(console.error);
