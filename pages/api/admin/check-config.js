/**
 * Diagnostic endpoint to check configuration status
 * GET /api/admin/check-config
 */

const sheetsDB = require('../../../lib/sheets-database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      googleSheets: {
        status: 'checking',
        details: {}
      },
      environmentVariables: {
        status: 'checking',
        details: {}
      }
    }
  };

  // Check environment variables
  const envChecks = {
    GOOGLE_SHEETS_CREDENTIALS: {
      exists: !!process.env.GOOGLE_SHEETS_CREDENTIALS,
      valid: false,
      error: null
    },
    GOOGLE_SHEET_ID: {
      exists: !!process.env.GOOGLE_SHEET_ID,
      value: process.env.GOOGLE_SHEET_ID || 'Not set'
    },
    JWT_SECRET: {
      exists: !!process.env.JWT_SECRET
    }
  };

  // Try to parse GOOGLE_SHEETS_CREDENTIALS if it exists
  if (envChecks.GOOGLE_SHEETS_CREDENTIALS.exists) {
    try {
      const creds = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      envChecks.GOOGLE_SHEETS_CREDENTIALS.valid = true;
      envChecks.GOOGLE_SHEETS_CREDENTIALS.serviceAccount = creds.client_email || 'Not found';
      envChecks.GOOGLE_SHEETS_CREDENTIALS.projectId = creds.project_id || 'Not found';
    } catch (error) {
      envChecks.GOOGLE_SHEETS_CREDENTIALS.valid = false;
      envChecks.GOOGLE_SHEETS_CREDENTIALS.error = error.message;
    }
  }

  diagnostics.checks.environmentVariables = {
    status: envChecks.GOOGLE_SHEETS_CREDENTIALS.exists && envChecks.GOOGLE_SHEET_ID.exists ? 'ok' : 'error',
    details: envChecks
  };

  // Test Google Sheets connection
  try {
    const initialized = await sheetsDB.initialize();
    
    diagnostics.checks.googleSheets = {
      status: initialized ? 'ok' : 'error',
      initialized,
      spreadsheetId: process.env.GOOGLE_SHEET_ID || 'Not set'
    };

    if (initialized) {
      // Try a simple read operation
      try {
        const students = await sheetsDB.getStudents();
        diagnostics.checks.googleSheets.canRead = true;
        diagnostics.checks.googleSheets.studentCount = students.length;
      } catch (readError) {
        diagnostics.checks.googleSheets.canRead = false;
        diagnostics.checks.googleSheets.readError = readError.message;
      }
    }
  } catch (error) {
    diagnostics.checks.googleSheets = {
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }

  // Overall status
  const allOk = Object.values(diagnostics.checks).every(check => check.status === 'ok');
  diagnostics.status = allOk ? 'healthy' : 'unhealthy';

  // Recommendations
  diagnostics.recommendations = [];
  if (!envChecks.GOOGLE_SHEETS_CREDENTIALS.exists) {
    diagnostics.recommendations.push('Add GOOGLE_SHEETS_CREDENTIALS environment variable in Vercel dashboard');
  } else if (!envChecks.GOOGLE_SHEETS_CREDENTIALS.valid) {
    diagnostics.recommendations.push('Fix GOOGLE_SHEETS_CREDENTIALS format - should be valid JSON');
  }
  if (!envChecks.GOOGLE_SHEET_ID.exists) {
    diagnostics.recommendations.push('Add GOOGLE_SHEET_ID environment variable in Vercel dashboard');
  }
  if (!envChecks.JWT_SECRET.exists) {
    diagnostics.recommendations.push('Add JWT_SECRET environment variable for authentication');
  }
  if (envChecks.GOOGLE_SHEETS_CREDENTIALS.valid && envChecks.GOOGLE_SHEETS_CREDENTIALS.serviceAccount) {
    diagnostics.recommendations.push(`Share your Google Sheet with: ${envChecks.GOOGLE_SHEETS_CREDENTIALS.serviceAccount}`);
  }

  // Return appropriate status code
  const statusCode = allOk ? 200 : 503;
  res.status(statusCode).json(diagnostics);
}
