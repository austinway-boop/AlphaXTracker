/**
 * Upstash Redis Database Module
 * This replaces Google Sheets with a fast, scalable Redis database
 */

const { Redis } = require('@upstash/redis');

class RedisDatabase {
  constructor() {
    this.redis = null;
    this.initialized = false;
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds cache
  }

  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Initialize Upstash Redis client
      this.redis = new Redis({
        url: process.env.DATA_KV_REST_API_URL || "https://grand-lizard-8208.upstash.io",
        token: process.env.DATA_KV_REST_API_TOKEN || "ASAQAAImcDJhZjNlZGQwMmY2MzQ0ODYyOTc3OTU3NDgwNTZiMzZjY3AyODIwOA",
      });
      
      // Test connection
      await this.redis.ping();
      this.initialized = true;
      console.log('✓ Redis Database initialized successfully');
      
      // Initialize default data structures if needed
      await this.initializeDataStructures();
      
      return true;
    } catch (error) {
      console.error('❌ Redis initialization failed:', error.message);
      return false;
    }
  }

  async initializeDataStructures() {
    // Check if students exist, if not, initialize with default data
    const studentsExist = await this.redis.exists('students');
    if (!studentsExist) {
      console.log('Initializing default student data...');
      await this.initializeDefaultStudents();
    }
  }

  async initializeDefaultStudents() {
    // Student data from Names.md (without test accounts)
    const students = [
      // Honors students (based on the list)
      { id: 1, email: 'alex.mathew@alpha.school', firstName: 'Alex', lastName: 'Mathew', honors: true, house: 'House 1' },
      { id: 2, email: 'elle.liemandt@alpha.school', firstName: 'Elle', lastName: 'Liemandt', honors: true, house: 'House 1' },
      { id: 3, email: 'austin.way@alpha.school', firstName: 'Austin', lastName: 'Way', honors: true, house: 'House 1' },
      { id: 4, email: 'caleb.walker@alpha.school', firstName: 'Caleb', lastName: 'Walker', honors: true, house: 'House 1' },
      { id: 5, email: 'cruce.saunders@alpha.school', firstName: 'Cruce', lastName: 'Saunders', honors: true, house: 'House 1' },
      { id: 6, email: 'ella.gremont@alpha.school', firstName: 'Ella', lastName: 'Gremont', honors: true, house: 'House 1' },
      { id: 7, email: 'geetesh.parelly@alpha.school', firstName: 'Geetesh', lastName: 'Parelly', honors: true, house: 'House 1' },
      { id: 8, email: 'jackson.price@alpha.school', firstName: 'Jackson', lastName: 'Price', honors: true, house: 'House 1' },
      { id: 9, email: 'kavin.lingham@alpha.school', firstName: 'Kavin', lastName: 'Lingham', honors: true, house: 'House 1' },
      { id: 10, email: 'lincoln.thomas@alpha.school', firstName: 'Lincoln', lastName: 'Thomas', honors: true, house: 'House 1' },
      { id: 11, email: 'maddie.price@alpha.school', firstName: 'Maddie', lastName: 'Price', honors: true, house: 'House 1' },
      { id: 12, email: 'michael.cai@alpha.school', firstName: 'Michael', lastName: 'Cai', honors: true, house: 'House 1' },
      { id: 13, email: 'reuben.runacres@alpha.school', firstName: 'Reuben', lastName: 'Runacres', honors: true, house: 'House 1' },
      { id: 14, email: 'sarabeth.way@alpha.school', firstName: 'Sara Beth', lastName: 'Way', honors: true, house: 'House 1' },
      { id: 15, email: 'sloane.price@alpha.school', firstName: 'Sloane', lastName: 'Price', honors: true, house: 'House 1' },
      { id: 16, email: 'sloka.vudumu@alpha.school', firstName: 'Sloka', lastName: 'Vudumu', honors: true, house: 'House 1' },
      { id: 17, email: 'stella.cole@alpha.school', firstName: 'Stella', lastName: 'Cole', honors: true, house: 'House 1' },
      
      // Non-honors students
      { id: 18, email: 'emily.smith@alpha.school', firstName: 'Emily', lastName: 'Smith', honors: false, house: 'House 2' },
      { id: 19, email: 'lucia.scaletta@alpha.school', firstName: 'Lucia', lastName: 'Scaletta', honors: false, house: 'House 2' },
      { id: 20, email: 'tatum.lemkau@alpha.school', firstName: 'Tatum', lastName: 'Lemkau', honors: false, house: 'House 2' },
      { id: 21, email: 'jeremy.wang@alpha.school', firstName: 'Jeremy', lastName: 'Wang', honors: false, house: 'House 2' },
      { id: 22, email: 'madeleine.grams@alpha.school', firstName: 'Madeleine', lastName: 'Grams', honors: false, house: 'House 2' },
      { id: 23, email: 'malaika.negrete@alpha.school', firstName: 'Malaika', lastName: 'Negrete', honors: false, house: 'House 2' },
      { id: 24, email: 'paty.margain@alpha.school', firstName: 'Paty', lastName: 'Margain-Junco', honors: false, house: 'House 2' },
      { id: 25, email: 'aoife.huey@alpha.school', firstName: 'Aoife', lastName: 'Huey', honors: false, house: 'House 2' },
      { id: 26, email: 'ella.dietz@alpha.school', firstName: 'Ella', lastName: 'Dietz', honors: false, house: 'House 2' },
      { id: 27, email: 'emma.cotner@alpha.school', firstName: 'Emma', lastName: 'Cotner', honors: false, house: 'House 2' },
      { id: 28, email: 'mollie.mcdougald@alpha.school', firstName: 'Mollie Anne', lastName: 'McDougald', honors: false, house: 'House 2' },
      { id: 29, email: 'stella.grams@alpha.school', firstName: 'Stella', lastName: 'Grams', honors: false, house: 'House 2' },
      { id: 30, email: 'adrienne.laswell@alpha.school', firstName: 'Adrienne', lastName: 'Laswell', honors: false, house: 'House 3' },
      { id: 31, email: 'aheli.shah@alpha.school', firstName: 'Aheli', lastName: 'Shah', honors: false, house: 'House 3' },
      { id: 32, email: 'ali.romman@alpha.school', firstName: 'Ali', lastName: 'Romman', honors: false, house: 'House 3' },
      { id: 33, email: 'benjamin.valles@alpha.school', firstName: 'Benjamin', lastName: 'Valles', honors: false, house: 'House 3' },
      { id: 34, email: 'branson.pfiester@alpha.school', firstName: 'Branson', lastName: 'Pfiester', honors: false, house: 'House 3' },
      { id: 35, email: 'erika.rigby@alpha.school', firstName: 'Erika', lastName: 'Rigby', honors: false, house: 'House 3' },
      { id: 36, email: 'evan.klein@alpha.school', firstName: 'Evan', lastName: 'Klein', honors: false, house: 'House 3' },
      { id: 37, email: 'grady.swanson@alpha.school', firstName: 'Grady', lastName: 'Swanson', honors: false, house: 'House 3' },
      { id: 38, email: 'greyson.walker@alpha.school', firstName: 'Greyson', lastName: 'Walker', honors: false, house: 'House 3' },
      { id: 39, email: 'gus.castillo@alpha.school', firstName: 'Gus', lastName: 'Castillo', honors: false, house: 'House 3' },
      { id: 40, email: 'jacob.kuchinsky@alpha.school', firstName: 'Jacob', lastName: 'Kuchinsky', honors: false, house: 'House 3' },
      { id: 41, email: 'maxime.auvray@alpha.school', firstName: 'Maxime', lastName: 'Auvray', honors: false, house: 'House 3' },
      { id: 42, email: 'reece.knight@alpha.school', firstName: 'Reece', lastName: 'Knight', honors: false, house: 'House 3' },
      { id: 43, email: 'ross.margraves@alpha.school', firstName: 'Ross', lastName: 'Margraves', honors: false, house: 'House 3' },
      { id: 44, email: 'vera.li@alpha.school', firstName: 'Vera', lastName: 'Li', honors: false, house: 'House 3' },
      { id: 45, email: 'zayen.szpitalak@alpha.school', firstName: 'Zayen', lastName: 'Szpitalak', honors: false, house: 'House 3' }
    ];

    // Store each student
    for (const student of students) {
      const fullStudent = {
        ...student,
        fullName: `${student.firstName} ${student.lastName}`,
        password: 'Iloveschool',
        school: 'Alpha High School',
        status: 'active',
        points: 100,
        lastActivity: new Date().toISOString()
      };
      
      // Store in Redis (use proper hset syntax)
      await this.redis.hset('students', {[student.id]: JSON.stringify(fullStudent)});
      await this.redis.hset('students:email', {[student.email.toLowerCase()]: student.id});
    }
    
    console.log(`✓ Initialized ${students.length} students in Redis`);
  }

  // Cache management
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ============= STUDENT OPERATIONS =============

  async getAllStudents() {
    const cacheKey = 'students:all';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const studentsData = await this.redis.hgetall('students');
      const students = Object.values(studentsData).map(data => {
        const student = typeof data === 'string' ? JSON.parse(data) : data;
        return {
          ...student,
          id: parseInt(student.id),
          honors: Boolean(student.honors),
        };
      });
      
      // Sort by ID
      students.sort((a, b) => a.id - b.id);
      
      this.setCache(cacheKey, students);
      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  async getStudentById(studentId) {
    try {
      const data = await this.redis.hget('students', studentId);
      if (!data) return null;
      
      const student = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        ...student,
        id: parseInt(student.id),
        honors: Boolean(student.honors),
      };
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  }

  async getStudentByEmail(email) {
    try {
      const studentId = await this.redis.hget('students:email', email.toLowerCase());
      if (!studentId) return null;
      
      return this.getStudentById(studentId);
    } catch (error) {
      console.error('Error fetching student by email:', error);
      return null;
    }
  }

  async updateStudent(studentId, updates) {
    try {
      const student = await this.getStudentById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const updatedStudent = {
        ...student,
        ...updates,
        lastActivity: new Date().toISOString()
      };

      await this.redis.hset('students', {[studentId]: JSON.stringify(updatedStudent)});
      
      // Update email index if email changed
      if (updates.email && updates.email !== student.email) {
        await this.redis.hdel('students:email', student.email.toLowerCase());
        await this.redis.hset('students:email', {[updates.email.toLowerCase()]: studentId});
      }

      this.clearCache('students');
      return updatedStudent;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async addStudent(studentData) {
    try {
      const students = await this.getAllStudents();
      const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
      
      const newStudent = {
        id: nextId,
        ...studentData,
        fullName: `${studentData.firstName} ${studentData.lastName}`,
        password: studentData.password || 'Iloveschool',
        school: 'Alpha High School',
        status: 'active',
        points: 100,
        lastActivity: new Date().toISOString()
      };

      await this.redis.hset('students', {[nextId]: JSON.stringify(newStudent)});
      await this.redis.hset('students:email', {[studentData.email.toLowerCase()]: nextId});

      this.clearCache('students');
      return newStudent;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  }

  async deleteStudent(studentId) {
    try {
      const student = await this.getStudentById(studentId);
      if (!student) return false;

      await this.redis.hdel('students', studentId);
      await this.redis.hdel('students:email', student.email.toLowerCase());
      
      // Delete related data
      await this.redis.del(`profile:${studentId}`);
      await this.redis.del(`history:${studentId}`);
      await this.redis.del(`goals:${studentId}`);

      this.clearCache('students');
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      return false;
    }
  }

  // ============= PROFILE OPERATIONS =============

  async getProfile(studentId) {
    const cacheKey = `profile:${studentId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.redis.get(`profile:${studentId}`);
      
      if (!data) {
        // Return default profile
        return {
          studentId: parseInt(studentId),
          dailyGoal: '',
          sessionGoal: '',
          projectOneliner: '',
          brainliftCompleted: false,
          lastBrainliftDate: null,
          dailyGoalCompleted: false,
          lastDailyGoalDate: null,
          goals: { x: 0, youtube: 0, tiktok: 0, instagram: 0 },
          platforms: { x: '', youtube: '', tiktok: '', instagram: '' }
        };
      }

      const profile = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Ensure booleans are properly typed
      profile.brainliftCompleted = Boolean(profile.brainliftCompleted);
      profile.dailyGoalCompleted = Boolean(profile.dailyGoalCompleted);
      
      this.setCache(cacheKey, profile);
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(studentId, profileData) {
    try {
      const currentProfile = await this.getProfile(studentId);
      
      const updatedProfile = {
        ...currentProfile,
        ...profileData,
        studentId: parseInt(studentId),
        lastUpdated: new Date().toISOString()
      };

      await this.redis.set(`profile:${studentId}`, JSON.stringify(updatedProfile));
      
      this.clearCache(`profile:${studentId}`);
      
      // Also add to history if tracking goals
      if (profileData.dailyGoal || profileData.brainliftCompleted !== undefined || profileData.dailyGoalCompleted !== undefined) {
        await this.addGoalHistory(studentId, updatedProfile);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // ============= GOAL HISTORY OPERATIONS =============

  async addGoalHistory(studentId, data) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const historyKey = `history:${studentId}:${today}`;
      
      const historyEntry = {
        studentId: parseInt(studentId),
        date: today,
        dailyGoal: data.dailyGoal || '',
        dailyGoalCompleted: Boolean(data.dailyGoalCompleted),
        sessionGoal: data.sessionGoal || '',
        projectOneliner: data.projectOneliner || '',
        brainliftCompleted: Boolean(data.brainliftCompleted),
        audienceX: data.audienceX || data.goals?.x || 0,
        audienceYouTube: data.audienceYouTube || data.goals?.youtube || 0,
        audienceTikTok: data.audienceTikTok || data.goals?.tiktok || 0,
        audienceInstagram: data.audienceInstagram || data.goals?.instagram || 0,
        timestamp: new Date().toISOString()
      };

      await this.redis.set(historyKey, JSON.stringify(historyEntry), { ex: 2592000 }); // Expire after 30 days
      
      this.clearCache(`history:${studentId}`);
      return { success: true };
    } catch (error) {
      console.error('Error adding goal history:', error);
      throw error;
    }
  }

  async getGoalHistory(studentId, days = 30) {
    const cacheKey = `history:${studentId}:${days}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const history = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const historyKey = `history:${studentId}:${dateStr}`;
        const data = await this.redis.get(historyKey);
        
        if (data) {
          const entry = typeof data === 'string' ? JSON.parse(data) : data;
          history.push(entry);
        }
      }
      
      this.setCache(cacheKey, history);
      return history;
    } catch (error) {
      console.error('Error fetching goal history:', error);
      return [];
    }
  }

  // ============= GOAL CHECK OPERATIONS =============
  
  async getTodayGoals(studentId) {
    const today = new Date().toISOString().split('T')[0];
    const goalsKey = `goals:${studentId}:${today}`;
    
    try {
      const data = await this.redis.get(goalsKey);
      
      if (!data) {
        // Return default goals for today
        return {
          date: today,
          brainliftCompleted: false,
          dailyGoalCompleted: false,
          audienceGoals: {
            x: 0,
            youtube: 0,
            tiktok: 0,
            instagram: 0
          }
        };
      }
      
      const goals = typeof data === 'string' ? JSON.parse(data) : data;
      return goals;
    } catch (error) {
      console.error('Error fetching today goals:', error);
      return null;
    }
  }

  async updateTodayGoals(studentId, updates) {
    const today = new Date().toISOString().split('T')[0];
    const goalsKey = `goals:${studentId}:${today}`;
    
    try {
      const currentGoals = await this.getTodayGoals(studentId) || {};
      
      const updatedGoals = {
        ...currentGoals,
        ...updates,
        date: today,
        lastUpdated: new Date().toISOString()
      };
      
      // Set with expiration (keep for 7 days for recent history)
      await this.redis.set(goalsKey, JSON.stringify(updatedGoals), { ex: 604800 });
      
      return updatedGoals;
    } catch (error) {
      console.error('Error updating today goals:', error);
      throw error;
    }
  }

  // ============= SESSION OPERATIONS =============

  async resetAllSessionGoals() {
    try {
      const students = await this.getAllStudents();
      
      for (const student of students) {
        const profile = await this.getProfile(student.id);
        profile.sessionGoal = '';
        await this.updateProfile(student.id, profile);
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting session goals:', error);
      throw error;
    }
  }

  // ============= GROUP OPERATIONS =============

  async getAllGroups() {
    const cacheKey = 'groups:all';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const groups = [
        { id: 'house1', name: 'House 1', color: '#FF6B6B', description: 'Honors Students' },
        { id: 'house2', name: 'House 2', color: '#4ECDC4', description: 'Regular Track' },
        { id: 'house3', name: 'House 3', color: '#45B7D1', description: 'Foundation Level' }
      ];
      
      this.setCache(cacheKey, groups);
      return groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  // ============= CHECK CHART OPERATIONS (kept for compatibility) =============

  async getCheckChart(isHonors) {
    // Return empty chart structure for now
    return { stages: [] };
  }

  async saveCheckChart(isHonors, chartData) {
    return { success: true };
  }

  async getStudentCheckProgress(studentId) {
    return [];
  }

  async updateStudentCheckProgress(studentId, taskId, chartType, completed, adminEmail) {
    return { success: true };
  }

  async getCheckProgressForAllStudents(chartType) {
    return {};
  }

  // ============= UTILITY OPERATIONS =============

  async clearAllData() {
    try {
      await this.redis.flushdb();
      console.log('✓ All data cleared from Redis');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  async resetToDefaultData() {
    try {
      await this.clearAllData();
      await this.initializeDefaultStudents();
      console.log('✓ Database reset to default data');
      return true;
    } catch (error) {
      console.error('Error resetting data:', error);
      return false;
    }
  }
}

// Export singleton instance
const instance = new RedisDatabase();

// Wrap the instance to ensure it never throws on initialization
const safeInstance = {
  initialize: async () => {
    try {
      return await instance.initialize();
    } catch (error) {
      console.error('RedisDatabase initialization error:', error.message);
      return false;
    }
  },
  
  // Proxy all methods with error handling
  getAllStudents: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.getAllStudents(...args);
    } catch (error) {
      console.error('RedisDatabase.getAllStudents error:', error.message);
      return [];
    }
  },
  
  getStudentById: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.getStudentById(...args);
    } catch (error) {
      console.error('RedisDatabase.getStudentById error:', error.message);
      return null;
    }
  },
  
  getStudentByEmail: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.getStudentByEmail(...args);
    } catch (error) {
      console.error('RedisDatabase.getStudentByEmail error:', error.message);
      return null;
    }
  },
  
  getProfile: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.getProfile(...args);
    } catch (error) {
      console.error('RedisDatabase.getProfile error:', error.message);
      return null;
    }
  },
  
  updateStudent: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.updateStudent(...args);
    } catch (error) {
      console.error('RedisDatabase.updateStudent error:', error.message);
      return false;
    }
  },
  
  updateProfile: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.updateProfile(...args);
    } catch (error) {
      console.error('RedisDatabase.updateProfile error:', error.message);
      return false;
    }
  },
  
  addStudent: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.addStudent(...args);
    } catch (error) {
      console.error('RedisDatabase.addStudent error:', error.message);
      return null;
    }
  },
  
  deleteStudent: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.deleteStudent(...args);
    } catch (error) {
      console.error('RedisDatabase.deleteStudent error:', error.message);
      return false;
    }
  },
  
  addGoalHistory: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.addGoalHistory(...args);
    } catch (error) {
      console.error('RedisDatabase.addGoalHistory error:', error.message);
      return false;
    }
  },
  
  getGoalHistory: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.getGoalHistory(...args);
    } catch (error) {
      console.error('RedisDatabase.getGoalHistory error:', error.message);
      return [];
    }
  },
  
  getTodayGoals: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.getTodayGoals(...args);
    } catch (error) {
      console.error('RedisDatabase.getTodayGoals error:', error.message);
      return null;
    }
  },
  
  updateTodayGoals: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.updateTodayGoals(...args);
    } catch (error) {
      console.error('RedisDatabase.updateTodayGoals error:', error.message);
      return false;
    }
  },
  
  getAllGroups: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.getAllGroups(...args);
    } catch (error) {
      console.error('RedisDatabase.getAllGroups error:', error.message);
      return [];
    }
  },
  
  getCheckChart: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.getCheckChart(...args);
    } catch (error) {
      console.error('RedisDatabase.getCheckChart error:', error.message);
      return { stages: [] };
    }
  },
  
  resetAllSessionGoals: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.resetAllSessionGoals(...args);
    } catch (error) {
      console.error('RedisDatabase.resetAllSessionGoals error:', error.message);
      return false;
    }
  },
  
  clearAllData: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.clearAllData(...args);
    } catch (error) {
      console.error('RedisDatabase.clearAllData error:', error.message);
      return false;
    }
  },
  
  resetToDefaultData: async (...args) => {
    try {
      if (!instance.initialized) await instance.initialize();
      return await instance.resetToDefaultData(...args);
    } catch (error) {
      console.error('RedisDatabase.resetToDefaultData error:', error.message);
      return false;
    }
  },

  // Compatibility aliases
  getStudent: async (studentId) => safeInstance.getStudentById(studentId),
  getStudents: async () => safeInstance.getAllStudents(),
};

module.exports = safeInstance;
