#!/usr/bin/env node
/**
 * Script to fix the incorrectly ordered data in Google Sheets
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function fixSheetsData() {
  console.log('=== Fixing Google Sheets Data Order ===\n');
  
  try {
    // Load credentials
    const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0';
    
    // Get all current data
    console.log('Fetching current data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Students!A:L',
    });

    const rows = response.data.values || [];
    
    if (rows.length <= 1) {
      console.log('No data to fix');
      return;
    }
    
    console.log(`Found ${rows.length - 1} student records to fix\n`);
    
    // Fix the data mapping
    // Current wrong order: ID, email, password, firstName, lastName, fullName, honors, groupId, school, status, points, lastActivity
    // Correct order: ID, First Name, Last Name, Email, House, Honors, Daily Goal, Session Goal, Project Oneliner, Instagram Goal, TikTok Goal, YouTube Goal
    
    const fixedRows = [rows[0]]; // Keep the header row
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      // Extract data from wrong positions
      const id = row[0];
      const email = row[1]; // Actually has email
      const password = row[2]; // Has password (we don't need this)
      const firstName = row[3]; // Actually has firstName  
      const lastName = row[4]; // Actually has lastName
      const fullName = row[5]; // Has fullName
      const honors = row[6]; // Has honors
      const house = row[7] || '1'; // Has groupId/house
      const school = row[8]; // Has school (we don't need)
      const status = row[9]; // Has status (we don't need)
      const points = row[10]; // Has points (we don't need)
      
      // Create correctly ordered row
      const fixedRow = [
        id,                    // ID
        firstName || '',       // First Name
        lastName || '',        // Last Name
        email || '',          // Email
        house || '1',         // House
        honors || 'false',    // Honors
        '',                   // Daily Goal
        '',                   // Session Goal
        '',                   // Project Oneliner
        '2',                  // Instagram Goal
        '2',                  // TikTok Goal
        '2'                   // YouTube Goal
      ];
      
      fixedRows.push(fixedRow);
      console.log(`Fixed student ${id}: ${firstName} ${lastName}`);
    }
    
    // Clear the sheet and write corrected data
    console.log('\nClearing old data...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Students!A:L'
    });
    
    console.log('Writing corrected data...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Students!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: fixedRows
      }
    });
    
    console.log('\n✅ Successfully fixed data order in Google Sheets!');
    console.log(`Updated ${fixedRows.length - 1} student records.`);
    
  } catch (error) {
    console.error('Error fixing data:', error.message);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
  }
}

fixSheetsData();
