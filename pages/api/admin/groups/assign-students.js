import { getAuth } from '../../../../lib/auth';
const sheetsDB = require('../../../../lib/sheets-database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Verify admin authentication
  const auth = await getAuth(req);
  if (!auth.loggedIn || auth.role !== 'admin') {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required' 
    });
  }

  try {
    const { groupId, studentIds, action = 'assign' } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student IDs array is required' 
      });
    }

    if (action === 'assign' && (groupId === undefined || groupId === null)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group ID is required for assignment' 
      });
    }

    // Initialize Sheets database
    const dbInitialized = await sheetsDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }

    let updatedCount = 0;
    const errors = [];

    // Update each student's group assignment in Google Sheets
    for (const studentId of studentIds) {
      try {
        // Get current student data
        const student = await sheetsDB.getStudentById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Update group assignment
        const updatedGroupId = action === 'assign' ? groupId : null;
        
        // Update student in Google Sheets
        await sheetsDB.updateStudent(studentId, {
          groupId: updatedGroupId
        });

        updatedCount++;
      } catch (error) {
        console.error(`Error updating student ${studentId}:`, error);
        errors.push({ studentId, error: error.message });
      }
    }

    if (updatedCount === 0) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update any students',
        errors 
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedCount} out of ${studentIds.length} students`,
      updatedCount,
      totalRequested: studentIds.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in bulk assignment:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
