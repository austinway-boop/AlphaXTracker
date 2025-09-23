#!/usr/bin/env node
/**
 * Script to check and debug Google Sheets data
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function checkSheetsData() {
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
    
    // Check the Students sheet
    console.log('=== Checking Students Sheet ===\n');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Students!A1:L10', // Get first 10 rows to see structure
    });

    const rows = response.data.values || [];
    
    if (rows.length > 0) {
      console.log('Headers:', rows[0]);
      console.log('\nFirst few rows of data:');
      for (let i = 1; i < Math.min(5, rows.length); i++) {
        console.log(`Row ${i}:`, rows[i]);
      }
    } else {
      console.log('No data found in Students sheet');
    }
    
    // Check if data is in wrong order
    if (rows.length > 1) {
      const headers = rows[0];
      const firstDataRow = rows[1];
      
      console.log('\n=== Data Analysis ===');
      console.log('It appears the data might be in the wrong columns:');
      headers.forEach((header, index) => {
        console.log(`  Column ${index} (${header}): ${firstDataRow[index]}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSheetsData();
