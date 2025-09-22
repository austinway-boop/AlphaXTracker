const sheetsDB = require('../../../lib/google-sheets');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Verify this is a scheduled call or admin request
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'default-cron-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    // Try admin authentication
    const { getAuth } = require('../../../lib/auth');
    const auth = await getAuth(req);
    if (!auth.loggedIn || auth.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
  }

  try {
    console.log('Starting automated social media check...');
    
    // Initialize database
    const dbInitialized = await sheetsDB.initialize();
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed'
      });
    }

    // Check if auto-check is enabled
    const settings = await sheetsDB.getSettings();
    if (!settings.autoCheckEnabled) {
      return res.status(200).json({
        success: true,
        message: 'Auto-check is disabled',
        skipped: true
      });
    }

    // Check if we should run (based on interval)
    const lastCheck = settings.lastAutoCheck ? new Date(settings.lastAutoCheck) : null;
    const now = new Date();
    const intervalMinutes = settings.checkInterval || 60;
    
    if (lastCheck && (now - lastCheck) < (intervalMinutes * 60 * 1000)) {
      return res.status(200).json({
        success: true,
        message: `Too soon since last check (${Math.round((now - lastCheck) / 60000)} minutes ago)`,
        skipped: true
      });
    }

    // Run the social media check
    const result = await runSocialMediaCheck();
    
    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error('Error in auto-check:', error);
    return res.status(500).json({
      success: false,
      message: 'Error running auto-check: ' + error.message
    });
  }
}

// Run social media check for all students
async function runSocialMediaCheck() {
  try {
    const students = await sheetsDB.getAllStudents();
    const today = new Date().toISOString().split('T')[0];
    let checkedCount = 0;
    let updatedCount = 0;
    const errors = [];
    const results = [];

    console.log(`Checking ${students.length} students for ${today}`);

    for (const student of students) {
      try {
        // Get student's social media handles
        const profile = await sheetsDB.getStudentProfile(student.id);
        if (!profile || !profile.platforms) {
          console.log(`No platforms configured for student ${student.id}`);
          continue;
        }

        // Check each platform
        const socialTracker = require('../../../lib/social-tracker');
        const platformResults = await socialTracker.checkAllPlatforms(profile.platforms, today);
        
        // Save results to Google Sheets
        await sheetsDB.logSocialMediaActivity(
          student.id,
          student.firstName + ' ' + student.lastName,
          today,
          platformResults
        );
        
        checkedCount++;
        const totalActivity = Object.values(platformResults).reduce((sum, count) => sum + count, 0);
        
        if (totalActivity > 0) {
          updatedCount++;
          results.push({
            studentId: student.id,
            studentName: student.firstName + ' ' + student.lastName,
            activity: platformResults,
            total: totalActivity
          });
        }

        console.log(`Student ${student.id}: ${totalActivity} total posts`);
        
      } catch (error) {
        console.error(`Error checking student ${student.id}:`, error);
        errors.push(`Student ${student.id}: ${error.message}`);
      }
    }

    // Update last check time
    await sheetsDB.updateSettings({
      lastAutoCheck: new Date().toISOString()
    });

    console.log(`Auto-check completed: ${checkedCount} checked, ${updatedCount} with activity`);

    return {
      success: true,
      message: `Checked ${checkedCount} students, found activity for ${updatedCount}`,
      data: {
        checkedCount,
        updatedCount,
        date: today,
        results: results.slice(0, 10), // Limit to first 10 for response size
        errors: errors.length > 0 ? errors : null
      }
    };
  } catch (error) {
    console.error('Error running social media check:', error);
    return {
      success: false,
      message: 'Error running social media check: ' + error.message
    };
  }
}
