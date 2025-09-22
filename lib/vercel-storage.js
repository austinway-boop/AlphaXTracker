/**
 * Vercel KV Storage Helper
 * Uses Vercel KV (Redis) in production, falls back to memory in development
 */

let kv = null;
let memoryStore = {};

// Initialize KV client with proper environment variable mapping
let createClient;
try {
  ({ createClient } = require('@vercel/kv'));
} catch (error) {
  console.log('[@vercel/kv] Package not available, using memory storage');
}

// Map Upstash Data_ prefixed variables to what @vercel/kv expects
if (process.env.Data_KV_REST_API_URL && process.env.Data_KV_REST_API_TOKEN) {
  // Set the environment variables that @vercel/kv expects
  process.env.KV_REST_API_URL = process.env.Data_KV_REST_API_URL;
  process.env.KV_REST_API_TOKEN = process.env.Data_KV_REST_API_TOKEN;
  
  if (process.env.Data_KV_REST_API_READ_ONLY_TOKEN) {
    process.env.KV_REST_API_READ_ONLY_TOKEN = process.env.Data_KV_REST_API_READ_ONLY_TOKEN;
  }
}

// Try to create the KV client
try {
  if (createClient && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
    console.log('✅ Vercel KV/Upstash initialized');
    console.log('🔗 URL:', process.env.KV_REST_API_URL);
    
    // Test the connection
    kv.ping().then(() => {
      console.log('✅ KV connection verified');
    }).catch(err => {
      console.error('❌ KV connection failed:', err.message);
    });
  } else {
    console.log('📦 Using in-memory storage (KV not configured or createClient not available)');
    if (!createClient) console.log('  - createClient function not available');
    if (!process.env.KV_REST_API_URL) console.log('  - KV_REST_API_URL not set');
    if (!process.env.KV_REST_API_TOKEN) console.log('  - KV_REST_API_TOKEN not set');
  }
} catch (error) {
  console.error('❌ KV initialization error:', error);
  console.log('📦 Falling back to in-memory storage');
}

class VercelStorage {
  static getKey(type, studentId) {
    const date = new Date().toISOString().split('T')[0];
    return `${type}:${studentId}:${date}`;
  }

  static getProfileKey(studentId) {
    return `profile:${studentId}`;
  }

  static getGoalKey(studentId) {
    const date = new Date().toISOString().split('T')[0];
    return `goals:${studentId}:${date}`;
  }

  /**
   * Save goal completion status
   */
  static async saveGoalStatus(studentId, type, completed) {
    const key = this.getGoalKey(studentId);
    
    try {
      // Get current data
      let data = await this.get(key) || {};
      
      // Update the specific goal
      if (type === 'brainlift') {
        data.brainliftCompleted = completed;
        data.lastBrainliftDate = completed ? new Date().toISOString() : null;
        data.brainliftPoints = completed ? 10 : 0;
      } else if (type === 'dailyGoal') {
        data.dailyGoalCompleted = completed;
        data.lastDailyGoalDate = completed ? new Date().toISOString() : null;
        data.dailyGoalPoints = completed ? 5 : 0;
      }
      
      data.totalPoints = (data.brainliftPoints || 0) + (data.dailyGoalPoints || 0);
      data.lastUpdated = new Date().toISOString();
      data.studentId = studentId;
      
      // Save to storage with 24 hour expiry
      await this.set(key, data, 86400);
      
      console.log(`Saved ${type} = ${completed} for student ${studentId}`);
      return data;
      
    } catch (error) {
      console.error('Error saving goal status:', error);
      return null;
    }
  }

  /**
   * Get goal completion status
   */
  static async getGoalStatus(studentId) {
    const key = this.getGoalKey(studentId);
    
    try {
      const data = await this.get(key);
      if (data) {
        console.log(`Retrieved goals for student ${studentId}:`, data);
        return data;
      }
      
      // Return default if not found
      return {
        brainliftCompleted: false,
        dailyGoalCompleted: false,
        lastBrainliftDate: null,
        lastDailyGoalDate: null,
        totalPoints: 0
      };
      
    } catch (error) {
      console.error('Error getting goal status:', error);
      return {
        brainliftCompleted: false,
        dailyGoalCompleted: false,
        lastBrainliftDate: null,
        lastDailyGoalDate: null,
        totalPoints: 0
      };
    }
  }

  /**
   * Update student profile data
   */
  static async updateProfile(studentId, profileData) {
    const key = this.getProfileKey(studentId);
    
    try {
      // Get existing profile
      let existing = await this.get(key) || {};
      
      // Merge with new data
      const updated = {
        ...existing,
        ...profileData,
        lastUpdated: new Date().toISOString()
      };
      
      // Save with 7 day expiry
      await this.set(key, updated, 604800);
      
      console.log(`Updated profile for student ${studentId}`);
      return updated;
      
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  /**
   * Get student profile
   */
  static async getProfile(studentId) {
    const key = this.getProfileKey(studentId);
    
    try {
      const profile = await this.get(key);
      if (profile) {
        console.log(`Retrieved profile for student ${studentId}`);
        return profile;
      }
      return null;
      
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Clear all data for a student
   */
  static async clearStudent(studentId) {
    const goalKey = this.getGoalKey(studentId);
    const profileKey = this.getProfileKey(studentId);
    
    try {
      await this.del(goalKey);
      await this.del(profileKey);
      console.log(`Cleared all data for student ${studentId}`);
      return true;
      
    } catch (error) {
      console.error('Error clearing student data:', error);
      return false;
    }
  }

  /**
   * Low-level storage operations with fallback
   */
  static async get(key) {
    if (kv) {
      try {
        console.log(`[KV GET] Fetching key: ${key}`);
        const value = await kv.get(key);
        console.log(`[KV GET] Retrieved value:`, value ? 'found' : 'not found');
        return value;
      } catch (error) {
        console.error('[KV GET] Error:', error.message);
        return memoryStore[key] || null;
      }
    } else {
      // Fallback to memory storage
      console.log(`[MEMORY GET] Fetching key: ${key}`);
      return memoryStore[key] || null;
    }
  }

  static async set(key, value, exSeconds = 86400) {
    if (kv) {
      try {
        console.log(`[KV SET] Saving key: ${key}, expiry: ${exSeconds}s`);
        const result = await kv.set(key, value, { ex: exSeconds });
        console.log(`[KV SET] Save result:`, result);
        
        // Also save to memory as backup
        memoryStore[key] = value;
        return true;
      } catch (error) {
        console.error('[KV SET] Error:', error.message);
        // Fallback to memory
        memoryStore[key] = value;
        return true;
      }
    } else {
      // Fallback to memory storage
      console.log(`[MEMORY SET] Saving key: ${key}`);
      memoryStore[key] = value;
      
      // Simulate expiry in memory (optional)
      if (exSeconds > 0) {
        setTimeout(() => {
          delete memoryStore[key];
        }, exSeconds * 1000);
      }
      
      return true;
    }
  }

  static async del(key) {
    if (kv) {
      try {
        await kv.del(key);
        return true;
      } catch (error) {
        console.error('Vercel KV del error:', error);
        delete memoryStore[key];
        return true;
      }
    } else {
      // Fallback to memory storage
      delete memoryStore[key];
      return true;
    }
  }

  /**
   * Get all today's completions (for admin/leaderboard)
   * Note: Upstash/Vercel KV doesn't support pattern scanning easily,
   * so we'll track completions differently
   */
  static async getTodayCompletions() {
    const date = new Date().toISOString().split('T')[0];
    
    if (kv) {
      try {
        // Instead of scanning, we'll get a list of known student IDs
        // For now, just check the common student IDs (1-50)
        const completions = {};
        
        for (let studentId = 1; studentId <= 50; studentId++) {
          const key = `goals:${studentId}:${date}`;
          try {
            const data = await kv.get(key);
            if (data && data.studentId) {
              completions[data.studentId] = data;
            }
          } catch (err) {
            // Ignore individual errors
          }
        }
        
        return completions;
      } catch (error) {
        console.error('Error getting today completions:', error);
        return {};
      }
    } else {
      // Memory fallback - filter by today's date
      const completions = {};
      for (const [key, value] of Object.entries(memoryStore)) {
        if (key.includes(date) && key.startsWith('goals:')) {
          if (value && value.studentId) {
            completions[value.studentId] = value;
          }
        }
      }
      return completions;
    }
  }

  /**
   * Check if Vercel KV is available
   */
  static isKVAvailable() {
    return kv !== null;
  }
}

module.exports = VercelStorage;
