const sheetsDB = require('../../lib/sheets-database');
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    let allStudents = [];
    
    // Try Google Sheets first
    try {
      const dbInitialized = await sheetsDB.initialize();
      if (dbInitialized) {
        allStudents = await sheetsDB.getAllStudents();
      }
    } catch (error) {
      console.log('Google Sheets unavailable, falling back to local data:', error.message);
    }
    
    // Fallback to local JSON if Sheets fails or returns empty
    if (allStudents.length === 0) {
      const studentsPath = path.join(process.cwd(), 'data', 'students.json');
      if (fs.existsSync(studentsPath)) {
        const localData = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
        allStudents = localData.students || [];
        console.log('Using local student data as fallback');
      }
    }
    
    // Filter out deleted students and empty entries
    const students = allStudents.filter(s => 
      s.status !== 'Deleted' && 
      s.firstName && 
      s.lastName &&
      s.id
    );
    
    // Get groups for additional context
    let groups = [];
    try {
      groups = await sheetsDB.getAllGroups();
    } catch (error) {
      console.log('Groups unavailable, using empty array');
      // Fallback to local groups if available
      const groupsPath = path.join(process.cwd(), 'data', 'groups.json');
      if (fs.existsSync(groupsPath)) {
        const localGroups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
        groups = localGroups.groups || [];
      }
    }
    
    // Enhance student data with group information
    const enhancedStudents = students.map(student => {
      const group = groups.find(g => g.id === student.groupId);
      return {
        ...student,
        groupName: group?.name || null,
        groupColor: group?.color || null
      };
    });

    // Sort students alphabetically by firstName, then lastName
    enhancedStudents.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return res.status(200).json({
      success: true,
      students: enhancedStudents,
      totalStudents: enhancedStudents.length,
      honorsStudents: enhancedStudents.filter(s => s.honors).length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching students data'
    });
  }
}