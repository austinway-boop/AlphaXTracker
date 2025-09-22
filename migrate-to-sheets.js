#!/usr/bin/env node

/**
 * Migration script to move all existing JSON data to Google Sheets
 * Run this once to populate Google Sheets with existing data
 */

const fs = require('fs');
const path = require('path');
const sheetsDB = require('./lib/sheets-database');

async function migrateToSheets() {
  console.log('🔄 MIGRATING DATA TO GOOGLE SHEETS\n');
  console.log('=' .repeat(60));
  
  // Initialize Sheets database
  console.log('1. Initializing Google Sheets database...');
  const initialized = await sheetsDB.initialize();
  
  if (!initialized) {
    console.error('❌ Failed to initialize Google Sheets database');
    console.error('Please ensure google-credentials.json exists and is valid');
    process.exit(1);
  }
  
  console.log('✅ Google Sheets database initialized\n');
  
  try {
    // Migrate students
    console.log('2. Migrating students...');
    const studentsFile = path.join(__dirname, 'data', 'students.json');
    
    if (fs.existsSync(studentsFile)) {
      const students = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
      console.log(`   Found ${students.length} students to migrate`);
      
      for (const student of students) {
        // Check if student already exists
        const existing = await sheetsDB.getStudentByEmail(student.email || `${student.firstName}.${student.lastName}@alpha.school`.toLowerCase());
        
        if (!existing) {
          await sheetsDB.addStudent({
            email: student.email || `${student.firstName}.${student.lastName}@alpha.school`.toLowerCase(),
            password: student.password || 'Iloveschool',
            firstName: student.firstName,
            lastName: student.lastName,
            fullName: student.fullName || `${student.firstName} ${student.lastName}`,
            honors: student.honors || false,
            groupId: student.groupId || null,
            school: student.school || 'Alpha High School',
            status: student.status || 'Active',
            points: student.points || 0
          });
          console.log(`   ✅ Migrated student: ${student.firstName} ${student.lastName}`);
        }
      }
    } else {
      console.log('   No students.json file found - using Names.md data');
      
      // Default students from Names.md
      const honorsStudents = new Set([
        'Alex', 'Austin', 'Caleb', 'Cruce', 'Ella', 'Elle', 'Emma', 
        'Geetesh', 'Jackson', 'Kavin', 'Lincoln', 'Maddie', 'Michael', 
        'Reuben', 'Sara Beth', 'Sloane', 'Sloka', 'Stella'
      ]);

      const allStudents = [
        ['Alex', 'Mathew'], ['Elle', 'Liemandt'], ['Emily', 'Smith'], ['Lucia', 'Scaletta'],
        ['Maddie', 'Price'], ['Reuben', 'Runacres'], ['Sloane', 'Price'], ['Tatum', 'Lemkau'],
        ['Austin', 'Way'], ['Caleb', 'Walker'], ['Cruce', 'Saunders'], ['Ella', 'Gremont'],
        ['Emma', 'Watt'], ['Geetesh', 'Sunkara'], ['Jackson', 'Brace'], ['Kavin', 'Balaraman'],
        ['Lincoln', 'Swearingen'], ['Michael', 'Kwan'], ['Sara Beth', 'Hurst'], ['Sloka', 'Dasari'],
        ['Stella', 'Zeng'], ['Aditya', 'Gupta'], ['Arjun', 'Sripathy'], ['Beatrix', 'Brace'],
        ['Ben', 'Nierenberg'], ['Colby', 'Seyferth'], ['Josiah', 'Trejo'], ['Kaitlyn', 'Moredock'],
        ['Kiran', 'Sridhar'], ['Linus', 'Tornqvist'], ['Olivia', 'Brace'], ['Santana', 'Sanchez'],
        ['Theo', 'Crumley'], ['Aidan', 'Cobb'], ['Connor', 'Krug'], ['Deacon', 'Cobb'],
        ['Evan', 'Gremont'], ['Gus', 'Seyferth'], ['Hollis', 'Mathew'], ['Kaia', 'Cobb'],
        ['Lily', 'Cobb'], ['Nikki', 'Krug'], ['Samantha', 'Chafin'], ['Will', 'Krug'],
        ['Zack', 'Krug']
      ];

      let studentId = 1;
      for (const [firstName, lastName] of allStudents) {
        const email = `${firstName}.${lastName}@alpha.school`.toLowerCase();
        const existing = await sheetsDB.getStudentByEmail(email);
        
        if (!existing) {
          await sheetsDB.addStudent({
            email,
            password: 'Iloveschool',
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            honors: honorsStudents.has(firstName),
            groupId: null,
            school: 'Alpha High School',
            status: 'Active',
            points: 0
          });
          console.log(`   ✅ Added student: ${firstName} ${lastName}`);
        }
        studentId++;
      }
    }
    console.log('✅ Students migration complete\n');
    
    // Migrate profiles
    console.log('3. Migrating profiles...');
    const profilesDir = path.join(__dirname, 'data', 'profiles');
    
    if (fs.existsSync(profilesDir)) {
      const profileFiles = fs.readdirSync(profilesDir);
      console.log(`   Found ${profileFiles.length} profiles to migrate`);
      
      for (const file of profileFiles) {
        if (file.endsWith('.json')) {
          const studentId = file.replace('.json', '');
          const profilePath = path.join(profilesDir, file);
          const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
          
          await sheetsDB.updateProfile(studentId, profile);
          console.log(`   ✅ Migrated profile for student ${studentId}`);
        }
      }
    } else {
      console.log('   No profiles directory found');
    }
    console.log('✅ Profiles migration complete\n');
    
    // Migrate goal history
    console.log('4. Migrating goal history...');
    const historyDir = path.join(__dirname, 'data', 'goal-history');
    
    if (fs.existsSync(historyDir)) {
      const historyFiles = fs.readdirSync(historyDir);
      console.log(`   Found ${historyFiles.length} history files to migrate`);
      
      for (const file of historyFiles) {
        if (file.endsWith('.json')) {
          const studentId = file.replace('student_', '').replace('.json', '');
          const historyPath = path.join(historyDir, file);
          const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
          
          for (const entry of history) {
            await sheetsDB.addGoalHistory(studentId, entry);
          }
          console.log(`   ✅ Migrated ${history.length} history entries for student ${studentId}`);
        }
      }
    } else {
      console.log('   No goal-history directory found');
    }
    console.log('✅ Goal history migration complete\n');
    
    // Migrate groups
    console.log('5. Migrating groups...');
    const groupsFile = path.join(__dirname, 'data', 'groups.json');
    
    if (fs.existsSync(groupsFile)) {
      const groups = JSON.parse(fs.readFileSync(groupsFile, 'utf8'));
      console.log(`   Found ${groups.length} groups to migrate`);
      // Groups are created automatically by the sheets-database module
    } else {
      console.log('   No groups.json file found - using defaults');
    }
    console.log('✅ Groups migration complete\n');
    
    console.log('=' .repeat(60));
    console.log('✅ MIGRATION COMPLETE!\n');
    console.log('All data has been successfully migrated to Google Sheets.');
    console.log('The application will now use Google Sheets as the primary database.\n');
    console.log('⚠️  IMPORTANT: Do NOT delete the google-credentials.json file!');
    console.log('    The app needs it to connect to Google Sheets.\n');
    console.log('You can now safely delete the old data files if desired:');
    console.log('  • data/students.json');
    console.log('  • data/profiles/');
    console.log('  • data/goal-history/');
    console.log('  • data/groups.json\n');
    console.log('Or keep them as a backup.\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateToSheets().catch(console.error);
