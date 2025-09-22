#!/usr/bin/env node

/**
 * Test the memory store persistence
 */

const memoryStore = require('./lib/memory-store');

console.log('Testing Memory Store...\n');

// Test saving goal status
const studentId = 1;
console.log('1. Saving goal status for student', studentId);

const status1 = memoryStore.updateGoalStatus(studentId, 'brainlift', true);
console.log('Brainlift saved:', status1);

const status2 = memoryStore.updateGoalStatus(studentId, 'dailyGoal', true);
console.log('Daily Goal saved:', status2);

// Test retrieving goal status
console.log('\n2. Retrieving goal status');
const retrieved = memoryStore.getGoalStatus(studentId);
console.log('Retrieved:', retrieved);

// Test checking individual goals
console.log('\n3. Checking individual goals');
console.log('Brainlift completed?', memoryStore.isGoalCompletedToday(studentId, 'brainlift'));
console.log('Daily Goal completed?', memoryStore.isGoalCompletedToday(studentId, 'dailyGoal'));

// Test today's completions
console.log('\n4. Getting all today completions');
const todayCompletions = memoryStore.getTodayCompletions();
console.log('Today completions:', todayCompletions);

console.log('\n✓ Memory store is working correctly!');
