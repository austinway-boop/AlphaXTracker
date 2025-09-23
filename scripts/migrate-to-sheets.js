#!/usr/bin/env node
/**
 * Migration script to populate Google Sheets with all student data
 * This ensures all data is properly stored in the Google Sheets database
 */

const sheetsDB = require('../lib/sheets-database');
const { DEFAULT_STUDENTS, DEFAULT_PROFILES } = require('../lib/fallback-data');
const fs = require('fs');
const path = require('path');

async function migrateToSheets() {
  console.log('=== Starting Google Sheets Migration ===\n');

  try {
    // Initialize Sheets database
    console.log('🔄 Initializing Google Sheets connection...');
    const initialized = await sheetsDB.initialize();
    
    if (!initialized) {
      console.error('❌ Failed to initialize Google Sheets. Please check your configuration.');
      process.exit(1);
    }

    console.log('✅ Google Sheets connected successfully\n');

    // Step 1: Migrate all students
    console.log('📝 Migrating student data...');
    for (const student of DEFAULT_STUDENTS) {
      try {
        // Check if student exists
        const existing = await sheetsDB.getStudentByEmail(student.email);
        
        if (!existing) {
          await sheetsDB.addStudent({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            house: student.groupID || 1,
            honors: student.honors || false,
            dailyGoal: '',
            sessionGoal: '',
            projectOneliner: '',
            instagramGoal: 2,
            tiktokGoal: 2,
            youtubeGoal: 2
          });
          console.log(`  ✅ Added student: ${student.firstName} ${student.lastName}`);
        } else {
          // Update existing student to ensure all fields are correct
          await sheetsDB.updateStudent(existing.id, {
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            house: student.groupID || existing.house || 1,
            honors: student.honors !== undefined ? student.honors : existing.honors
          });
          console.log(`  🔄 Updated student: ${student.firstName} ${student.lastName}`);
        }
      } catch (error) {
        console.error(`  ❌ Error with student ${student.email}:`, error.message);
      }
    }

    console.log('\n📋 Migrating student profiles...');
    
    // Step 2: Migrate profiles from local files
    const profilesDir = path.join(process.cwd(), 'data', 'profiles');
    if (fs.existsSync(profilesDir)) {
      const profileFiles = fs.readdirSync(profilesDir).filter(f => f.endsWith('.json'));
      
      for (const file of profileFiles) {
        try {
          const profileData = JSON.parse(fs.readFileSync(path.join(profilesDir, file), 'utf8'));
          const studentId = profileData.studentId || parseInt(file.match(/\d+/)?.[0] || '0');
          
          if (studentId) {
            await sheetsDB.updateProfile(studentId, {
              dailyGoal: profileData.dailyGoal || '',
              sessionGoal: profileData.sessionGoal || '',
              projectOneliner: profileData.projectOneliner || '',
              brainliftCompleted: profileData.brainliftCompleted || false,
              lastBrainliftDate: profileData.lastBrainliftDate || null,
              dailyGoalCompleted: profileData.dailyGoalCompleted || false,
              lastDailyGoalDate: profileData.lastDailyGoalDate || null,
              goals: profileData.goals || { x: 0, youtube: 0, tiktok: 0, instagram: 0 },
              platforms: profileData.platforms || { x: '', youtube: '', tiktok: '', instagram: '' }
            });
            console.log(`  ✅ Migrated profile for student ${studentId}`);
          }
        } catch (error) {
          console.error(`  ❌ Error migrating profile ${file}:`, error.message);
        }
      }
    }

    // Step 3: Migrate goal history
    console.log('\n📊 Migrating goal history...');
    const historyDir = path.join(process.cwd(), 'data', 'history');
    if (fs.existsSync(historyDir)) {
      const historyFiles = fs.readdirSync(historyDir).filter(f => f.endsWith('.json'));
      
      for (const file of historyFiles) {
        try {
          const historyData = JSON.parse(fs.readFileSync(path.join(historyDir, file), 'utf8'));
          const studentId = parseInt(file.match(/\d+/)?.[0] || '0');
          
          if (studentId && typeof historyData === 'object') {
            for (const [date, entry] of Object.entries(historyData)) {
              if (entry && typeof entry === 'object') {
                await sheetsDB.addGoalHistory(studentId, {
                  date: date,
                  dailyGoal: entry.dailyGoal || '',
                  dailyGoalCompleted: entry.dailyGoalCompleted || false,
                  sessionGoal: entry.sessionGoal || '',
                  projectOneliner: entry.projectOneliner || '',
                  brainliftCompleted: entry.brainliftCompleted || false,
                  audienceX: entry.audienceX || 0,
                  audienceYouTube: entry.audienceYouTube || 0,
                  audienceTikTok: entry.audienceTikTok || 0,
                  audienceInstagram: entry.audienceInstagram || 0
                });
              }
            }
            console.log(`  ✅ Migrated history for student ${studentId}`);
          }
        } catch (error) {
          console.error(`  ❌ Error migrating history ${file}:`, error.message);
        }
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log('✅ All data has been successfully migrated to Google Sheets');
    console.log('📋 You can now safely remove local JSON files if desired');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateToSheets();
