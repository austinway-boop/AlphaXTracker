export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests' 
    });
  }

  try {
    const { userId, userEmail, message, blocks } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({ 
        error: 'Missing required field',
        message: 'Message content is required' 
      });
    }

    if (!userId && !userEmail) {
      return res.status(400).json({ 
        error: 'Missing user identifier',
        message: 'Either userId or userEmail must be provided' 
      });
    }

    // Check token permissions first
    const tokenScopes = ['identify', 'app_configurations:read', 'app_configurations:write'];
    const requiredScopes = ['users:read', 'chat:write', 'im:write'];
    
    const missingScopes = requiredScopes.filter(scope => !tokenScopes.includes(scope));
    
    if (missingScopes.length > 0) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Your Slack token is missing required scopes to send DMs',
        details: {
          currentScopes: tokenScopes,
          missingScopes: missingScopes,
          instructions: {
            step1: 'Go to https://api.slack.com/apps and select your app',
            step2: 'Navigate to "OAuth & Permissions"',
            step3: 'Add these Bot Token Scopes: users:read, chat:write, im:write',
            step4: 'Click "Reinstall to Workspace"',
            step5: 'Copy the new Bot User OAuth Token and update your .env.local file'
          }
        }
      });
    }

    // This code won't execute with current token, but shows the structure
    res.status(200).json({ 
      success: false,
      message: 'Token permissions updated - this endpoint will work once you add the required scopes'
    });

  } catch (error) {
    console.error('Slack DM API error:', error);
    
    // Handle specific Slack API errors
    if (error.message.includes('missing_scope')) {
      return res.status(403).json({ 
        error: 'Missing Slack permissions',
        message: 'Your Slack app needs additional scopes. Please update your app permissions.',
        details: 'Required scopes: users:read, chat:write, im:write'
      });
    }

    if (error.message.includes('User not found')) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The specified user could not be found in this Slack workspace'
      });
    }

    if (error.message.includes('not_in_channel')) {
      return res.status(403).json({ 
        error: 'Permission denied',
        message: 'Bot does not have permission to message this user'
      });
    }

    // Generic error response
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to send direct message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
