#!/usr/bin/env node
/**
 * Script to reset Redis database with clean student data
 * Removes all test accounts and repopulates with real students only
 */

const redisDB = require('../lib/redis-database');

async function resetDatabase() {
  console.log('=== Resetting Redis Database ===\n');
  
  try {
    // Initialize Redis
    console.log('🔄 Connecting to Redis...');
    const initialized = await redisDB.initialize();
    
    if (!initialized) {
      console.error('❌ Failed to initialize Redis database');
      process.exit(1);
    }
    
    console.log('✅ Redis connected successfully\n');
    
    // Clear all existing data
    console.log('🧹 Clearing all existing data...');
    await redisDB.clearAllData();
    console.log('✅ All data cleared\n');
    
    // Reset to default student data (no test accounts)
    console.log('📝 Populating with clean student data...');
    await redisDB.resetToDefaultData();
    console.log('✅ Student data populated\n');
    
    // Verify data
    console.log('🔍 Verifying data...');
    const students = await redisDB.getAllStudents();
    console.log(`✅ ${students.length} students loaded\n`);
    
    // Show first few students
    console.log('Sample students:');
    students.slice(0, 5).forEach(s => {
      console.log(`  - ${s.id}: ${s.firstName} ${s.lastName} (${s.email})`);
    });
    
    console.log('\n=== Database Reset Complete ===');
    console.log('✅ All test accounts removed');
    console.log('✅ Clean student data loaded');
    console.log('✅ Goals reset for all students');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
