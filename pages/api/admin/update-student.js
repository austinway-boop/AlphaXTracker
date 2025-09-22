import { getAuth } from '../../../lib/auth';
const sheetsDB = require('../../../lib/sheets-database');

export default async function handler(req, res) {
  const auth = await getAuth(req);
  if (!auth.loggedIn || auth.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.method === 'POST') {
    try {
      const { studentId, groupId, honors } = req.body;

      if (!studentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Student ID is required' 
        });
      }

      await sheetsDB.initialize();

      // Get current student data
      const student = await sheetsDB.getStudentById(studentId);
      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }

      // Update student with new groupId and honors status
      const updatedStudent = {
        ...student,
        groupId: groupId !== undefined ? groupId : student.groupId,
        honors: honors !== undefined ? honors : student.honors
      };

      await sheetsDB.updateStudent(studentId, updatedStudent);

      return res.status(200).json({ 
        success: true, 
        message: 'Student updated successfully',
        student: updatedStudent
      });
    } catch (error) {
      console.error('Error updating student:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating student' 
      });
    }
  }

  return res.status(405).json({ 
    success: false, 
    message: 'Method not allowed' 
  });
}
