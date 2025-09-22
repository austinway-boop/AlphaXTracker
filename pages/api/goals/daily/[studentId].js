import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
const sheetsDB = require('../../../../lib/sheets-database');

const GOALS_DIR = path.join(process.cwd(), 'data', 'daily-goals');

// Ensure goals directory exists
if (!fs.existsSync(GOALS_DIR)) {
  fs.mkdirSync(GOALS_DIR, { recursive: true });
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getGoalFilePath(studentId, date) {
  return path.join(GOALS_DIR, `student_${studentId}_${date}.json`);
}

function getGoalHistoryPath(studentId) {
  return path.join(GOALS_DIR, `student_${studentId}_history.json`);
}

export default async function handler(req, res) {
  const { studentId, date, range } = req.query;
  
  // Validate studentId
  if (!studentId || isNaN(parseInt(studentId))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student ID'
    });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No authorization token provided' 
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'alphax-tracker-secret-key-2024');
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }

  // Check permissions - students can only access their own goals
  if (decoded.role === 'student' && decoded.studentId !== parseInt(studentId)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied: You can only view your own goals' 
    });
  }

  const targetDate = date || getTodayDate();
  const goalPath = getGoalFilePath(studentId, targetDate);
  const historyPath = getGoalHistoryPath(studentId);

  if (req.method === 'GET') {
    try {
      // Handle range queries for multiple days
      if (range) {
        const rangeNum = parseInt(range);
        if (isNaN(rangeNum) || rangeNum < 1 || rangeNum > 365) {
          return res.status(400).json({
            success: false,
            message: 'Invalid range. Must be between 1 and 365 days.'
          });
        }
        
        const dailyGoals = [];
        const endDate = new Date(targetDate);
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - rangeNum + 1);
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const dayGoalPath = getGoalFilePath(studentId, dateKey);
          
          if (fs.existsSync(dayGoalPath)) {
            const goalData = JSON.parse(fs.readFileSync(dayGoalPath, 'utf8'));
            dailyGoals.push(goalData);
          } else {
            dailyGoals.push({
              date: dateKey,
              status: 'not set',
              goalText: '',
              setBy: null,
              completedBy: null
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return res.status(200).json({
          success: true,
          dailyGoals
        });
      }
      
      // Get goal for specific date
      if (date) {
        if (fs.existsSync(goalPath)) {
          const goalData = JSON.parse(fs.readFileSync(goalPath, 'utf8'));
          return res.status(200).json({
            success: true,
            goal: goalData
          });
        } else {
          return res.status(200).json({
            success: true,
            goal: {
              date: targetDate,
              status: 'not set',
              goalText: '',
              setBy: null,
              completedBy: null
            }
          });
        }
      }

      // Get goal history if requested
      if (req.query.history === 'true') {
      let history = [];
      if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      }
      
      return res.status(200).json({
        success: true,
        history: history
      });
    }

    // Get today's goal
      if (fs.existsSync(goalPath)) {
        const goalData = JSON.parse(fs.readFileSync(goalPath, 'utf8'));
        return res.status(200).json({
          success: true,
          goal: goalData
        });
      } else {
        return res.status(200).json({
          success: true,
          goal: {
            date: targetDate,
            status: 'not set',
            goalText: '',
            setBy: null,
            completedBy: null
          }
        });
      }
    } catch (error) {
      console.error('Error reading goals:', error);
      return res.status(500).json({
        success: false,
        message: 'Error reading goal data'
      });
    }

  } else if (req.method === 'POST' || req.method === 'PUT') {
    try {
      // Set or update goal
      const { goalText, status } = req.body;

      // Validate input
      if (goalText !== undefined && typeof goalText !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Goal text must be a string'
        });
      }
      
      if (status && !['set', 'completed', 'not met', 'not set'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: set, completed, not met, or not set'
        });
      }

      let currentGoal = { 
        date: targetDate, 
        goalText: '', 
        status: 'not set', 
        setBy: null, 
        completedBy: null 
      };
      
      // Load existing goal if updating
      if (fs.existsSync(goalPath)) {
        currentGoal = JSON.parse(fs.readFileSync(goalPath, 'utf8'));
      }

      // Update goal data
      if (goalText !== undefined) {
        currentGoal.goalText = goalText.trim().substring(0, 500);
        currentGoal.status = 'set';
        currentGoal.setBy = decoded.role;
      }

      // Update status
      if (status === 'completed') {
        currentGoal.status = 'completed';
        currentGoal.completedBy = decoded.role;
      } else if (status === 'not met') {
        currentGoal.status = 'not met';
        currentGoal.completedBy = null;
      } else if (status === 'set' && !currentGoal.goalText) {
        currentGoal.status = 'set';
        currentGoal.completedBy = null;
      }

      // Save goal with timestamp
      currentGoal.updatedAt = new Date().toISOString();
      fs.writeFileSync(goalPath, JSON.stringify(currentGoal, null, 2));

      // Update history
      let history = {};
      if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      }
      history[targetDate] = currentGoal;
      
      // Clean up old history (keep 90 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      for (const key in history) {
        if (new Date(key) < cutoffDate) {
          delete history[key];
        }
      }
      
      // Save history
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

      // IMPORTANT: Also save to Google Sheets for leaderboard sync
      await sheetsDB.initialize();
      await sheetsDB.addGoalHistory(parseInt(studentId), {
        date: targetDate,
        dailyGoal: currentGoal.goalText || '',
        dailyGoalCompleted: currentGoal.status === 'completed',
        sessionGoal: '',
        projectOneliner: '',
        brainliftCompleted: false,
        audienceX: 0,
        audienceYouTube: 0,
        audienceTikTok: 0,
        audienceInstagram: 0
      });

      return res.status(200).json({
        success: true,
        message: 'Goal saved successfully',
        goal: currentGoal
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      return res.status(500).json({
        success: false,
        message: 'Error saving goal'
      });
    }

  } else if (req.method === 'DELETE') {
    // Delete goal (admin only)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    if (fs.existsSync(goalPath)) {
      fs.unlinkSync(goalPath);
      
      // Update history to mark as deleted
      let history = [];
      if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        history = history.filter(h => h.date !== targetDate);
        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
      }
      
      return res.status(200).json({
        success: true,
        message: 'Goal deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}
