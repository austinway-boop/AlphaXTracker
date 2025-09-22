/**
 * API endpoint for managing check charts
 * Handles GET (fetch chart) and POST (save chart) operations
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
      // Fetch check chart
      const { type } = req.query;
      
      if (!type || !['honors', 'nonhonors'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chart type. Must be "honors" or "nonhonors"'
        });
      }

      const isHonors = type === 'honors';
      const chart = await sheetsDb.getCheckChart(isHonors);

      return res.status(200).json({
        success: true,
        chart
      });

    } else if (req.method === 'POST') {
      // Save check chart
      const { type, chart } = req.body;

      if (!type || !['honors', 'nonhonors'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chart type. Must be "honors" or "nonhonors"'
        });
      }

      if (!chart || !chart.stages) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chart data'
        });
      }

      const isHonors = type === 'honors';
      const result = await sheetsDb.saveCheckChart(isHonors, chart);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Check chart saved successfully'
        });
      } else {
        throw new Error('Failed to save chart');
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Check chart API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
