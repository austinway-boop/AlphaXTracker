#!/usr/bin/env node
/**
 * Script to remove duplicate students from Google Sheets
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function removeDuplicates() {
  console.log('=== Removing Duplicate Students from Google Sheets ===\n');
  
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
      console.log('No data to process');
      return;
    }
    
    console.log(`Found ${rows.length - 1} student records\n`);
    
    // Keep unique students based on email
    const uniqueRows = [rows[0]]; // Keep the header row
    const seenEmails = new Set();
    const seenIds = new Set();
    let newId = 1;
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const email = row[3]; // Email is in column 3
      const firstName = row[1];
      const lastName = row[2];
      
      // Skip if we've seen this email or if it's not a valid email
      if (!email || !email.includes('@') || seenEmails.has(email.toLowerCase())) {
        console.log(`Skipping duplicate or invalid: ${email}`);
        continue;
      }
      
      seenEmails.add(email.toLowerCase());
      
      // Assign new sequential ID
      row[0] = String(newId++);
      uniqueRows.push(row);
      console.log(`Keeping student ${row[0]}: ${firstName} ${lastName} (${email})`);
    }
    
    // Clear the sheet and write unique data
    console.log(`\nRemoving ${rows.length - uniqueRows.length} duplicate records...`);
    
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Students!A:L'
    });
    
    console.log('Writing cleaned data...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Students!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: uniqueRows
      }
    });
    
    console.log('\n✅ Successfully removed duplicates!');
    console.log(`Final count: ${uniqueRows.length - 1} unique students.`);
    
  } catch (error) {
    console.error('Error removing duplicates:', error.message);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
  }
}

removeDuplicates();
