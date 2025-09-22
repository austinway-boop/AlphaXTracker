import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
const googleSheets = require('../../../lib/google-sheets');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req, res) {
  // Check authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Only allow admin users
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (req.method === 'POST') {
    try {
      // Initialize Google Sheets service
      const initialized = await googleSheets.initialize();
      
      if (!initialized) {
        return res.status(503).json({
          success: false,
          message: 'Google Sheets service not configured. Please set up credentials.'
        });
      }

      const results = {
        students: false,
        profiles: false,
        history: false,
        houses: false
      };

      // 1. Sync all students
      const STUDENTS_FILE = path.join(process.cwd(), 'data', 'students.json');
      const PROFILES_DIR = path.join(process.cwd(), 'data', 'profiles');
      
      // Get all students
      let students = [];
      if (fs.existsSync(STUDENTS_FILE)) {
        students = JSON.parse(fs.readFileSync(STUDENTS_FILE, 'utf8'));
      }

      // Parse student data from Names.md
      const honorsStudents = new Set([
        'Alex', 'Austin', 'Caleb', 'Cruce', 'Ella', 'Elle', 'Emma', 
        'Geetesh', 'Jackson', 'Kavin', 'Lincoln', 'Maddie', 'Michael', 
        'Reuben', 'Sara Beth', 'Sloane', 'Sloka', 'Stella'
      ]);

      const allStudents = [
        ['Alex', 'Mathew'], ['Elle', 'Liemandt'], ['Emily', 'Smith'], ['Lucia', 'Scaletta'],
        ['Maddie', 'Price'], ['Reuben', 'Runacres'], ['Sloane', 'Price'], ['Tatum', 'Lemkau'],
        ['Austin', 'Way'], ['Caleb', 'Walker'], ['Cruce', 'Saunders'], ['Ella', 'Gremont'],
        ['Emma', 'Watt'], ['Geetesh', 'Sunkara'], ['Jackson', 'Brace'], ['Kavin', 'Balaraman'],
        ['Lincoln', 'Swearingen'], ['Michael', 'Kwan'], ['Sara Beth', 'Hurst'], ['Sloka', 'Dasari'],
        ['Stella', 'Zeng'], ['Aditya', 'Gupta'], ['Arjun', 'Sripathy'], ['Beatrix', 'Brace'],
        ['Ben', 'Nierenberg'], ['Colby', 'Seyferth'], ['Josiah', 'Trejo'], ['Kaitlyn', 'Moredock'],
        ['Kiran', 'Sridhar'], ['Linus', 'Tornqvist'], ['Olivia', 'Brace'], ['Santana', 'Sanchez'],
        ['Theo', 'Crumley'], ['Aidan', 'Cobb'], ['Connor', 'Krug'], ['Deacon', 'Cobb'],
        ['Evan', 'Gremont'], ['Gus', 'Seyferth'], ['Hollis', 'Mathew'], ['Kaia', 'Cobb'],
        ['Lily', 'Cobb'], ['Nikki', 'Krug'], ['Samantha', 'Chafin'], ['Will', 'Krug'],
        ['Zack', 'Krug']
      ];

      let studentId = 1;
      const baseStudents = allStudents.map(([firstName, lastName]) => ({
        id: studentId++,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: `${firstName}.${lastName}@alpha.school`.toLowerCase(),
        honors: honorsStudents.has(firstName),
        groupId: null
      }));

      // Merge with dynamic students
      const mergedStudents = [...baseStudents];
      students.forEach(student => {
        const exists = mergedStudents.some(s => 
          s.firstName === student.firstName && s.lastName === student.lastName
        );
        if (!exists) {
          mergedStudents.push(student);
        }
      });

      // Sync students to sheets
      await googleSheets.syncStudents(mergedStudents);
      results.students = true;

      // 2. Sync all profiles
      if (fs.existsSync(PROFILES_DIR)) {
        const profileFiles = fs.readdirSync(PROFILES_DIR);
        for (const file of profileFiles) {
          if (file.endsWith('.json')) {
            const studentId = file.replace('.json', '');
            const profilePath = path.join(PROFILES_DIR, file);
            const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
            await googleSheets.syncProfile(studentId, profile);
          }
        }
        results.profiles = true;
      }

      // 3. Sync goal history
      const HISTORY_DIR = path.join(process.cwd(), 'data', 'goal-history');
      if (fs.existsSync(HISTORY_DIR)) {
        const historyFiles = fs.readdirSync(HISTORY_DIR);
        for (const file of historyFiles) {
          if (file.endsWith('.json')) {
            const historyPath = path.join(HISTORY_DIR, file);
            const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
            const studentId = file.replace('student_', '').replace('.json', '');
            
            // Find student name
            const student = mergedStudents.find(s => String(s.id) === studentId);
            const studentName = student ? `${student.firstName} ${student.lastName}` : `Student ${studentId}`;
            
            // Add student info to history entries
            const enrichedHistory = history.map(entry => ({
              ...entry,
              studentId,
              studentName
            }));
            
            await googleSheets.syncDailyHistory(enrichedHistory);
          }
        }
        results.history = true;
      }

      // 4. Sync house/group data
      const GROUPS_FILE = path.join(process.cwd(), 'data', 'groups.json');
      if (fs.existsSync(GROUPS_FILE)) {
        const groups = JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf8'));
        
        // Calculate house points
        const houseData = {};
        for (const group of groups) {
          const houseStudents = mergedStudents.filter(s => s.groupId === group.id);
          houseData[group.id] = {
            name: group.name,
            totalStudents: houseStudents.length,
            dailyPoints: 0,
            weeklyPoints: 0,
            monthlyPoints: 0
          };
        }
        
        await googleSheets.updateHousePoints(houseData);
        results.houses = true;
      }

      return res.status(200).json({
        success: true,
        message: 'Data synced to Google Sheets successfully',
        results
      });

    } catch (error) {
      console.error('Sync error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to sync data to Google Sheets',
        error: error.message
      });
    }
  }

  if (req.method === 'GET') {
    try {
      // Check if Google Sheets is configured
      const initialized = await googleSheets.initialize();
      
      return res.status(200).json({
        success: true,
        configured: initialized,
        spreadsheetId: googleSheets.spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${googleSheets.spreadsheetId}/edit`
      });
    } catch (error) {
      return res.status(200).json({
        success: true,
        configured: false,
        message: 'Google Sheets not configured'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
