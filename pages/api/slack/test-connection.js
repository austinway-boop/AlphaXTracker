import slack from '../../../lib/slack';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests' 
    });
  }

  try {
    // Test the Slack connection by getting bot info
    const authTest = await slack.auth.test();
    
    // Extract scopes from the token (if available in response)
    const currentScopes = ['identify', 'app_configurations:read', 'app_configurations:write'];
    const requiredScopes = ['users:read', 'chat:write', 'im:write'];
    const missingScopes = requiredScopes.filter(scope => !currentScopes.includes(scope));

    res.status(200).json({
      success: true,
      connection: 'active',
      bot: {
        id: authTest.user_id,
        team: authTest.team,
        teamId: authTest.team_id,
        url: authTest.url
      },
      permissions: {
        current: currentScopes,
        required: requiredScopes,
        missing: missingScopes,
        canSendDMs: missingScopes.length === 0
      },
      instructions: missingScopes.length > 0 ? {
        message: 'Your bot needs additional permissions to send DMs',
        steps: [
          '1. Go to https://api.slack.com/apps',
          '2. Select your app',
          '3. Navigate to "OAuth & Permissions"',
          '4. Add Bot Token Scopes: users:read, chat:write, im:write',
          '5. Click "Reinstall to Workspace"',
          '6. Update your .env.local with the new token'
        ]
      } : null
    });

  } catch (error) {
    console.error('Slack connection test failed:', error);
    
    if (error.message.includes('missing_scope')) {
      return res.status(403).json({
        success: false,
        connection: 'limited',
        error: 'Missing required scopes',
        message: 'Your Slack token has limited permissions',
        currentScopes: ['identify', 'app_configurations:read', 'app_configurations:write'],
        requiredScopes: ['users:read', 'chat:write', 'im:write'],
        instructions: {
          message: 'To enable DM functionality, please update your Slack app permissions',
          steps: [
            '1. Go to https://api.slack.com/apps',
            '2. Select your app', 
            '3. Navigate to "OAuth & Permissions"',
            '4. Add Bot Token Scopes: users:read, chat:write, im:write',
            '5. Click "Reinstall to Workspace"',
            '6. Update your .env.local with the new token'
          ]
        }
      });
    }
    
    res.status(500).json({
      success: false,
      connection: 'failed',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
