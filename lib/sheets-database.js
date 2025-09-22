/**
 * Google Sheets as Primary Database
 * This module replaces local JSON storage with Google Sheets as the main data store
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class SheetsDatabase {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0';
    this.cache = new Map(); // In-memory cache to reduce API calls
    this.cacheTimeout = 30000; // 30 seconds cache to reduce quota usage
    this.initialized = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 100; // Minimum 100ms between requests
  }

  async initialize() {
    if (this.initialized) return true;
    
    try {
      let credentials;
      
      // First, try environment variable (for production)
      if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
        credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      } 
      // Then try local file (for development)
      else {
        const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
        if (fs.existsSync(credentialsPath)) {
          credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        }
      }

      if (!credentials) {
        console.error('Google Sheets credentials not found in environment or file');
        return false;
      }
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      
      // Initialize sheets structure if needed
      await this.ensureSheetsExist();
      
      console.log('Google Sheets Database initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets Database:', error);
      return false;
    }
  }

  async ensureSheetsExist() {
    const requiredSheets = [
      { name: 'Students', headers: ['ID', 'Email', 'Password', 'FirstName', 'LastName', 'FullName', 'Honors', 'GroupID', 'School', 'Status', 'Points', 'LastActivity'] },
      { name: 'Profiles', headers: ['StudentID', 'DailyGoal', 'SessionGoal', 'ProjectOneliner', 'BrainliftCompleted', 'LastBrainliftDate', 'DailyGoalCompleted', 'LastDailyGoalDate', 'GoalX', 'GoalYouTube', 'GoalTikTok', 'GoalInstagram', 'PlatformX', 'PlatformYouTube', 'PlatformTikTok', 'PlatformInstagram', 'LastUpdated'] },
      { name: 'GoalHistory', headers: ['ID', 'StudentID', 'Date', 'DailyGoal', 'DailyGoalCompleted', 'SessionGoal', 'ProjectOneliner', 'BrainliftCompleted', 'AudienceX', 'AudienceYouTube', 'AudienceTikTok', 'AudienceInstagram', 'Timestamp'] },
      { name: 'Groups', headers: ['ID', 'Name', 'Color', 'Description'] },
      { name: 'Sessions', headers: ['Key', 'Value', 'LastUpdated'] }, // For storing app state
      { name: 'CheckChart_Honors', headers: ['ID', 'StageID', 'StageName', 'TopicID', 'TopicName', 'TaskID', 'TaskName', 'Instructions', 'Points', 'Order', 'Active'] },
      { name: 'CheckChart_NonHonors', headers: ['ID', 'StageID', 'StageName', 'TopicID', 'TopicName', 'TaskID', 'TaskName', 'Instructions', 'Points', 'Order', 'Active'] },
      { name: 'StudentCheckProgress', headers: ['ID', 'StudentID', 'ChartType', 'TaskID', 'Completed', 'CompletedDate', 'CompletedBy', 'Points'] }
    ];

    for (const sheet of requiredSheets) {
      await this.createSheetIfNotExists(sheet.name, sheet.headers);
    }
  }

  async createSheetIfNotExists(sheetName, headers) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        fields: 'sheets.properties.title',
      });

      const existingSheets = response.data.sheets.map(s => s.properties.title);
      
      if (!existingSheets.includes(sheetName)) {
        // Create the sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: { title: sheetName }
              }
            }]
          }
        });

        // Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers]
          }
        });
      }
    } catch (error) {
      console.error(`Error creating sheet ${sheetName}:`, error.message);
    }
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
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
      await this.waitForRateLimit();
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Students!A:L',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return []; // No data beyond headers

      const headers = rows[0];
      const students = rows.slice(1).map(row => ({
        id: parseInt(row[0]),
        email: row[1],
        password: row[2],
        firstName: row[3],
        lastName: row[4],
        fullName: row[5],
        honors: row[6] === 'true',
        groupId: row[7] || null,
        school: row[8] || 'Alpha High School',
        status: row[9] || 'Active',
        points: parseInt(row[10]) || 0,
        lastActivity: row[11] || null
      }));

      this.setCache(cacheKey, students);
      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  async getStudentById(studentId) {
    const students = await this.getAllStudents();
    return students.find(s => s.id === parseInt(studentId)) || null;
  }

  async getStudentByEmail(email) {
    const students = await this.getAllStudents();
    return students.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async addStudent(studentData) {
    try {
      // Get next ID
      const students = await this.getAllStudents();
      const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
      
      const newStudent = {
        id: nextId,
        ...studentData,
        lastActivity: new Date().toISOString()
      };

      const row = [
        newStudent.id,
        newStudent.email,
        newStudent.password || 'Iloveschool',
        newStudent.firstName,
        newStudent.lastName,
        newStudent.fullName || `${newStudent.firstName} ${newStudent.lastName}`,
        String(newStudent.honors || false), // Convert boolean to string for Sheets
        newStudent.groupId || '',
        newStudent.school || 'Alpha High School',
        newStudent.status || 'Active',
        newStudent.points || 0,
        newStudent.lastActivity
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Students!A:L',
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });

      this.clearCache('students');
      return newStudent;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  }

  async updateStudent(studentId, updates) {
    try {
      const students = await this.getAllStudents();
      const studentIndex = students.findIndex(s => s.id === parseInt(studentId));
      
      if (studentIndex === -1) {
        throw new Error('Student not found');
      }

      const updatedStudent = { ...students[studentIndex], ...updates };
      const row = [
        updatedStudent.id,
        updatedStudent.email,
        updatedStudent.password,
        updatedStudent.firstName,
        updatedStudent.lastName,
        updatedStudent.fullName,
        String(updatedStudent.honors), // Convert boolean to string for Sheets
        updatedStudent.groupId || '',
        updatedStudent.school,
        updatedStudent.status,
        updatedStudent.points,
        new Date().toISOString()
      ];

      const rowNumber = studentIndex + 2; // +2 for header and 0-index
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Students!A${rowNumber}:L${rowNumber}`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });

      this.clearCache('students');
      return updatedStudent;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async deleteStudent(studentId) {
    // Note: Deleting rows in Sheets is complex, so we'll mark as deleted
    return this.updateStudent(studentId, { status: 'Deleted' });
  }

  // ============= PROFILE OPERATIONS =============

  async getProfile(studentId) {
    const cacheKey = `profile:${studentId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Profiles!A:Q',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return null;

      const profileRow = rows.find(row => row[0] === String(studentId));
      if (!profileRow) {
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

      const profile = {
        studentId: parseInt(profileRow[0]),
        dailyGoal: profileRow[1] || '',
        sessionGoal: profileRow[2] || '',
        projectOneliner: profileRow[3] || '',
        brainliftCompleted: profileRow[4] === 'true',
        lastBrainliftDate: profileRow[5] || null,
        dailyGoalCompleted: profileRow[6] === 'true',
        lastDailyGoalDate: profileRow[7] || null,
        goals: {
          x: parseInt(profileRow[8]) || 0,
          youtube: parseInt(profileRow[9]) || 0,
          tiktok: parseInt(profileRow[10]) || 0,
          instagram: parseInt(profileRow[11]) || 0
        },
        platforms: {
          x: profileRow[12] || '',
          youtube: profileRow[13] || '',
          tiktok: profileRow[14] || '',
          instagram: profileRow[15] || ''
        },
        lastUpdated: profileRow[16] || null
      };

      this.setCache(cacheKey, profile);
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(studentId, profileData) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Profiles!A:Q',
      });

      const rows = response.data.values || [];
      let rowIndex = rows.findIndex(row => row[0] === String(studentId));
      
      const row = [
        studentId,
        profileData.dailyGoal || '',
        profileData.sessionGoal || '',
        profileData.projectOneliner || '',
        profileData.brainliftCompleted || false,
        profileData.lastBrainliftDate || '',
        profileData.dailyGoalCompleted || false,
        profileData.lastDailyGoalDate || '',
        profileData.goals?.x || 0,
        profileData.goals?.youtube || 0,
        profileData.goals?.tiktok || 0,
        profileData.goals?.instagram || 0,
        profileData.platforms?.x || '',
        profileData.platforms?.youtube || '',
        profileData.platforms?.tiktok || '',
        profileData.platforms?.instagram || '',
        new Date().toISOString()
      ];

      if (rowIndex === -1) {
        // Add new profile
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'Profiles!A:Q',
          valueInputOption: 'RAW',
          requestBody: { values: [row] }
        });
      } else {
        // Update existing profile
        const rowNumber = rowIndex + 1;
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Profiles!A${rowNumber}:Q${rowNumber}`,
          valueInputOption: 'RAW',
          requestBody: { values: [row] }
        });
      }

      this.clearCache(`profile:${studentId}`);
      
      // Also save to history if goals are being tracked
      if (profileData.dailyGoal || profileData.brainliftCompleted || profileData.dailyGoalCompleted) {
        await this.addGoalHistory(studentId, profileData);
      }
      
      return profileData;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // ============= GOAL HISTORY OPERATIONS =============

  async addGoalHistory(studentId, data) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get next ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'GoalHistory!A:A',
      });
      
      const ids = (response.data.values || []).slice(1).map(row => parseInt(row[0])).filter(id => !isNaN(id));
      const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
      
      const row = [
        nextId,
        studentId,
        today,
        data.dailyGoal || '',
        data.dailyGoalCompleted || false,
        data.sessionGoal || '',
        data.projectOneliner || '',
        data.brainliftCompleted || false,
        data.audienceX || data.goals?.x || 0,
        data.audienceYouTube || data.goals?.youtube || 0,
        data.audienceTikTok || data.goals?.tiktok || 0,
        data.audienceInstagram || data.goals?.instagram || 0,
        new Date().toISOString()
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'GoalHistory!A:M',
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });

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
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'GoalHistory!A:M',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const history = rows.slice(1)
        .filter(row => row[1] === String(studentId))
        .map(row => ({
          id: parseInt(row[0]),
          studentId: parseInt(row[1]),
          date: row[2],
          dailyGoal: row[3],
          dailyGoalCompleted: row[4] === 'true',
          sessionGoal: row[5],
          projectOneliner: row[6],
          brainliftCompleted: row[7] === 'true',
          audienceGoals: {
            x: parseInt(row[8]) || 0,
            youtube: parseInt(row[9]) || 0,
            tiktok: parseInt(row[10]) || 0,
            instagram: parseInt(row[11]) || 0
          },
          timestamp: row[12]
        }))
        .filter(entry => new Date(entry.date) >= cutoffDate)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      this.setCache(cacheKey, history);
      return history;
    } catch (error) {
      console.error('Error fetching goal history:', error);
      return [];
    }
  }

  // ============= GROUP OPERATIONS =============

  async getAllGroups() {
    const cacheKey = 'groups:all';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Groups!A:D',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) {
        // Return default groups if none exist
        const defaultGroups = [
          { id: 'house1', name: 'House 1', color: '#FF6B6B', description: 'The Red House' },
          { id: 'house2', name: 'House 2', color: '#4ECDC4', description: 'The Teal House' }
        ];
        
        // Save default groups
        for (const group of defaultGroups) {
          await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: 'Groups!A:D',
            valueInputOption: 'RAW',
            requestBody: {
              values: [[group.id, group.name, group.color, group.description]]
            }
          });
        }
        
        return defaultGroups;
      }

      const groups = rows.slice(1).map(row => ({
        id: row[0],
        name: row[1],
        color: row[2],
        description: row[3]
      }));

      this.setCache(cacheKey, groups);
      return groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  // ============= SESSION OPERATIONS =============

  async getSessionData(key) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sessions!A:C',
      });

      const rows = response.data.values || [];
      const session = rows.find(row => row[0] === key);
      
      return session ? JSON.parse(session[1]) : null;
    } catch (error) {
      console.error('Error fetching session data:', error);
      return null;
    }
  }

  async setSessionData(key, value) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sessions!A:C',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === key);
      const row = [key, JSON.stringify(value), new Date().toISOString()];

      if (rowIndex === -1) {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'Sessions!A:C',
          valueInputOption: 'RAW',
          requestBody: { values: [row] }
        });
      } else {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Sessions!A${rowIndex + 1}:C${rowIndex + 1}`,
          valueInputOption: 'RAW',
          requestBody: { values: [row] }
        });
      }

      return true;
    } catch (error) {
      console.error('Error setting session data:', error);
      return false;
    }
  }

  // ============= BATCH OPERATIONS =============

  async resetAllSessionGoals() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Profiles!A:O',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return true;

      const updates = [];
      for (let i = 1; i < rows.length; i++) {
        const row = [...rows[i]];
        row[2] = ''; // Clear session goal
        updates.push({
          range: `Profiles!A${i + 1}:O${i + 1}`,
          values: [row]
        });
      }

      if (updates.length > 0) {
        await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: updates
          }
        });
      }

      this.clearCache('profile');
      return true;
    } catch (error) {
      console.error('Error resetting session goals:', error);
      throw error;
    }
  }

  // Group/House Management Methods
  async getAllGroups() {
    const cacheKey = 'groups:all';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Groups!A:D',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) {
        // If only header or no data, return empty array
        return []; 
      }

      const groups = rows.slice(1).map(row => ({
        id: row[0],
        name: row[1],
        color: row[2] || '#000000',
        description: row[3] || ''
      }));

      this.cache.set(cacheKey, { data: groups, timestamp: Date.now() });
      return groups;
    } catch (error) {
      console.error('Error fetching groups from Sheets:', error);
      throw error;
    }
  }

  async addGroup(name, id, color, description) {
    try {
      const row = [id, name, color || '#000000', description || ''];
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Groups!A:D',
        valueInputOption: 'RAW',
        requestBody: {
          values: [row]
        }
      });

      this.clearCache('groups');
      return { id, name, color, description };
    } catch (error) {
      console.error('Error adding group:', error);
      throw error;
    }
  }

  async updateGroup(id, name, color, description) {
    try {
      const groups = await this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === id);
      
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      const updatedGroup = {
        id,
        name: name || groups[groupIndex].name,
        color: color || groups[groupIndex].color,
        description: description !== undefined ? description : groups[groupIndex].description
      };

      const row = [
        updatedGroup.id,
        updatedGroup.name,
        updatedGroup.color,
        updatedGroup.description
      ];

      const rowNumber = groupIndex + 2; // +2 for header and 0-index
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Groups!A${rowNumber}:D${rowNumber}`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });

      this.clearCache('groups');
      return updatedGroup;
    } catch (error) {
      console.error(`Error updating group ${id}:`, error);
      throw error;
    }
  }

  async deleteGroup(id) {
    try {
      const groups = await this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === id);
      
      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      // Clear the row (we can't delete rows easily, so we'll clear it)
      const rowNumber = groupIndex + 2;
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: `Groups!A${rowNumber}:D${rowNumber}`
      });

      // Optionally, we could reorganize the sheet to remove empty rows
      // For now, we'll just clear it
      
      this.clearCache('groups');
      return true;
    } catch (error) {
      console.error(`Error deleting group ${id}:`, error);
      throw error;
    }
  }

  // ============= CHECK CHART OPERATIONS =============

  async getCheckChart(isHonors) {
    const sheetName = isHonors ? 'CheckChart_Honors' : 'CheckChart_NonHonors';
    const cacheKey = `checkchart:${sheetName}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      await this.waitForRateLimit();
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:K`,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return { stages: [] };

      const tasks = rows.slice(1).map(row => ({
        id: row[0],
        stageId: row[1],
        stageName: row[2],
        topicId: row[3],
        topicName: row[4],
        taskId: row[5],
        taskName: row[6],
        instructions: row[7],
        points: parseInt(row[8]) || 0,
        order: parseInt(row[9]) || 0,
        active: row[10] !== 'false'
      })).filter(task => task.active);

      // Organize into hierarchical structure
      const stages = {};
      tasks.forEach(task => {
        if (!stages[task.stageId]) {
          stages[task.stageId] = {
            id: task.stageId,
            name: task.stageName,
            order: task.order,
            topics: {}
          };
        }
        if (!stages[task.stageId].topics[task.topicId]) {
          stages[task.stageId].topics[task.topicId] = {
            id: task.topicId,
            name: task.topicName,
            tasks: []
          };
        }
        stages[task.stageId].topics[task.topicId].tasks.push({
          id: task.taskId,
          name: task.taskName,
          instructions: task.instructions,
          points: task.points,
          order: task.order
        });
      });

      // Convert to array and sort
      const chartData = {
        stages: Object.values(stages)
          .map(stage => ({
            ...stage,
            topics: Object.values(stage.topics).map(topic => ({
              ...topic,
              tasks: topic.tasks.sort((a, b) => a.order - b.order)
            }))
          }))
          .sort((a, b) => a.order - b.order)
      };

      this.setCache(cacheKey, chartData);
      return chartData;
    } catch (error) {
      console.error('Error fetching check chart:', error);
      return { stages: [] };
    }
  }

  async saveCheckChart(isHonors, chartData) {
    const sheetName = isHonors ? 'CheckChart_Honors' : 'CheckChart_NonHonors';
    
    try {
      // Clear existing data (except headers)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:K`
      });

      // Flatten the hierarchical structure into rows
      const rows = [];
      let rowId = 1;
      let order = 0;

      chartData.stages.forEach(stage => {
        stage.topics.forEach(topic => {
          topic.tasks.forEach(task => {
            rows.push([
              rowId++,
              stage.id,
              stage.name,
              topic.id,
              topic.name,
              task.id,
              task.name,
              task.instructions || '',
              task.points || 0,
              order++,
              'true' // active
            ]);
          });
        });
      });

      if (rows.length > 0) {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A:K`,
          valueInputOption: 'RAW',
          requestBody: { values: rows }
        });
      }

      this.clearCache(`checkchart:${sheetName}`);
      return { success: true };
    } catch (error) {
      console.error('Error saving check chart:', error);
      throw error;
    }
  }

  async getStudentCheckProgress(studentId) {
    const cacheKey = `checkprogress:${studentId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      await this.waitForRateLimit();
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'StudentCheckProgress!A:H',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return [];

      const progress = rows.slice(1)
        .filter(row => row[1] === String(studentId))
        .map(row => ({
          id: row[0],
          studentId: parseInt(row[1]),
          chartType: row[2],
          taskId: row[3],
          completed: row[4] === 'true',
          completedDate: row[5],
          completedBy: row[6],
          points: parseInt(row[7]) || 0
        }));

      this.setCache(cacheKey, progress);
      return progress;
    } catch (error) {
      console.error('Error fetching student check progress:', error);
      return [];
    }
  }

  async updateStudentCheckProgress(studentId, taskId, chartType, completed, adminEmail) {
    try {
      // Get existing progress
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'StudentCheckProgress!A:H',
      });

      const rows = response.data.values || [];
      const existingIndex = rows.findIndex(row => 
        row[1] === String(studentId) && 
        row[3] === String(taskId) && 
        row[2] === chartType
      );

      if (completed && existingIndex === -1) {
        // Add new progress entry
        const nextId = rows.length > 1 ? Math.max(...rows.slice(1).map(r => parseInt(r[0]) || 0)) + 1 : 1;
        const newRow = [
          nextId,
          studentId,
          chartType,
          taskId,
          'true',
          new Date().toISOString(),
          adminEmail || 'admin',
          0 // Points will be calculated based on task
        ];

        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'StudentCheckProgress!A:H',
          valueInputOption: 'RAW',
          requestBody: { values: [newRow] }
        });
      } else if (!completed && existingIndex > -1) {
        // Clear the row (mark as not completed)
        const rowNumber = existingIndex + 1;
        await this.sheets.spreadsheets.values.clear({
          spreadsheetId: this.spreadsheetId,
          range: `StudentCheckProgress!A${rowNumber}:H${rowNumber}`
        });
      }

      this.clearCache(`checkprogress:${studentId}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating student check progress:', error);
      throw error;
    }
  }

  async getCheckProgressForAllStudents(chartType) {
    const cacheKey = `checkprogress:all:${chartType}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      await this.waitForRateLimit();
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'StudentCheckProgress!A:H',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return {};

      const progressByStudent = {};
      rows.slice(1)
        .filter(row => row[2] === chartType)
        .forEach(row => {
          const studentId = row[1];
          if (!progressByStudent[studentId]) {
            progressByStudent[studentId] = [];
          }
          progressByStudent[studentId].push({
            taskId: row[3],
            completed: row[4] === 'true',
            completedDate: row[5],
            completedBy: row[6],
            points: parseInt(row[7]) || 0
          });
        });

      this.setCache(cacheKey, progressByStudent);
      return progressByStudent;
    } catch (error) {
      console.error('Error fetching all student check progress:', error);
      return {};
    }
  }
}

// Export singleton instance
module.exports = new SheetsDatabase();
