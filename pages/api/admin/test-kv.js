/**
 * Test endpoint to verify Vercel KV is working
 */

const VercelStorage = require('../../../lib/vercel-storage');

export default async function handler(req, res) {
  try {
    const testKey = 'test:connection';
    const testValue = {
      message: 'Vercel KV is working!',
      timestamp: new Date().toISOString(),
      random: Math.random()
    };

    // Test write
    console.log('Testing KV write...');
    await VercelStorage.set(testKey, testValue, 60); // Expires in 60 seconds

    // Test read
    console.log('Testing KV read...');
    const retrieved = await VercelStorage.get(testKey);

    // Test student data
    console.log('Testing student data...');
    const testStudentId = 1;
    
    // Save test goal
    const goalData = await VercelStorage.saveGoalStatus(testStudentId, 'brainlift', true);
    
    // Get test goal
    const goalStatus = await VercelStorage.getGoalStatus(testStudentId);
    
    // Get today's completions
    const todayCompletions = await VercelStorage.getTodayCompletions();

    return res.status(200).json({
      success: true,
      kvAvailable: VercelStorage.isKVAvailable(),
      testWrite: testValue,
      testRead: retrieved,
      testGoalSave: goalData,
      testGoalGet: goalStatus,
      todayCompletions: Object.keys(todayCompletions).length,
      environment: {
        hasKvUrl: !!(process.env.KV_REST_API_URL || process.env.Data_KV_REST_API_URL),
        hasKvToken: !!(process.env.KV_REST_API_TOKEN || process.env.Data_KV_REST_API_TOKEN),
        kvUrl: process.env.Data_KV_REST_API_URL ? 'Data_KV_REST_API_URL' : 'KV_REST_API_URL'
      }
    });
  } catch (error) {
    console.error('KV test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      kvAvailable: VercelStorage.isKVAvailable(),
      environment: {
        hasKvUrl: !!(process.env.KV_REST_API_URL || process.env.Data_KV_REST_API_URL),
        hasKvToken: !!(process.env.KV_REST_API_TOKEN || process.env.Data_KV_REST_API_TOKEN),
        kvUrl: process.env.Data_KV_REST_API_URL ? 'Data_KV_REST_API_URL' : 'KV_REST_API_URL'
      }
    });
  }
}
