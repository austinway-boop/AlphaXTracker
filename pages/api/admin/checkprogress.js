/**
 * API endpoint for managing student check progress
 * Handles GET (fetch progress), POST (update progress), and DELETE operations
 */

const sheetsDb = require('../../../lib/sheets-database');

export default async function handler(req, res) {
  try {
    // Initialize sheets database
    const initialized = await sheetsDb.initialize();
    if (!initialized) {
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize database'
      });
    }

    // Check authentication
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const userRole = req.headers['x-user-role'];

    if (!authToken || userRole !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Admin access required'
      });
    }

    if (req.method === 'GET') {
      // Fetch student check progress
      const { studentId, chartType } = req.query;

      if (studentId) {
        // Get progress for specific student
        const progress = await sheetsDb.getStudentCheckProgress(studentId);
        
        // Filter by chart type if specified
        const filteredProgress = chartType 
          ? progress.filter(p => p.chartType === chartType)
          : progress;

        return res.status(200).json({
          success: true,
          progress: filteredProgress
        });
      } else if (chartType) {
        // Get progress for all students for a specific chart type
        const progressByStudent = await sheetsDb.getCheckProgressForAllStudents(chartType);
        
        return res.status(200).json({
          success: true,
          progressByStudent
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Must provide either studentId or chartType parameter'
        });
      }

    } else if (req.method === 'POST') {
      // Update student check progress
      const { studentId, taskId, chartType, completed, adminEmail } = req.body;

      if (!studentId || !taskId || !chartType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: studentId, taskId, chartType'
        });
      }

      if (!['honors', 'nonhonors'].includes(chartType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chart type. Must be "honors" or "nonhonors"'
        });
      }

      const result = await sheetsDb.updateStudentCheckProgress(
        studentId,
        taskId,
        chartType,
        completed !== false, // Default to true if not specified
        adminEmail || 'admin'
      );

      if (result.success) {
        // Update student points if completing a task
        if (completed) {
          const isHonors = chartType === 'honors';
          const chart = await sheetsDb.getCheckChart(isHonors);
          
          // Find the task and its points
          let taskPoints = 0;
          chart.stages.forEach(stage => {
            stage.topics.forEach(topic => {
              const task = topic.tasks.find(t => t.id === taskId);
              if (task) {
                taskPoints = task.points || 0;
              }
            });
          });

          // Update student points
          if (taskPoints > 0) {
            const student = await sheetsDb.getStudentById(studentId);
            if (student) {
              await sheetsDb.updateStudent(studentId, {
                points: (student.points || 0) + taskPoints
              });
            }
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Check progress updated successfully'
        });
      } else {
        throw new Error('Failed to update progress');
      }

    } else if (req.method === 'DELETE') {
      // Remove check progress (mark as incomplete)
      const { studentId, taskId, chartType } = req.body;

      if (!studentId || !taskId || !chartType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: studentId, taskId, chartType'
        });
      }

      const result = await sheetsDb.updateStudentCheckProgress(
        studentId,
        taskId,
        chartType,
        false, // Mark as not completed
        null
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Check progress removed successfully'
        });
      } else {
        throw new Error('Failed to remove progress');
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Check progress API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
