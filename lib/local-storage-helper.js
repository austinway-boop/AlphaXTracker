/**
 * Local storage helper for persisting data when Google Sheets is not available
 * This ensures goal completions and other data persist across page refreshes
 */

const STORAGE_PREFIX = 'alphax_';

class LocalStorageHelper {
  // Get data from localStorage
  static get(key) {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  // Set data in localStorage
  static set(key, value) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  // Remove data from localStorage
  static remove(key) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  // Get student's goal completion status
  static getGoalStatus(studentId) {
    const today = new Date().toISOString().split('T')[0];
    const key = `goals_${studentId}_${today}`;
    return this.get(key) || {
      brainliftCompleted: false,
      dailyGoalCompleted: false,
      lastBrainliftDate: null,
      lastDailyGoalDate: null
    };
  }

  // Set student's goal completion status
  static setGoalStatus(studentId, status) {
    const today = new Date().toISOString().split('T')[0];
    const key = `goals_${studentId}_${today}`;
    return this.set(key, status);
  }

  // Get student's profile data
  static getProfile(studentId) {
    return this.get(`profile_${studentId}`);
  }

  // Set student's profile data
  static setProfile(studentId, profile) {
    return this.set(`profile_${studentId}`, profile);
  }

  // Get all goal history for a student
  static getGoalHistory(studentId) {
    return this.get(`history_${studentId}`) || [];
  }

  // Add to goal history
  static addToGoalHistory(studentId, entry) {
    const history = this.getGoalHistory(studentId);
    const today = new Date().toISOString().split('T')[0];
    
    // Remove any existing entry for today
    const filteredHistory = history.filter(h => h.date !== today);
    
    // Add new entry
    filteredHistory.push({
      date: today,
      ...entry
    });
    
    // Keep only last 30 days
    const sorted = filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sorted.slice(0, 30);
    
    return this.set(`history_${studentId}`, recent);
  }

  // Clear all data for a student
  static clearStudentData(studentId) {
    const today = new Date().toISOString().split('T')[0];
    this.remove(`goals_${studentId}_${today}`);
    this.remove(`profile_${studentId}`);
    this.remove(`history_${studentId}`);
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalStorageHelper;
}

// Export for browser environments
if (typeof window !== 'undefined') {
  window.LocalStorageHelper = LocalStorageHelper;
}
