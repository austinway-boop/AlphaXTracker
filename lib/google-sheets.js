const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
    this.spreadsheetId = '1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Try to load credentials from environment or file
      let credentials;
      
      // First, try environment variable
      if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
        credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      } 
      // Then try local file
      else {
        const credPath = path.join(process.cwd(), 'google-credentials.json');
        if (fs.existsSync(credPath)) {
          credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        }
      }

      if (!credentials) {
        console.warn('Google Sheets credentials not found. Sheets integration disabled.');
        return false;
      }

      // Create auth client
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      // Initialize sheets API
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
      
      // Initialize spreadsheet structure if needed
      await this.initializeSpreadsheet();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      return false;
    }
  }

  async initializeSpreadsheet() {
    try {
      // Check if sheets exist, if not create them
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      const existingSheets = response.data.sheets.map(s => s.properties.title);
      const requiredSheets = ['Students', 'Goals', 'History', 'Houses', 'DailyTracking', 'Settings', 'SocialMediaActivity'];

      for (const sheetName of requiredSheets) {
        if (!existingSheets.includes(sheetName)) {
          await this.createSheet(sheetName);
        }
      }

      // Initialize headers for each sheet
      await this.initializeHeaders();
    } catch (error) {
      console.error('Failed to initialize spreadsheet structure:', error);
    }
  }

  async createSheet(title) {
    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title }
            }
          }]
        }
      });
    } catch (error) {
      console.error(`Failed to create sheet ${title}:`, error);
    }
  }

  async initializeHeaders() {
    // Students sheet headers
    await this.updateRange('Students!A1:M1', [[
      'ID', 'First Name', 'Last Name', 'Email', 'House', 'Honors',
      'Daily Goal', 'Session Goal', 'Project Oneliner', 
      'Instagram Goal', 'TikTok Goal', 'YouTube Goal', 'Twitter Goal'
    ]]);

    // Goals sheet headers  
    await this.updateRange('Goals!A1:H1', [[
      'Date', 'Student ID', 'Student Name', 'Goal Type', 'Goal Text', 
      'Completed', 'Completion Time', 'Points'
    ]]);

    // History sheet headers
    await this.updateRange('History!A1:J1', [[
      'Date', 'Student ID', 'Student Name', 'Daily Goal', 'Daily Completed',
      'Session Goal', 'Brainlift Completed', 'Audience Goals Met',
      'Total Points', 'Notes'
    ]]);

    // Houses sheet headers
    await this.updateRange('Houses!A1:F1', [[
      'House ID', 'House Name', 'Total Students', 'Daily Points',
      'Weekly Points', 'Monthly Points'
    ]]);

    // DailyTracking sheet headers
    await this.updateRange('DailyTracking!A1:G1', [[
      'Date', 'Student ID', 'Student Name', 'House', 
      'Goal Set', 'Goal Completed', 'Points'
    ]]);

    // Settings sheet headers
    await this.updateRange('Settings!A1:C1', [[
      'Key', 'Value', 'Updated At'
    ]]);

    // SocialMediaActivity sheet headers
    await this.updateRange('SocialMediaActivity!A1:I1', [[
      'Date', 'Student ID', 'Student Name', 'House',
      'Twitter Posts', 'YouTube Videos', 'TikTok Videos', 'Instagram Posts', 'Total Activity'
    ]]);
  }

  async updateRange(range, values) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return null;
    }

    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update range ${range}:`, error);
      return null;
    }
  }

  async appendRows(sheetName, rows) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return null;
    }

    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: rows }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to append to ${sheetName}:`, error);
      return null;
    }
  }

  async getRange(range) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return null;
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range
      });
      return response.data.values || [];
    } catch (error) {
      console.error(`Failed to get range ${range}:`, error);
      return [];
    }
  }

  async clearSheet(sheetName) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return null;
    }

    try {
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:Z`
      });
      return true;
    } catch (error) {
      console.error(`Failed to clear ${sheetName}:`, error);
      return false;
    }
  }

  // Sync students data to Google Sheets
  async syncStudents(students) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return;
    }

    try {
      // Clear existing data (except headers)
      await this.clearSheet('Students');

      // Prepare student data rows
      const rows = students.map(student => [
        student.id,
        student.firstName,
        student.lastName,
        student.email || `${student.firstName}.${student.lastName}@alpha.school`.toLowerCase(),
        student.groupId || '',
        student.honors ? 'Yes' : 'No',
        '', // Daily Goal - will be filled from profile
        '', // Session Goal - will be filled from profile
        '', // Project Oneliner - will be filled from profile
        '', // Instagram Goal
        '', // TikTok Goal
        '', // YouTube Goal
        '', // Twitter Goal
      ]);

      // Update Google Sheets
      if (rows.length > 0) {
        await this.appendRows('Students', rows);
      }

      console.log(`Synced ${students.length} students to Google Sheets`);
    } catch (error) {
      console.error('Failed to sync students:', error);
    }
  }

  // Sync profile data to Google Sheets
  async syncProfile(studentId, profile) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return;
    }

    try {
      // Get current students data
      const studentsData = await this.getRange('Students!A:M');
      
      // Find the row for this student
      let rowIndex = -1;
      for (let i = 1; i < studentsData.length; i++) {
        if (studentsData[i][0] === String(studentId)) {
          rowIndex = i + 1; // +1 because sheets are 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        console.log(`Student ${studentId} not found in sheets, skipping profile sync`);
        return;
      }

      // Update the profile data
      const updates = [
        [`Students!G${rowIndex}`, [[profile.dailyGoal || '']]],
        [`Students!H${rowIndex}`, [[profile.sessionGoal || '']]],
        [`Students!I${rowIndex}`, [[profile.projectOneliner || '']]],
        [`Students!J${rowIndex}`, [[profile.goals?.instagram || 0]]],
        [`Students!K${rowIndex}`, [[profile.goals?.tiktok || 0]]],
        [`Students!L${rowIndex}`, [[profile.goals?.youtube || 0]]],
        [`Students!M${rowIndex}`, [[profile.goals?.twitter || 0]]]
      ];

      // Batch update
      for (const [range, values] of updates) {
        await this.updateRange(range, values);
      }

      console.log(`Synced profile for student ${studentId} to Google Sheets`);
    } catch (error) {
      console.error('Failed to sync profile:', error);
    }
  }

  // Log goal completion to Google Sheets
  async logGoalCompletion(studentId, studentName, goalType, goalText, completed, date = new Date()) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return;
    }

    try {
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toISOString();
      const points = completed ? 10 : -10;

      const row = [
        dateStr,
        studentId,
        studentName,
        goalType,
        goalText || '',
        completed ? 'Yes' : 'No',
        completed ? timeStr : '',
        points
      ];

      await this.appendRows('Goals', [row]);
      console.log(`Logged goal completion for student ${studentId}`);
    } catch (error) {
      console.error('Failed to log goal completion:', error);
    }
  }

  // Sync daily history to Google Sheets
  async syncDailyHistory(history) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return;
    }

    try {
      const rows = history.map(entry => [
        entry.date,
        entry.studentId,
        entry.studentName || '',
        entry.dailyGoal || '',
        entry.dailyGoalCompleted ? 'Yes' : 'No',
        entry.sessionGoal || '',
        entry.brainliftCompleted ? 'Yes' : 'No',
        entry.audienceGoals ? JSON.stringify(entry.audienceGoals) : '',
        entry.points || 0,
        entry.notes || ''
      ]);

      if (rows.length > 0) {
        await this.appendRows('History', rows);
      }

      console.log(`Synced ${history.length} history entries to Google Sheets`);
    } catch (error) {
      console.error('Failed to sync history:', error);
    }
  }

  // Update house points in Google Sheets
  async updateHousePoints(houseData) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return;
    }

    try {
      // Clear existing house data
      await this.clearSheet('Houses');

      // Prepare house data rows
      const rows = Object.entries(houseData).map(([houseId, house]) => [
        houseId,
        house.name,
        house.totalStudents || 0,
        house.dailyPoints || 0,
        house.weeklyPoints || 0,
        house.monthlyPoints || 0
      ]);

      if (rows.length > 0) {
        await this.appendRows('Houses', rows);
      }

      console.log(`Updated house points for ${rows.length} houses`);
    } catch (error) {
      console.error('Failed to update house points:', error);
    }
  }

  // Log daily tracking entry
  async logDailyTracking(studentId, studentName, house, goalSet, goalCompleted, date = new Date()) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return;
    }

    try {
      const dateStr = date.toISOString().split('T')[0];
      let points = 0;
      
      if (!goalSet) {
        points = -10; // No goal set
      } else if (goalCompleted) {
        points = 10; // Goal completed
      } else {
        points = -10; // Goal set but not completed
      }

      const row = [
        dateStr,
        studentId,
        studentName,
        house || 'No House',
        goalSet ? 'Yes' : 'No',
        goalCompleted ? 'Yes' : 'No',
        points
      ];

      await this.appendRows('DailyTracking', [row]);
      console.log(`Logged daily tracking for student ${studentId}`);
    } catch (error) {
      console.error('Failed to log daily tracking:', error);
    }
  }

  // Get all data from a sheet
  async getAllFromSheet(sheetName) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return [];
    }

    try {
      const data = await this.getRange(`${sheetName}!A:Z`);
      if (data.length <= 1) return []; // Only headers or empty

      const headers = data[0];
      const rows = data.slice(1);

      // Convert to objects
      return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      console.error(`Failed to get all from ${sheetName}:`, error);
      return [];
    }
  }

  // Settings management methods
  async getSettings() {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return {};
    }

    try {
      const data = await this.getRange('Settings!A:C');
      if (data.length <= 1) return {}; // Only headers or empty

      const settings = {};
      for (let i = 1; i < data.length; i++) {
        const [key, value] = data[i];
        if (key) {
          // Parse JSON values or keep as string
          try {
            settings[key] = JSON.parse(value);
          } catch {
            settings[key] = value;
          }
        }
      }
      return settings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  }

  async updateSettings(newSettings) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return false;
    }

    try {
      // Get existing settings
      const currentSettings = await this.getSettings();
      
      // Merge with new settings
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      // Clear existing data
      await this.clearSheet('Settings');
      
      // Prepare rows for update
      const rows = Object.entries(updatedSettings).map(([key, value]) => [
        key,
        typeof value === 'object' ? JSON.stringify(value) : String(value),
        new Date().toISOString()
      ]);

      if (rows.length > 0) {
        await this.appendRows('Settings', rows);
      }

      console.log('Settings updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  }

  // Log social media activity
  async logSocialMediaActivity(studentId, studentName, date, results) {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return false;
    }

    try {
      // Get student's house
      const students = await this.getRange('Students!A:E');
      let house = 'No House';
      for (let i = 1; i < students.length; i++) {
        if (students[i][0] === String(studentId)) {
          house = students[i][4] || 'No House';
          break;
        }
      }

      const totalActivity = (results.x || 0) + (results.youtube || 0) + (results.tiktok || 0) + (results.instagram || 0);

      const row = [
        date,
        studentId,
        studentName,
        house,
        results.x || 0,
        results.youtube || 0,
        results.tiktok || 0,
        results.instagram || 0,
        totalActivity
      ];

      await this.appendRows('SocialMediaActivity', [row]);
      console.log(`Logged social media activity for student ${studentId}`);
      return true;
    } catch (error) {
      console.error('Failed to log social media activity:', error);
      return false;
    }
  }

  // Get all students for checking
  async getAllStudents() {
    if (!this.initialized) {
      await this.initialize();
      if (!this.initialized) return [];
    }

    try {
      const data = await this.getRange('Students!A:C');
      if (data.length <= 1) return [];

      return data.slice(1).map(row => ({
        id: row[0],
        firstName: row[1] || '',
        lastName: row[2] || ''
      })).filter(student => student.id);
    } catch (error) {
      console.error('Failed to get students:', error);
      return [];
    }
  }

  // Get student profile for social media handles
  async getStudentProfile(studentId) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const profilePath = path.join(process.cwd(), 'data', 'profiles', `${studentId}.json`);
      if (fs.existsSync(profilePath)) {
        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        return profile;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get profile for student ${studentId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
module.exports = new GoogleSheetsService();
