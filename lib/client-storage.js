/**
 * Client-side storage helper for maintaining goal state in the browser
 */

class ClientStorage {
  static getKey(studentId, date = null) {
    const dateStr = date || new Date().toISOString().split('T')[0];
    return `alphax_goals_${studentId}_${dateStr}`;
  }

  static saveGoalStatus(studentId, type, completed) {
    if (typeof window === 'undefined') return;
    
    const key = this.getKey(studentId);
    let data = {};
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        data = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    if (type === 'brainlift') {
      data.brainliftCompleted = completed;
      if (completed) {
        data.lastBrainliftDate = new Date().toISOString();
      }
    } else if (type === 'dailyGoal') {
      data.dailyGoalCompleted = completed;
      if (completed) {
        data.lastDailyGoalDate = new Date().toISOString();
      }
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Saved ${type} = ${completed} to local storage for student ${studentId}`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getGoalStatus(studentId) {
    if (typeof window === 'undefined') return null;
    
    const key = this.getKey(studentId);
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        console.log(`Retrieved from local storage for student ${studentId}:`, data);
        return data;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    return null;
  }

  static clearGoalStatus(studentId) {
    if (typeof window === 'undefined') return;
    
    const key = this.getKey(studentId);
    try {
      localStorage.removeItem(key);
      console.log(`Cleared local storage for student ${studentId}`);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  static mergeWithProfile(profile, studentId) {
    const stored = this.getGoalStatus(studentId);
    if (!stored) return profile;
    
    return {
      ...profile,
      brainliftCompleted: stored.brainliftCompleted !== undefined ? stored.brainliftCompleted : profile.brainliftCompleted,
      lastBrainliftDate: stored.lastBrainliftDate || profile.lastBrainliftDate,
      dailyGoalCompleted: stored.dailyGoalCompleted !== undefined ? stored.dailyGoalCompleted : profile.dailyGoalCompleted,
      lastDailyGoalDate: stored.lastDailyGoalDate || profile.lastDailyGoalDate
    };
  }
}

// Export for use in Next.js pages
if (typeof window !== 'undefined') {
  window.ClientStorage = ClientStorage;
}

export default ClientStorage;
