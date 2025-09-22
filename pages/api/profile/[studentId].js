// API endpoint for managing student profiles
import dataManager from '../../../lib/data-manager';
import { getGoogleSheetsDB } from '../../../lib/sheets-database';

export default async function handler(req, res) {
  const { studentId } = req.query;
  const fresh = req.query.fresh === 'true';
  
  console.log(`[API /profile/${studentId}] Request:`, {
    method: req.method,
    fresh,
    body: req.body
  });

  if (req.method === 'GET') {
    try {
      // Clear cache if fresh data requested
      if (fresh) {
        dataManager.clearCache(studentId);
        console.log(`[API /profile/${studentId}] Cache cleared for fresh data`);
      }

      // Get profile from data manager (local-first)
      let profile = await dataManager.getProfile(studentId);
      
      console.log(`[API /profile/${studentId}] Profile retrieved:`, profile);

      // Try to sync with Google Sheets if available (don't block)
      if (!fresh) {
        setTimeout(async () => {
          try {
            const { sheetsDB, available } = await getGoogleSheetsDB();
            if (available && sheetsDB) {
              const sheetsProfile = await sheetsDB.getProfile(studentId);
              if (sheetsProfile) {
                // Update local with Sheets data
                await dataManager.saveProfile(studentId, sheetsProfile);
                console.log(`[API /profile/${studentId}] Synced with Google Sheets`);
              }
            }
          } catch (error) {
            console.error(`[API /profile/${studentId}] Sheets sync error:`, error.message);
          }
        }, 100);
      }

      return res.status(200).json({
        success: true,
        profile
      });
    } catch (error) {
      console.error(`[API /profile/${studentId}] GET Error:`, error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
        message: error.message
      });
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const profileData = req.body;
      
      console.log(`[API /profile/${studentId}] Saving profile:`, profileData);

      // Save using data manager (local-first)
      const savedProfile = await dataManager.saveProfile(studentId, profileData);
      
      // Also save today's goal history
      const today = new Date().toISOString().split('T')[0];
      await dataManager.addGoalHistory(studentId, {
        date: today,
        dailyGoal: savedProfile.dailyGoal,
        sessionGoal: savedProfile.sessionGoal,
        projectOneliner: savedProfile.projectOneliner,
        brainliftCompleted: savedProfile.brainliftCompleted,
        dailyGoalCompleted: savedProfile.dailyGoalCompleted
      });

      console.log(`[API /profile/${studentId}] Profile saved successfully`);

      // Try to sync with Google Sheets in background
      setTimeout(async () => {
        try {
          const { sheetsDB, available } = await getGoogleSheetsDB();
          if (available && sheetsDB) {
            sheetsDB.clearCache(`profile:${studentId}`);
            await sheetsDB.updateProfile(studentId, savedProfile);
            
            // Add to goal history in Sheets
            await sheetsDB.addGoalHistory(studentId, {
              date: today,
              dailyGoal: savedProfile.dailyGoal,
              sessionGoal: savedProfile.sessionGoal,
              projectOneliner: savedProfile.projectOneliner,
              brainliftCompleted: savedProfile.brainliftCompleted,
              dailyGoalCompleted: savedProfile.dailyGoalCompleted,
              audienceX: savedProfile.goals?.x || 0,
              audienceYouTube: savedProfile.goals?.youtube || 0,
              audienceTikTok: savedProfile.goals?.tiktok || 0,
              audienceInstagram: savedProfile.goals?.instagram || 0
            });
            
            console.log(`[API /profile/${studentId}] Synced with Google Sheets`);
          }
        } catch (error) {
          console.error(`[API /profile/${studentId}] Sheets sync error:`, error.message);
        }
      }, 100);

      return res.status(200).json({
        success: true,
        profile: savedProfile
      });
    } catch (error) {
      console.error(`[API /profile/${studentId}] PUT/POST Error:`, error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save profile',
        message: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}