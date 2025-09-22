// Data Manager - Robust data handling with local-first approach
import fs from 'fs';
import path from 'path';

class DataManager {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.ensureDirectories();
    this.syncQueue = [];
    this.processing = false;
  }

  ensureDirectories() {
    const dirs = [
      this.dataDir,
      path.join(this.dataDir, 'profiles'),
      path.join(this.dataDir, 'history'),
      path.join(this.dataDir, 'cache'),
      path.join(this.dataDir, 'sync-queue')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Get student profile with local-first approach
  async getProfile(studentId) {
    console.log(`[DataManager] Getting profile for student ${studentId}`);
    
    const profilePath = path.join(this.dataDir, 'profiles', `student_${studentId}.json`);
    
    try {
      if (fs.existsSync(profilePath)) {
        const data = fs.readFileSync(profilePath, 'utf8');
        const profile = JSON.parse(data);
        console.log(`[DataManager] Profile loaded from local storage:`, profile);
        return profile;
      }
    } catch (error) {
      console.error(`[DataManager] Error reading local profile:`, error);
    }
    
    // Return default profile structure
    const defaultProfile = {
      studentId: parseInt(studentId),
      dailyGoal: '',
      sessionGoal: '',
      projectOneliner: '',
      brainliftCompleted: false,
      lastBrainliftDate: null,
      dailyGoalCompleted: false,
      lastDailyGoalDate: null,
      goals: {
        x: 0,
        youtube: 0,
        tiktok: 0,
        instagram: 0
      },
      platforms: {
        x: '',
        youtube: '',
        tiktok: '',
        instagram: ''
      },
      updatedAt: new Date().toISOString()
    };
    
    console.log(`[DataManager] Returning default profile:`, defaultProfile);
    return defaultProfile;
  }

  // Save student profile locally
  async saveProfile(studentId, profileData) {
    console.log(`[DataManager] Saving profile for student ${studentId}:`, profileData);
    
    const profilePath = path.join(this.dataDir, 'profiles', `student_${studentId}.json`);
    
    // Ensure we have all required fields
    const profile = {
      studentId: parseInt(studentId),
      dailyGoal: profileData.dailyGoal || '',
      sessionGoal: profileData.sessionGoal || '',
      projectOneliner: profileData.projectOneliner || '',
      brainliftCompleted: profileData.brainliftCompleted || false,
      lastBrainliftDate: profileData.lastBrainliftDate || null,
      dailyGoalCompleted: profileData.dailyGoalCompleted || false,
      lastDailyGoalDate: profileData.lastDailyGoalDate || null,
      goals: {
        x: profileData.goals?.x || 0,
        youtube: profileData.goals?.youtube || 0,
        tiktok: profileData.goals?.tiktok || 0,
        instagram: profileData.goals?.instagram || 0
      },
      platforms: {
        x: profileData.platforms?.x || '',
        youtube: profileData.platforms?.youtube || '',
        tiktok: profileData.platforms?.tiktok || '',
        instagram: profileData.platforms?.instagram || ''
      },
      updatedAt: new Date().toISOString()
    };
    
    try {
      fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
      console.log(`[DataManager] Profile saved successfully to ${profilePath}`);
      
      // Add to sync queue for later Google Sheets update
      this.addToSyncQueue('profile', studentId, profile);
      
      return profile;
    } catch (error) {
      console.error(`[DataManager] Error saving profile:`, error);
      throw error;
    }
  }

  // Update goal completion status
  async updateGoalCompletion(studentId, goalType, completed, goalText = null) {
    console.log(`[DataManager] Updating ${goalType} completion for student ${studentId}: ${completed}`);
    
    const profile = await this.getProfile(studentId);
    const today = new Date().toISOString().split('T')[0];
    
    // Update profile based on goal type
    if (goalType === 'brainlift') {
      profile.brainliftCompleted = completed;
      profile.lastBrainliftDate = completed ? today : null;
    } else if (goalType === 'dailyGoal') {
      profile.dailyGoalCompleted = completed;
      profile.lastDailyGoalDate = completed ? today : null;
      if (goalText) {
        profile.dailyGoal = goalText;
      }
    }
    
    // Save updated profile
    const updatedProfile = await this.saveProfile(studentId, profile);
    
    // Also update history
    await this.addGoalHistory(studentId, {
      date: today,
      brainliftCompleted: profile.brainliftCompleted,
      dailyGoalCompleted: profile.dailyGoalCompleted,
      dailyGoal: profile.dailyGoal,
      sessionGoal: profile.sessionGoal,
      projectOneliner: profile.projectOneliner
    });
    
    return updatedProfile;
  }

  // Add goal history entry
  async addGoalHistory(studentId, historyData) {
    console.log(`[DataManager] Adding goal history for student ${studentId}:`, historyData);
    
    const historyPath = path.join(this.dataDir, 'history', `student_${studentId}_history.json`);
    
    let history = {};
    try {
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf8');
        history = JSON.parse(data);
      }
    } catch (error) {
      console.error(`[DataManager] Error reading history:`, error);
    }
    
    // Add or update entry for the date
    const date = historyData.date || new Date().toISOString().split('T')[0];
    history[date] = {
      ...history[date],
      ...historyData,
      date,
      updatedAt: new Date().toISOString()
    };
    
    try {
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
      console.log(`[DataManager] History saved successfully`);
      
      // Add to sync queue
      this.addToSyncQueue('history', studentId, history[date]);
      
      return history[date];
    } catch (error) {
      console.error(`[DataManager] Error saving history:`, error);
      throw error;
    }
  }

  // Get goal history
  async getGoalHistory(studentId, days = 30) {
    console.log(`[DataManager] Getting goal history for student ${studentId} (last ${days} days)`);
    
    const historyPath = path.join(this.dataDir, 'history', `student_${studentId}_history.json`);
    
    try {
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf8');
        const history = JSON.parse(data);
        
        // Filter by date range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        
        const filtered = Object.values(history).filter(entry => {
          return entry.date >= cutoffStr;
        });
        
        console.log(`[DataManager] Returning ${filtered.length} history entries`);
        return filtered;
      }
    } catch (error) {
      console.error(`[DataManager] Error reading history:`, error);
    }
    
    return [];
  }

  // Add item to sync queue for background Google Sheets updates
  addToSyncQueue(type, studentId, data) {
    const queueItem = {
      type,
      studentId,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    
    this.syncQueue.push(queueItem);
    console.log(`[DataManager] Added to sync queue:`, queueItem);
    
    // Process queue in background (don't await)
    this.processSyncQueue();
  }

  // Process sync queue in background
  async processSyncQueue() {
    if (this.processing || this.syncQueue.length === 0) {
      return;
    }
    
    this.processing = true;
    console.log(`[DataManager] Processing sync queue (${this.syncQueue.length} items)`);
    
    // Process items with delay to avoid rate limits
    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      
      try {
        // Try to sync with Google Sheets (implement later)
        // For now, just save to sync-queue directory
        const queuePath = path.join(
          this.dataDir, 
          'sync-queue', 
          `${item.type}_${item.studentId}_${Date.now()}.json`
        );
        fs.writeFileSync(queuePath, JSON.stringify(item, null, 2));
        
        console.log(`[DataManager] Queued for later sync:`, item.type, item.studentId);
      } catch (error) {
        console.error(`[DataManager] Sync queue error:`, error);
        item.attempts++;
        if (item.attempts < 3) {
          this.syncQueue.push(item); // Retry later
        }
      }
      
      // Wait 500ms between items to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.processing = false;
  }

  // Check today's goal status
  async checkTodayGoals(studentId) {
    console.log(`[DataManager] Checking today's goals for student ${studentId}`);
    
    const profile = await this.getProfile(studentId);
    const today = new Date().toISOString().split('T')[0];
    
    const result = {
      date: today,
      brainlift: profile.lastBrainliftDate === today,
      dailyGoal: profile.lastDailyGoalDate === today,
      dailyGoalText: profile.dailyGoal || '',
      sessionGoal: profile.sessionGoal || '',
      projectOneliner: profile.projectOneliner || ''
    };
    
    console.log(`[DataManager] Today's goal status:`, result);
    return result;
  }

  // Clear cache for a student
  clearCache(studentId) {
    console.log(`[DataManager] Clearing cache for student ${studentId}`);
    // Implementation for cache clearing if needed
  }
}

// Export singleton instance
const dataManager = new DataManager();
export default dataManager;
