#!/usr/bin/env node

/**
 * Test goal persistence through the full stack
 */

const fetch = require('node-fetch');

// Test URLs (change to your local or production URL)
const BASE_URL = 'http://localhost:3000';

async function testGoalPersistence() {
  console.log('Testing Goal Persistence...\n');
  
  const studentId = 1;
  
  try {
    // 1. Complete a goal
    console.log('1. Marking Brainlift as complete...');
    const completeResponse = await fetch(`${BASE_URL}/api/goals/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        type: 'brainlift'
      })
    });
    
    const completeData = await completeResponse.json();
    console.log('Response:', completeData);
    console.log('Updated status:', completeData.updatedStatus);
    
    // 2. Check the goal status
    console.log('\n2. Checking goal status...');
    const checkResponse = await fetch(`${BASE_URL}/api/goals/check/${studentId}`);
    const checkData = await checkResponse.json();
    
    console.log('Brainlift completed:', checkData.goals?.brainlift?.completed);
    console.log('Daily Goal completed:', checkData.goals?.dailyGoalCheck?.completed);
    
    // 3. Get the profile
    console.log('\n3. Getting profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/profile/${studentId}`);
    const profileData = await profileResponse.json();
    
    console.log('Profile brainlift:', profileData.profile?.brainliftCompleted);
    console.log('Profile daily goal:', profileData.profile?.dailyGoalCompleted);
    
    console.log('\n✅ Test complete! Check if values persist.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testGoalPersistence().catch(console.error);
