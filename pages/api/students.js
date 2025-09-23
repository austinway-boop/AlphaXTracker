const redisDB = require('../../lib/redis-database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    // Initialize Redis database
    const dbInitialized = await redisDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }
    
    // Get all students from Redis
    const allStudents = await redisDB.getAllStudents();
    
    // Format response
    const formattedStudents = allStudents.map(student => ({
      id: student.id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: student.fullName || `${student.firstName} ${student.lastName}`,
      honors: student.honors || false,
      points: student.points || 0,
      status: student.status || 'active',
      lastActivity: student.lastActivity || null
    }));
    
    return res.status(200).json({
      success: true,
      students: formattedStudents,
      totalStudents: formattedStudents.length
    });
    
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
}