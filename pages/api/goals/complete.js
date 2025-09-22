// API endpoint for updating goal completion status
import dataManager from '../../../lib/data-manager';
import { getGoogleSheetsDB } from '../../../lib/sheets-database';

export default async function handler(req, res) {
  console.log('[API /goals/complete] Request received:', {
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentId, goalType, completed, goalText } = req.body;
    
    console.log('[API /goals/complete] Processing:', {
      studentId,
      goalType,
      completed,
      goalText
    });

    if (!studentId || !goalType) {
      console.error('[API /goals/complete] Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    // Update using the new data manager (local-first)
    const updatedProfile = await dataManager.updateGoalCompletion(
      studentId,
      goalType,
      completed,
      goalText
    );

    console.log('[API /goals/complete] Profile updated locally:', updatedProfile);

    // Try to sync with Google Sheets in background (don't block response)
    setTimeout(async () => {
      try {
        console.log('[API /goals/complete] Attempting Google Sheets sync...');
        const { sheetsDB, available } = await getGoogleSheetsDB();
        
        if (available && sheetsDB) {
          // Clear any cached data
          sheetsDB.clearCache(`profile:${studentId}`);
          sheetsDB.clearCache(`history:${studentId}`);
          
          // Update profile in Sheets
          await sheetsDB.updateProfile(studentId, updatedProfile);
          
          // Add to goal history
          const today = new Date().toISOString().split('T')[0];
          await sheetsDB.addGoalHistory(studentId, {
            date: today,
            dailyGoal: updatedProfile.dailyGoal,
            sessionGoal: updatedProfile.sessionGoal,
            projectOneliner: updatedProfile.projectOneliner,
            brainliftCompleted: updatedProfile.brainliftCompleted,
            dailyGoalCompleted: updatedProfile.dailyGoalCompleted,
            audienceX: updatedProfile.goals?.x || 0,
            audienceYouTube: updatedProfile.goals?.youtube || 0,
            audienceTikTok: updatedProfile.goals?.tiktok || 0,
            audienceInstagram: updatedProfile.goals?.instagram || 0
          });
          
          console.log('[API /goals/complete] Google Sheets sync successful');
        } else {
          console.log('[API /goals/complete] Google Sheets unavailable, using local storage only');
        }
      } catch (error) {
        console.error('[API /goals/complete] Google Sheets sync error:', error.message);
        // Don't throw - we already have local data saved
      }
    }, 100); // Small delay to not block response

    // Return success immediately (local save was successful)
    return res.status(200).json({
      success: true,
      message: `${goalType} completion status updated successfully`,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('[API /goals/complete] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update goal completion',
      message: error.message
    });
  }
}