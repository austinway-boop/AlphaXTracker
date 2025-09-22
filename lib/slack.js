import { WebClient } from '@slack/web-api';

// Initialize Slack client with bot token
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Helper function to refresh token if needed
export async function refreshSlackToken() {
  if (!process.env.SLACK_REFRESH_TOKEN) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: process.env.SLACK_REFRESH_TOKEN,
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Token refresh failed: ${data.error}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (error) {
    console.error('Failed to refresh Slack token:', error);
    throw error;
  }
}

// Helper function to find user by email
export async function findUserByEmail(email) {
  try {
    const result = await slack.users.lookupByEmail({ email });
    return result.user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw new Error(`User not found: ${email}`);
  }
}

// Helper function to open DM channel
export async function openDMChannel(userId) {
  try {
    const result = await slack.conversations.open({ users: userId });
    return result.channel;
  } catch (error) {
    console.error('Error opening DM channel:', error);
    throw new Error(`Failed to open DM with user: ${userId}`);
  }
}

// Helper function to send message
export async function sendMessage(channelId, message, blocks = null) {
  try {
    const payload = {
      channel: channelId,
      text: message,
    };

    if (blocks) {
      payload.blocks = blocks;
    }

    const result = await slack.chat.postMessage(payload);
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

export default slack;
