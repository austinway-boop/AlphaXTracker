#!/usr/bin/env node

// Data monitoring script - shows current data state
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('='.repeat(60));
console.log('AlphaX Tracker - Data Monitor');
console.log('='.repeat(60));
console.log();

// Check profiles
const profilesDir = path.join(dataDir, 'profiles');
if (fs.existsSync(profilesDir)) {
  const profiles = fs.readdirSync(profilesDir);
  console.log(`📁 Profiles (${profiles.length} students):`);
  
  profiles.forEach(file => {
    if (file.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(path.join(profilesDir, file), 'utf8'));
      const studentId = file.replace('student_', '').replace('.json', '');
      console.log(`   Student ${studentId}:`);
      console.log(`     - Brainlift: ${data.brainliftCompleted ? '✅' : '❌'} ${data.lastBrainliftDate || 'never'}`);
      console.log(`     - Daily Goal: ${data.dailyGoalCompleted ? '✅' : '❌'} ${data.lastDailyGoalDate || 'never'}`);
      console.log(`     - Goal Text: "${data.dailyGoal || 'not set'}"`);
    }
  });
  console.log();
}

// Check history
const historyDir = path.join(dataDir, 'history');
if (fs.existsSync(historyDir)) {
  const histories = fs.readdirSync(historyDir);
  console.log(`📊 History Files (${histories.length} students):`);
  
  histories.forEach(file => {
    if (file.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(path.join(historyDir, file), 'utf8'));
      const studentId = file.replace('student_', '').replace('_history.json', '');
      const entries = Object.keys(data).length;
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = data[today];
      
      console.log(`   Student ${studentId}: ${entries} days recorded`);
      if (todayEntry) {
        console.log(`     Today: Brainlift ${todayEntry.brainliftCompleted ? '✅' : '❌'}, Daily ${todayEntry.dailyGoalCompleted ? '✅' : '❌'}`);
      }
    }
  });
  console.log();
}

// Check sync queue
const syncQueueDir = path.join(dataDir, 'sync-queue');
if (fs.existsSync(syncQueueDir)) {
  const queueItems = fs.readdirSync(syncQueueDir);
  if (queueItems.length > 0) {
    console.log(`⏳ Sync Queue (${queueItems.length} pending items):`);
    queueItems.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log();
  }
}

console.log('='.repeat(60));
console.log('Monitor complete at', new Date().toLocaleTimeString());
console.log('='.repeat(60));
