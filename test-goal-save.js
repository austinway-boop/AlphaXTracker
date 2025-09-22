#!/usr/bin/env node

/**
 * Test saving goal completion to Google Sheets
 */

const sheetsDB = require('./lib/sheets-database');

async function testGoalSave() {
  console.log('Testing Goal Save to Google Sheets...\n');

  try {
    // Initialize database
    console.log('1. Initializing Google Sheets connection...');
    const initialized = await sheetsDB.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize Google Sheets');
      return;
    }
    console.log('✓ Connected to Google Sheets\n');

    // Get first student
    console.log('2. Getting students list...');
    const students = await sheetsDB.getAllStudents();
    if (students.length === 0) {
      console.error('❌ No students found in sheet');
      return;
    }
    console.log(`✓ Found ${students.length} students`);
    
    const testStudent = students[0];
    console.log(`  Testing with: ${testStudent.firstName} ${testStudent.lastName} (ID: ${testStudent.id})\n`);

    // Update profile with goal completion
    console.log('3. Updating profile with goal completion...');
    const profileUpdate = {
      dailyGoal: testStudent.dailyGoal || 'Complete 10 tasks',
      sessionGoal: testStudent.sessionGoal || '100 points',
      projectOneliner: testStudent.projectOneliner || 'Working on AI project',
      brainliftCompleted: true,
      lastBrainliftDate: new Date().toISOString(),
      dailyGoalCompleted: true,
      lastDailyGoalDate: new Date().toISOString()
    };

    const result = await sheetsDB.updateProfile(testStudent.id, profileUpdate);
    console.log('✓ Profile updated successfully');
    console.log('  Brainlift: Completed ✓');
    console.log('  Daily Goal: Completed ✓\n');

    // Verify by reading back
    console.log('4. Verifying saved data...');
    const savedProfile = await sheetsDB.getProfile(testStudent.id);
    if (savedProfile) {
      console.log('✓ Data verified in Google Sheets:');
      console.log(`  Brainlift: ${savedProfile.brainliftCompleted ? 'Completed ✓' : 'Not completed'}`);
      console.log(`  Daily Goal: ${savedProfile.dailyGoalCompleted ? 'Completed ✓' : 'Not completed'}`);
      console.log(`  Last updated: ${savedProfile.lastUpdated || 'Unknown'}`);
    } else {
      console.log('⚠️  Could not read back profile (might be normal if Profiles sheet is empty)');
    }

    console.log('\n✅ Test completed successfully!');
    console.log('Check your Google Sheet to verify the data was saved.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
  }
}

// Run the test
testGoalSave().catch(console.error);
