#!/usr/bin/env node

/**
 * Test Google Sheets connection and configuration
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testSheetsConnection() {
  console.log('=================================');
  console.log('TESTING GOOGLE SHEETS CONNECTION');
  console.log('=================================\n');

  // Check for credentials
  let credentials;
  const credentialsPath = path.join(__dirname, 'google-credentials.json');
  
  if (fs.existsSync(credentialsPath)) {
    console.log('✓ Found google-credentials.json');
    credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log(`  Service Account: ${credentials.client_email}`);
    console.log(`  Project ID: ${credentials.project_id}`);
  } else {
    console.log('✗ google-credentials.json not found');
    return;
  }

  // Check for Sheet ID
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0';
  console.log(`\n✓ Using Sheet ID: ${spreadsheetId}`);

  try {
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('\nTesting connection...');
    
    // Test 1: Get spreadsheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    console.log(`✓ Connected to: "${metadata.data.properties.title}"`);
    console.log(`  Sheets found: ${metadata.data.sheets.map(s => s.properties.title).join(', ')}`);
    
    // Test 2: Try to read from Students sheet
    console.log('\nTesting read access...');
    const readResult = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Students!A1:L2', // Just read headers and first row
    });
    
    console.log('✓ Can read from Students sheet');
    console.log(`  Headers: ${readResult.data.values[0].join(', ')}`);
    
    // Test 3: Try to write (append a test row then delete it)
    console.log('\nTesting write access...');
    const testData = [[
      '999', // ID
      'test@test.com', // Email
      'test123', // Password
      'Test', // FirstName
      'User', // LastName
      'Test User', // FullName
      'false', // Honors
      '1', // GroupID
      'Test School', // School
      'test', // Status
      '0', // Points
      new Date().toISOString() // LastActivity
    ]];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Students!A:L',
      valueInputOption: 'RAW',
      resource: { values: testData },
    });
    
    console.log('✓ Can write to Students sheet');
    
    // Clean up test data
    const allData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Students!A:A',
    });
    
    const lastRow = allData.data.values.length;
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `Students!A${lastRow}:L${lastRow}`,
    });
    
    console.log('✓ Cleaned up test data');
    
    console.log('\n=================================');
    console.log('✅ GOOGLE SHEETS IS WORKING!');
    console.log('=================================');
    console.log('\nIMPORTANT: Make sure this sheet is shared with:');
    console.log(`  ${credentials.client_email}`);
    console.log('  With "Editor" permissions\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.code === 403) {
      console.error('\n⚠️  PERMISSION ERROR!');
      console.error('Make sure your Google Sheet is shared with:');
      console.error(`  ${credentials.client_email}`);
      console.error('  Give it "Editor" permissions');
    } else if (error.code === 404) {
      console.error('\n⚠️  SHEET NOT FOUND!');
      console.error('Check that the Sheet ID is correct:');
      console.error(`  Current: ${spreadsheetId}`);
    }
  }
}

// Run the test
testSheetsConnection().catch(console.error);
