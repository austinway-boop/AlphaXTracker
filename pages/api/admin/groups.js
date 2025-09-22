import { getAuth } from '../../../lib/auth';
const sheetsDB = require('../../../lib/sheets-database');

export default async function handler(req, res) {
  // Verify admin authentication
  const auth = await getAuth(req);
  if (!auth.loggedIn || auth.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }

  try {
    // Initialize Sheets database
    const dbInitialized = await sheetsDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }

    switch (req.method) {
      case 'GET':
        // Get all groups
        const groups = await sheetsDB.getAllGroups();
        return res.status(200).json({
          success: true,
          groups: groups
        });

      case 'POST':
        // Create new group
        const { name, color, description } = req.body;
        if (!name) {
          return res.status(400).json({
            success: false,
            message: 'Group name is required'
          });
        }
        
        // Generate a new ID
        const existingGroups = await sheetsDB.getAllGroups();
        const maxId = existingGroups.reduce((max, g) => {
          const id = parseInt(g.id) || 0;
          return id > max ? id : max;
        }, 0);
        const newId = (maxId + 1).toString();
        
        await sheetsDB.addGroup(name, newId, color || '#000000', description || '');
        
        return res.status(200).json({
          success: true,
          message: 'Group created successfully',
          group: { id: newId, name, color, description }
        });

      case 'PUT':
        // Update existing group
        const { id: updateId, name: updateName, color: updateColor, description: updateDescription } = req.body;
        if (!updateId) {
          return res.status(400).json({
            success: false,
            message: 'Group ID is required for update'
          });
        }
        
        await sheetsDB.updateGroup(updateId, updateName, updateColor, updateDescription);
        
        return res.status(200).json({
          success: true,
          message: 'Group updated successfully'
        });

      case 'DELETE':
        // Delete group
        const { id: deleteId } = req.body;
        if (!deleteId) {
          return res.status(400).json({
            success: false,
            message: 'Group ID is required for deletion'
          });
        }
        
        await sheetsDB.deleteGroup(deleteId);
        
        return res.status(200).json({
          success: true,
          message: 'Group deleted successfully'
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Error managing groups:', error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`
    });
  }
}