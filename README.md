# AlphaX Tracker 🚀

A comprehensive student tracking system with Google Sheets integration, Slack notifications, and social media monitoring. Built with Next.js for easy deployment on Vercel.

**Last Updated**: December 2024  
**Status**: Production Ready

## Features

- ✅ Send direct messages to Slack users by email or user ID
- ✅ Test Slack connection and bot status
- ✅ Beautiful web interface for testing
- ✅ RESTful API endpoints
- ✅ Ready for Vercel deployment
- ✅ Token refresh support
- ✅ Error handling and validation

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd AlphaXTracker
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
SLACK_BOT_TOKEN=xoxe.xoxp-1-your-access-token-here
SLACK_REFRESH_TOKEN=xoxe-1-your-refresh-token-here
NODE_ENV=development
```

### 3. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see the web interface.

## API Endpoints

### Send Direct Message

**POST** `/api/slack/send-dm`

Send a direct message to a Slack user.

**Request Body:**
```json
{
  "userEmail": "user@company.com",  // OR
  "userId": "U1234567890",
  "message": "Hello from the bot!",
  "blocks": []  // Optional: Slack Block Kit formatting
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageTs": "1234567890.123456",
    "channel": "D1234567890",
    "userId": "U1234567890",
    "message": "Hello from the bot!"
  }
}
```

### Test Connection

**GET** `/api/slack/test-connection`

Test the Slack bot connection and get bot information.

**Response:**
```json
{
  "success": true,
  "connection": "active",
  "bot": {
    "id": "U1234567890",
    "name": "AlphaX Bot",
    "team": "Your Team",
    "teamId": "T1234567890"
  }
}
```

## Usage Examples

### Using the Web Interface

1. Visit your deployed app or `http://localhost:3000`
2. Test the connection first
3. Enter a user email or ID
4. Type your message
5. Click "Send DM"

### Using cURL

```bash
# Send DM by email
curl -X POST https://your-app.vercel.app/api/slack/send-dm \\
  -H "Content-Type: application/json" \\
  -d '{
    "userEmail": "user@company.com",
    "message": "Hello from the bot!"
  }'

# Send DM by user ID
curl -X POST https://your-app.vercel.app/api/slack/send-dm \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "U1234567890",
    "message": "Hello from the bot!"
  }'
```

### Using JavaScript/Fetch

```javascript
const response = await fetch('/api/slack/send-dm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userEmail: 'user@company.com',
    message: 'Hello from the bot!'
  })
});

const result = await response.json();
console.log(result);
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect it's a Next.js app

3. **Set Environment Variables in Vercel:**
   - Go to your project settings
   - Add these environment variables:
     - `SLACK_BOT_TOKEN`: Your Slack bot token
     - `SLACK_REFRESH_TOKEN`: Your Slack refresh token
     - `NODE_ENV`: `production`

4. **Deploy:**
   - Vercel will automatically deploy on every push to main
   - Your app will be available at `https://your-app.vercel.app`

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Slack App Setup

To use this bot, you need to create a Slack app:

1. **Create Slack App:**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name your app and select workspace

2. **Set Permissions:**
   - Go to "OAuth & Permissions"
   - Add these Bot Token Scopes:
     - `chat:write` - Send messages
     - `users:read` - Look up users by email
     - `im:write` - Send direct messages

3. **Install App:**
   - Click "Install to Workspace"
   - Copy the "Bot User OAuth Token"

4. **Get Tokens:**
   - Use the access token you provided: `xoxe.xoxp-1-Mi0y...`
   - Use the refresh token you provided: `xoxe-1-My0x...`

## Project Structure

```
/
├── lib/
│   └── slack.js              # Slack client and helper functions
├── pages/
│   ├── api/
│   │   └── slack/
│   │       ├── send-dm.js    # Send DM endpoint
│   │       └── test-connection.js # Connection test endpoint
│   └── index.js              # Web interface
├── package.json              # Dependencies
├── vercel.json              # Vercel configuration
└── README.md                # This file
```

## Error Handling

The bot handles various error scenarios:

- **User not found**: Returns 404 with helpful message
- **Permission denied**: Returns 403 if bot can't message user
- **Invalid tokens**: Returns 500 with token error details
- **Network errors**: Graceful fallback with error messages

## Security

- Environment variables are used for sensitive tokens
- API endpoints validate input data
- Error messages don't expose sensitive information in production
- HTTPS is enforced on Vercel

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

### Adding Features

The codebase is structured for easy extension:

- Add new API endpoints in `pages/api/`
- Extend Slack functionality in `lib/slack.js`
- Modify the UI in `pages/index.js`

## Troubleshooting

### Common Issues

1. **"User not found" error:**
   - Ensure the user is in your Slack workspace
   - Check the email address is correct
   - Verify the user hasn't deactivated their account

2. **"Permission denied" error:**
   - Check your bot has the required scopes
   - Ensure the bot is installed in the workspace
   - Verify the user allows DMs from bots

3. **Token errors:**
   - Verify your tokens are correctly set in environment variables
   - Check if tokens have expired
   - Ensure you're using the correct token format

### Getting Help

- Check the Vercel deployment logs
- Test the connection endpoint first
- Verify environment variables are set correctly

## License

MIT License - feel free to use this for your projects!

---

Built with ❤️ using Next.js and the Slack Web API
# Last Deploy: Tue Sep 23 08:36:30 CDT 2025
