/**
 * In-memory store for persisting data during the session
 * This helps maintain goal completion status when Google Sheets is not available
 */

class MemoryStore {
  constructor() {
    // Store goal completions by student ID and date
    this.goalCompletions = {};
    // Store profile updates
    this.profiles = {};
    // Store the session start time
    this.sessionStart = new Date().toISOString();
  }

  // Get or create today's goal status for a student
  getGoalStatus(studentId) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${studentId}_${today}`;
    
    if (!this.goalCompletions[key]) {
      this.goalCompletions[key] = {
        brainliftCompleted: false,
        dailyGoalCompleted: false,
        lastBrainliftDate: null,
        lastDailyGoalDate: null,
        points: 0
      };
    }
    
    return this.goalCompletions[key];
  }

  // Update goal status
  updateGoalStatus(studentId, type, completed = true) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${studentId}_${today}`;
    const timestamp = new Date().toISOString();
    
    if (!this.goalCompletions[key]) {
      this.goalCompletions[key] = {
        brainliftCompleted: false,
        dailyGoalCompleted: false,
        lastBrainliftDate: null,
        lastDailyGoalDate: null,
        points: 0
      };
    }
    
    if (type === 'brainlift') {
      this.goalCompletions[key].brainliftCompleted = completed;
      if (completed) {
        this.goalCompletions[key].lastBrainliftDate = timestamp;
        this.goalCompletions[key].points += 10;
      }
    } else if (type === 'dailyGoal') {
      this.goalCompletions[key].dailyGoalCompleted = completed;
      if (completed) {
        this.goalCompletions[key].lastDailyGoalDate = timestamp;
        this.goalCompletions[key].points += 5;
      }
    }
    
    return this.goalCompletions[key];
  }

  // Get profile updates
  getProfile(studentId) {
    return this.profiles[studentId] || null;
  }

  // Update profile
  updateProfile(studentId, updates) {
    if (!this.profiles[studentId]) {
      this.profiles[studentId] = {};
    }
    Object.assign(this.profiles[studentId], updates);
    return this.profiles[studentId];
  }

  // Check if a goal was completed today
  isGoalCompletedToday(studentId, type) {
    const status = this.getGoalStatus(studentId);
    if (type === 'brainlift') {
      return status.brainliftCompleted;
    } else if (type === 'dailyGoal') {
      return status.dailyGoalCompleted;
    }
    return false;
  }

  // Get all completions for today
  getTodayCompletions() {
    const today = new Date().toISOString().split('T')[0];
    const completions = {};
    
    for (const key in this.goalCompletions) {
      if (key.includes(today)) {
        const studentId = key.split('_')[0];
        completions[studentId] = this.goalCompletions[key];
      }
    }
    
    return completions;
  }

  // Clear all data (useful for testing)
  clear() {
    this.goalCompletions = {};
    this.profiles = {};
  }

  // Get session info
  getSessionInfo() {
    return {
      sessionStart: this.sessionStart,
      totalGoalCompletions: Object.keys(this.goalCompletions).length,
      totalProfileUpdates: Object.keys(this.profiles).length
    };
  }
}

// Create a singleton instance
const memoryStore = new MemoryStore();

module.exports = memoryStore;
