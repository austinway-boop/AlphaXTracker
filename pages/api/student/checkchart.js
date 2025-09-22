/**
 * API endpoint for students to view their check chart and progress
 * Students can only view, not edit
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

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    // Check authentication
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const userRole = req.headers['x-user-role'];
    const studentId = req.headers['x-student-id'];

    if (!authToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Authentication required'
      });
    }

    // For students, use their own ID from auth
    // For admins, they can specify a student ID in query
    let targetStudentId = studentId;
    if (userRole === 'admin' && req.query.studentId) {
      targetStudentId = req.query.studentId;
    }

    if (!targetStudentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID not found'
      });
    }

    // Get student information to determine if honors
    const student = await sheetsDb.getStudentById(targetStudentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get the appropriate check chart based on honors status
    const chart = await sheetsDb.getCheckChart(student.honors);

    // Get student's progress
    const progress = await sheetsDb.getStudentCheckProgress(targetStudentId);
    const chartType = student.honors ? 'honors' : 'nonhonors';
    const studentProgress = progress.filter(p => p.chartType === chartType);

    // Create a map of completed tasks
    const completedTasks = {};
    let totalPointsEarned = 0;
    studentProgress.forEach(p => {
      if (p.completed) {
        completedTasks[p.taskId] = {
          completed: true,
          completedDate: p.completedDate,
          completedBy: p.completedBy
        };
        totalPointsEarned += p.points || 0;
      }
    });

    // Calculate total possible points and add completion status to tasks
    let totalPossiblePoints = 0;
    const enrichedChart = {
      ...chart,
      stages: chart.stages.map(stage => ({
        ...stage,
        topics: stage.topics.map(topic => ({
          ...topic,
          tasks: topic.tasks.map(task => {
            totalPossiblePoints += task.points || 0;
            return {
              ...task,
              completed: !!completedTasks[task.id],
              completedInfo: completedTasks[task.id] || null
            };
          })
        }))
      }))
    };

    return res.status(200).json({
      success: true,
      chart: enrichedChart,
      summary: {
        totalTasks: Object.keys(completedTasks).length,
        totalPointsEarned,
        totalPossiblePoints,
        completionPercentage: totalPossiblePoints > 0 
          ? Math.round((totalPointsEarned / totalPossiblePoints) * 100)
          : 0,
        isHonors: student.honors
      }
    });

  } catch (error) {
    console.error('Student check chart API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
