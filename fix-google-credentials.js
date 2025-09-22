#!/usr/bin/env node

/**
 * Helper script to fix Google Sheets credentials JSON formatting
 */

const fs = require('fs');
const path = require('path');

console.log('Google Sheets Credentials Fixer\n');
console.log('This script will help you fix your GOOGLE_SHEETS_CREDENTIALS JSON.\n');

// Check if google-credentials.json exists
const credPath = path.join(process.cwd(), 'google-credentials.json');

if (!fs.existsSync(credPath)) {
  console.error('❌ google-credentials.json not found!');
  console.log('\nPlease make sure you have google-credentials.json in your project root.');
  console.log('Download it from Google Cloud Console → Service Accounts → Keys');
  process.exit(1);
}

// Read and validate the credentials
try {
  console.log('Reading google-credentials.json...');
  const content = fs.readFileSync(credPath, 'utf8');
  
  // Try to parse it
  const creds = JSON.parse(content);
  
  console.log('\n✅ google-credentials.json is valid JSON!\n');
  console.log('Details:');
  console.log('  Project ID:', creds.project_id);
  console.log('  Service Account:', creds.client_email);
  console.log('  Key ID:', creds.private_key_id);
  
  // Generate the environment variable value
  const envValue = JSON.stringify(creds);
  
  console.log('\n📋 Copy this EXACT value for GOOGLE_SHEETS_CREDENTIALS in Vercel:\n');
  console.log('─'.repeat(80));
  console.log(envValue);
  console.log('─'.repeat(80));
  
  // Also save to a file for easy copying
  const outputPath = 'GOOGLE_SHEETS_CREDENTIALS.txt';
  fs.writeFileSync(outputPath, envValue);
  console.log(`\n💾 Also saved to ${outputPath} for easy copying`);
  
  console.log('\n📝 Instructions:');
  console.log('1. Copy the JSON string above (or from GOOGLE_SHEETS_CREDENTIALS.txt)');
  console.log('2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('3. Find GOOGLE_SHEETS_CREDENTIALS and click Edit');
  console.log('4. Clear the current value completely');
  console.log('5. Paste the new value');
  console.log('6. Click Save');
  console.log('7. Redeploy your project');
  
  console.log('\n⚠️  IMPORTANT:');
  console.log('- Copy the ENTIRE string including the opening { and closing }');
  console.log('- Do NOT add any extra quotes around it');
  console.log('- Do NOT modify or format it');
  console.log('- Paste it EXACTLY as shown');
  
} catch (error) {
  console.error('\n❌ Error reading/parsing google-credentials.json:');
  console.error(error.message);
  
  if (error.message.includes('Unexpected')) {
    console.log('\n🔧 Your google-credentials.json file appears to be corrupted.');
    console.log('Please download a fresh copy from Google Cloud Console:');
    console.log('1. Go to https://console.cloud.google.com');
    console.log('2. Select your project');
    console.log('3. Go to IAM & Admin → Service Accounts');
    console.log('4. Click on your service account');
    console.log('5. Go to Keys tab');
    console.log('6. Add Key → Create new key → JSON');
    console.log('7. Save as google-credentials.json in your project root');
  }
  
  process.exit(1);
}
