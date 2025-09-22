#!/usr/bin/env node

/**
 * Helper script to prepare environment variables for Vercel deployment
 * Run this script to get the values you need to add to Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('================================');
console.log('VERCEL ENVIRONMENT VARIABLES SETUP');
console.log('================================\n');

// Read Google credentials
const credPath = path.join(__dirname, 'google-credentials.json');
if (fs.existsSync(credPath)) {
  const credentials = fs.readFileSync(credPath, 'utf8');
  const credObj = JSON.parse(credentials);
  
  console.log('1. GOOGLE_SHEETS_CREDENTIALS');
  console.log('   Copy the following value (entire JSON as one line):');
  console.log('   ---');
  console.log('   ' + JSON.stringify(credObj));
  console.log('   ---\n');
} else {
  console.log('⚠️  google-credentials.json not found!');
  console.log('   Make sure you have set up Google Sheets credentials.\n');
}

// Google Sheet ID
console.log('2. GOOGLE_SHEET_ID');
console.log('   Default value (or use your own sheet ID):');
console.log('   ---');
console.log('   1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0');
console.log('   ---\n');

// JWT Secret
console.log('3. JWT_SECRET');
console.log('   Generate a secure random string:');
const randomSecret = require('crypto').randomBytes(32).toString('base64');
console.log('   ---');
console.log('   ' + randomSecret);
console.log('   ---\n');

console.log('================================');
console.log('HOW TO ADD TO VERCEL:');
console.log('================================\n');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your AlphaXTracker project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add each variable above with its corresponding value');
console.log('5. Make sure to select "Production", "Preview", and "Development" environments');
console.log('6. Click "Save" for each variable');
console.log('\nAfter adding all variables, redeploy your project.\n');

console.log('================================');
console.log('IMPORTANT NOTES:');
console.log('================================\n');
console.log('• Make sure your Google Sheet is shared with this service account email:');
if (fs.existsSync(credPath)) {
  const credObj = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  console.log('  ' + credObj.client_email);
}
console.log('\n• The sheet needs "Editor" permissions for the service account');
console.log('• If using a different Google Sheet, update the GOOGLE_SHEET_ID\n');
