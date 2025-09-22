/**
 * Simple Storage Solution
 * Uses file system in development, memory in production
 * Persists data without external dependencies
 */

const fs = require('fs');
const path = require('path');

// Storage location
const STORAGE_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data', 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'goals.json');

// In-memory cache - This persists for the lifetime of the serverless function
// On Vercel, this will persist between requests for a short time (warm starts)
let memoryCache = {};
let lastSave = Date.now();

// For Vercel, we primarily use memory cache since file system is ephemeral
// The memory cache will persist during warm starts (typically 5-10 minutes)

// Ensure storage directory exists
if (!process.env.VERCEL) {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch (error) {
    console.log('Could not create storage directory:', error.message);
  }
}

// Load existing data on startup
try {
  if (fs.existsSync(STORAGE_FILE)) {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    memoryCache = JSON.parse(data);
    console.log('📂 Loaded existing storage data');
  }
} catch (error) {
  console.log('📦 Starting with fresh storage');
}

class SimpleStorage {
  /**
   * Save data to storage
   */
  static save() {
    try {
      // Save immediately, no throttling - data persistence is critical
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(memoryCache, null, 2));
      lastSave = Date.now();
      console.log('💾 Data persisted');
    } catch (error) {
      // On Vercel, file saves might fail but memory cache still works
      if (!process.env.VERCEL) {
        console.error('Could not save to file:', error.message);
      }
    }
  }

  /**
   * Load data from storage
   */
  static load() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const data = fs.readFileSync(STORAGE_FILE, 'utf8');
        const loaded = JSON.parse(data);
        // Merge with existing memory cache to preserve any recent changes
        memoryCache = { ...loaded, ...memoryCache };
        console.log('📂 Loaded storage data');
        return true;
      }
    } catch (error) {
      console.log('📦 Could not load storage:', error.message);
    }
    return false;
  }

  /**
   * Get goal key
   */
  static getGoalKey(studentId) {
    const date = new Date().toISOString().split('T')[0];
    return `goals:${studentId}:${date}`;
  }

  /**
   * Save goal status
   */
  static async saveGoalStatus(studentId, type, completed) {
    const key = this.getGoalKey(studentId);
    
    // Get or create goal data
    let data = memoryCache[key] || {
      studentId,
      brainliftCompleted: false,
      dailyGoalCompleted: false,
      lastBrainliftDate: null,
      lastDailyGoalDate: null,
      totalPoints: 0
    };
    
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
    
    // Save to memory
    memoryCache[key] = data;
    
    // Save to file (async)
    this.save();
    
    console.log(`✅ Saved ${type} = ${completed} for student ${studentId}`);
    return data;
  }

  /**
   * Get goal status
   */
  static async getGoalStatus(studentId) {
    // Try to load latest data first
    this.load();
    
    const key = this.getGoalKey(studentId);
    const data = memoryCache[key];
    
    if (data) {
      console.log(`📋 Retrieved goals for student ${studentId}:`, {
        brainlift: data.brainliftCompleted,
        dailyGoal: data.dailyGoalCompleted
      });
      return data;
    }
    
    // Return defaults
    console.log(`📋 No saved goals for student ${studentId}, returning defaults`);
    return {
      studentId,
      brainliftCompleted: false,
      dailyGoalCompleted: false,
      lastBrainliftDate: null,
      lastDailyGoalDate: null,
      totalPoints: 0
    };
  }

  /**
   * Clear student data
   */
  static async clearStudent(studentId) {
    const key = this.getGoalKey(studentId);
    delete memoryCache[key];
    this.save();
    console.log(`🗑️ Cleared data for student ${studentId}`);
    return true;
  }

  /**
   * Get all today's completions
   */
  static async getTodayCompletions() {
    const date = new Date().toISOString().split('T')[0];
    const completions = {};
    
    for (const [key, value] of Object.entries(memoryCache)) {
      if (key.includes(date) && key.startsWith('goals:')) {
        if (value && value.studentId) {
          completions[value.studentId] = value;
        }
      }
    }
    
    return completions;
  }

  /**
   * Update profile (for compatibility)
   */
  static async updateProfile(studentId, profileData) {
    // For compatibility with existing code
    return profileData;
  }

  /**
   * Get profile (for compatibility)
   */
  static async getProfile(studentId) {
    // Return null to fall back to other sources
    return null;
  }

  /**
   * Check if storage is available
   */
  static isAvailable() {
    return true;
  }

  /**
   * Clean up old data (older than 7 days)
   */
  static cleanup() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];
    
    let cleaned = 0;
    for (const key of Object.keys(memoryCache)) {
      if (key.startsWith('goals:')) {
        const dateMatch = key.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch && dateMatch[0] < cutoffDate) {
          delete memoryCache[key];
          cleaned++;
        }
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old entries`);
      this.save();
    }
  }
}

// Run cleanup on startup
SimpleStorage.cleanup();

// Auto-save periodically
setInterval(() => {
  SimpleStorage.save();
}, 30000); // Every 30 seconds

module.exports = SimpleStorage;
