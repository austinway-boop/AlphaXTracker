import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    goals: {},
    platforms: {},
    dailyGoal: '',
    sessionGoal: '',
    projectOneliner: '',
    brainliftCompleted: false,
    lastBrainliftDate: null,
    dailyGoalCompleted: false,
    lastDailyGoalDate: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // 'today', 'week', 'month'
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'student') {
      router.push('/login');
      return;
    }

    // Get user info from localStorage (set during login)
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setUser(userInfo);
    
    // Fetch profile data
    fetchProfile(userInfo.id);
    
    // Check goals on load
    checkGoals(userInfo.id);
  }, [router]);

  const fetchProfile = async (studentId, fresh = false) => {
    try {
      const url = fresh 
        ? `/api/profile/${studentId}?fresh=true` 
        : `/api/profile/${studentId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        const profileData = data.profile || {};
        console.log(`[Dashboard] Fetched profile:`, {
          brainlift: profileData.brainliftCompleted,
          brainliftDate: profileData.lastBrainliftDate,
          dailyGoal: profileData.dailyGoalCompleted,
          dailyGoalDate: profileData.lastDailyGoalDate
        });
        
        const newProfile = {
          goals: profileData.goals || {},
          platforms: profileData.platforms || {},
          dailyGoal: profileData.dailyGoal || '',
          sessionGoal: profileData.sessionGoal || '',
          projectOneliner: profileData.projectOneliner || '',
          // Use the backend's determination of completion status
          brainliftCompleted: profileData.brainliftCompleted || false,
          lastBrainliftDate: profileData.lastBrainliftDate || null,
          dailyGoalCompleted: profileData.dailyGoalCompleted || false,
          lastDailyGoalDate: profileData.lastDailyGoalDate || null
        };
        
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGoals = async (studentId, date = null) => {
    try {
      let url = `/api/goals/check/${studentId}`;
      if (date) {
        url += `?date=${date}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error checking goals:', error);
    }
  };

  const fetchHistoricalData = async (range) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/goals/check/${user.id}?range=${range}`);
      const data = await response.json();
      if (data.success && data.historical) {
        setHistoricalData(data.data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const handlePlatformChange = (platform, value) => {
    setProfile(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: value
      }
    }));
  };

  const handleGoalChange = (platform, value) => {
    setProfile(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [platform]: parseInt(value) || 0
      }
    }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Profile saved successfully!', 'success');
        // Refresh stats after saving
        checkGoals(user.id);
      } else {
        showNotification('Failed to save profile', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('Error saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fafafa;
          }
          .loading-spinner {
            font-size: 1.2rem;
            color: #1a1a1a;
          }

          /* Notification Styles */
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 16px 20px;
            padding-right: 48px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
            min-width: 300px;
            border-left: 4px solid #16a34a;
          }

          .notification.error {
            border-left-color: #dc2626;
          }

          .notification.success {
            border-left-color: #16a34a;
          }

          .notification span {
            flex: 1;
            font-size: 0.95rem;
            color: #1a1a1a;
          }

          .notification-close {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #999;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
          }

          .notification-close:hover {
            color: #666;
          }

          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Head>
        <title>Student Dashboard - AlphaX Tracker</title>
        <meta name="description" content="Student Dashboard for AlphaX Tracker" />
        <link href="/styles/calendar.css" rel="stylesheet" />
      </Head>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <h1>AlphaX Tracker</h1>
          </div>
          <div className="header-actions">
            <span className="user-info">
              {user?.firstName} {user?.lastName}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            My Goals
          </button>
          <button 
            className={`nav-tab ${activeTab === 'audience' ? 'active' : ''}`}
            onClick={() => setActiveTab('audience')}
          >
            Audience Building
          </button>
          <button 
            className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button 
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-content">
          {activeTab === 'overview' && (
            <OverviewTab 
              profile={profile}
              setProfile={setProfile}
              onSave={saveProfile}
              saving={saving}
              user={user}
              showNotification={showNotification}
              fetchProfile={fetchProfile}
            />
          )}
          {activeTab === 'goals' && (
            <PersonalGoalsTab 
              profile={profile}
              setProfile={setProfile}
              onSave={saveProfile}
              saving={saving}
            />
          )}
          {activeTab === 'audience' && (
            <AudienceTab 
              profile={profile}
              onPlatformChange={handlePlatformChange}
              onGoalChange={handleGoalChange}
              onSave={saveProfile}
              saving={saving}
            />
          )}
          {activeTab === 'stats' && (
            <StatsTab 
              stats={stats} 
              profile={profile} 
              user={user}
              checkGoals={checkGoals}
              fetchHistoricalData={fetchHistoricalData}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab 
              user={user}
            />
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #fafafa;
        }

        .dashboard-header {
          background: white;
          border-bottom: 1px solid #f0f0f0;
          padding: 0 40px;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
        }

        .logo h1 {
          margin: 0;
          color: #1a1a1a;
          font-size: 1.4rem;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .user-info {
          color: #666;
          font-weight: 400;
          font-size: 0.95rem;
        }

        .logout-btn {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 400;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #333;
          transform: translateY(-1px);
        }

        .dashboard-nav {
          background: white;
          border-bottom: 1px solid #f0f0f0;
          padding: 0 40px;
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          gap: 0;
        }

        .nav-tab {
          background: none;
          border: none;
          padding: 20px 32px;
          cursor: pointer;
          font-weight: 400;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .nav-tab:hover {
          color: #1a1a1a;
          background: #fafafa;
        }

        .nav-tab.active {
          color: #1a1a1a;
          border-bottom-color: #1a1a1a;
          font-weight: 500;
        }

        .dashboard-main {
          padding: 0;
        }

        .main-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .dashboard-header,
          .dashboard-nav {
            padding: 0 20px;
          }
          
          .header-content {
            height: 70px;
          }
          
          .nav-content {
            overflow-x: auto;
          }
          
          .nav-tab {
            white-space: nowrap;
            padding: 16px 24px;
          }
          
          .logo h1 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}

// Overview Tab Component - New main dashboard
function OverviewTab({ profile, setProfile, onSave, saving, user, showNotification, fetchProfile }) {
  const today = new Date().toISOString().split('T')[0];
  // Use the profile's completion status directly - backend determines if it's for today
  const isBrainliftCompletedToday = profile.brainliftCompleted || false;
  const isDailyGoalCompletedToday = profile.dailyGoalCompleted || false;
  const [currentQuote, setCurrentQuote] = useState('');
  const [checkChart, setCheckChart] = useState(null);
  const [checkChartLoading, setCheckChartLoading] = useState(true);

  const inspirationalQuotes = [
    "Start before you feel ready.",
    "Progress loves persistence.",
    "Tiny steps beat perfect plans.",
    "Courage is a decision, not a mood.",
    "Do it afraid, then do it better.",
    "Consistency compounds quietly.",
    "Your future is built daily.",
    "Action cures anxiety.",
    "Move first; clarity follows motion.",
    "Discipline is a form of self-respect.",
    "Keep the promise you made to yourself.",
    "Momentum is a superpower—protect it.",
    "The gap between dreams and reality is work.",
    "You don't need more time; you need more focus.",
    "Be the thermostat, not the thermometer.",
    "Win the morning; win the day.",
    "One page a day writes the book.",
    "You are one decision from a new direction.",
    "Effort is a language results understand.",
    "Doubt grows in silence; action answers it.",
    "Direction matters more than speed.",
    "Excellence is a habit dressed as routine.",
    "Your standards set your ceiling.",
    "Comfort is a cage with velvet bars.",
    "Growth begins where excuses end.",
    "Show up, even when it's boring.",
    "Your pace is fine—just don't stop.",
    "Talent opens doors; grit keeps them open.",
    "Hard choices, easy life; easy choices, hard life.",
    "If it's important, schedule it.",
    "Be loyal to your goals, flexible in your methods.",
    "The next best step is enough.",
    "Failure is tuition for mastery.",
    "Don't fear crickets; build the audience.",
    "Start small, think big, learn fast.",
    "Confidence is earned by evidence.",
    "Think long term, act today.",
    "Persistence outlasts resistance.",
    "Don't negotiate with procrastination.",
    "Your habits vote for your identity.",
    "Work your plan; plan your work.",
    "Curiosity fuels progress.",
    "Let your results make the noise.",
    "Your energy is your edge—protect it.",
    "Practice until it's boring; perform until it's art.",
    "The obstacle is a syllabus.",
    "Make it obvious; make it easy; make it daily.",
    "Keep going—future you is watching.",
    "Trim the nonessential.",
    "Replace \"someday\" with a timestamp.",
    "Dreams need deadlines.",
    "You can't edit a blank page.",
    "Repeat what works; retire what doesn't.",
    "Standards over moods.",
    "Hungry beats gifted.",
    "Direction + discipline = destiny.",
    "Be the person your goals require.",
    "Ship the v1; iterate the v2.",
    "Don't wait for motivation; create momentum.",
    "The grind is the gift.",
    "Quit the wrong things faster.",
    "Say no to average.",
    "Progress feels like friction.",
    "Record the reps—proof creates belief.",
    "Show your work to sharpen it.",
    "Turn pressure into practice.",
    "Your circle is your accelerator.",
    "Design your environment; it designs you.",
    "Measure what matters.",
    "Be patient with growth, impatient with excuses.",
    "Courage looks like consistency in public.",
    "Lose the narrative, keep the mission.",
    "You don't rise to goals; you fall to systems.",
    "Today's effort is tomorrow's ease.",
    "Cut the rope of \"what if.\"",
    "Replace fear with curiosity.",
    "The best time was then; the next best is now.",
    "Keep promises in private; earn respect in public.",
    "Build stamina for boredom.",
    "Choose progress over popularity.",
    "Make your future self proud, not comfortable.",
    "Focus is a force multiplier.",
    "Grind with grace.",
    "Learn loudly, fail forward.",
    "Storms teach navigation.",
    "Don't let perfect delay possible.",
    "Train the basics until they're beautiful.",
    "Trade hours for outcomes.",
    "Ambition needs accountability.",
    "Aspire, then align.",
    "Every \"no\" narrows the path to \"yes.\"",
    "Be decisive—uncertainty is expensive.",
    "Your edge is earned at the margins.",
    "Say it with results.",
    "Breathe, then begin.",
    "Turn discipline into default.",
    "Make the hard thing the first thing.",
    "Protect your attention like capital.",
    "Build reputation with repetition.",
    "Keep going—someone needs what you're building."
  ];

  const getRandomQuote = () => {
    return inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
  };

  // Set initial quote and rotate every 15 seconds
  useEffect(() => {
    // Set initial quote
    setCurrentQuote(getRandomQuote());

    // Set up interval to rotate quotes every 15 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(getRandomQuote());
    }, 15000);

    // Cleanup interval on component unmount
    return () => clearInterval(quoteInterval);
  }, []);

  // Fetch check chart data
  useEffect(() => {
    if (user?.id) {
      fetchCheckChart();
    }
  }, [user]);

  const fetchCheckChart = async () => {
    try {
      setCheckChartLoading(true);
      const response = await fetch('/api/student/checkchart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-student-id': user.id
        }
      });
      const data = await response.json();
      if (data.success) {
        setCheckChart(data);
      }
    } catch (error) {
      console.error('Error fetching check chart:', error);
    } finally {
      setCheckChartLoading(false);
    }
  };

  const handleBrainliftToggle = async () => {
    const newValue = !isBrainliftCompletedToday;
    console.log(`[Dashboard] Brainlift toggle: ${isBrainliftCompletedToday} -> ${newValue}`);
    
    // Update UI immediately
    setProfile(prev => ({
      ...prev,
      brainliftCompleted: newValue,
      lastBrainliftDate: newValue ? today : null
    }));
    
    // Save to backend (server-side persistence)
    try {
      const response = await fetch('/api/goals/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          studentId: user.id,
          goalType: 'brainlift',
          completed: newValue
        })
      });

      const data = await response.json();
      
      console.log(`[Dashboard] Brainlift API response:`, data);
      
      if (data.success) {
        showNotification(data.message || 'Brainlift status updated successfully!', 'success');
        
        // Update profile with server-confirmed values
        setProfile(prev => ({
          ...prev,
          brainliftCompleted: data.completed,
          lastBrainliftDate: data.completed ? today : null,
          totalPoints: data.totalPoints || prev.totalPoints
        }));
        
        // Refresh profile to ensure consistency
        setTimeout(() => {
          fetchProfile(user.id, true);
        }, 500);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving Brainlift status:', error);
      
      
      showNotification('Error updating Brainlift status', 'error');
      
      // Revert UI change on error
      setProfile(prev => ({
        ...prev,
        brainliftCompleted: !newValue,
        lastBrainliftDate: !newValue ? today : null
      }));
    }
  };

  const handleDailyGoalToggle = async () => {
    const newValue = !isDailyGoalCompletedToday;
    console.log(`[Dashboard] Daily Goal toggle: ${isDailyGoalCompletedToday} -> ${newValue}`);
    
    // Update UI immediately
    setProfile(prev => ({
      ...prev,
      dailyGoalCompleted: newValue,
      lastDailyGoalDate: newValue ? today : null
    }));
    
    // Save to backend (server-side persistence)
    try {
      const response = await fetch('/api/goals/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          studentId: user.id,
          goalType: 'dailyGoal',
          completed: newValue,
          goalText: profile.dailyGoal
        })
      });

      const data = await response.json();
      
      console.log(`[Dashboard] Daily Goal API response:`, data);
      
      if (data.success) {
        showNotification(data.message || 'Daily Goal status updated successfully!', 'success');
        
        // Update profile with server-confirmed values
        setProfile(prev => ({
          ...prev,
          dailyGoalCompleted: data.completed,
          lastDailyGoalDate: data.completed ? today : null,
          totalPoints: data.totalPoints || prev.totalPoints
        }));
        
        // Refresh profile to ensure consistency
        setTimeout(() => {
          fetchProfile(user.id, true);
        }, 500);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving Daily Goal status:', error);
      
      
      showNotification('Error updating Daily Goal status', 'error');
      
      // Revert UI change on error
      setProfile(prev => ({
        ...prev,
        dailyGoalCompleted: !newValue,
        lastDailyGoalDate: !newValue ? today : null
      }));
    }
  };

  return (
    <div className="overview-tab">
      <div className="welcome-section">
        <h2>Welcome back, {user?.firstName}!</h2>
        <p>{currentQuote}</p>
      </div>

      <div className="overview-grid">
        {/* Project Oneliner Card */}
        <div className="overview-card project-card">
          <div className="card-header">
            <h3>Project Oneliner</h3>
          </div>
          <div className="card-content">
            {profile.projectOneliner ? (
              <p className="project-text">{profile.projectOneliner}</p>
            ) : (
              <p className="empty-text">No project description yet. Add one in the Goals tab!</p>
            )}
          </div>
        </div>

        {/* Daily Goal Card with Checkoff */}
        <div className={`overview-card daily-goal-card ${isDailyGoalCompletedToday ? 'completed' : ''}`}>
          <div className="card-header">
            <h3>Today's Goal</h3>
          </div>
          <div className="card-content">
            {profile.dailyGoal ? (
              <>
                <p className="goal-text">{profile.dailyGoal}</p>
                <button 
                  className={`goal-checkbox ${isDailyGoalCompletedToday ? 'checked' : ''}`}
                  onClick={handleDailyGoalToggle}
                >
                  <span className="checkbox-icon">{isDailyGoalCompletedToday ? '✓' : ''}</span>
                  <span className="checkbox-label">
                    {isDailyGoalCompletedToday ? 'Goal Completed!' : 'Mark as Complete'}
                  </span>
                </button>
              </>
            ) : (
              <p className="empty-text">No daily goal set. Set one in the Goals tab!</p>
            )}
          </div>
        </div>

        {/* Session Goal Card */}
        <div className="overview-card session-goal-card">
          <div className="card-header">
            <h3>Session Goal</h3>
          </div>
          <div className="card-content">
            {profile.sessionGoal ? (
              <p className="goal-text">{profile.sessionGoal}</p>
            ) : (
              <p className="empty-text">No session goal set. Set one in the Goals tab!</p>
            )}
          </div>
        </div>

        {/* Brainlift Card */}
        <div className={`overview-card brainlift-card ${isBrainliftCompletedToday ? 'completed' : ''}`}>
          <div className="card-header">
            <h3>Daily Brainlift</h3>
          </div>
          <div className="card-content">
            <button 
              className={`brainlift-checkbox ${isBrainliftCompletedToday ? 'checked' : ''}`}
              onClick={handleBrainliftToggle}
            >
              <span className="checkbox-icon">{isBrainliftCompletedToday ? '✓' : ''}</span>
              <span className="checkbox-label">
                {isBrainliftCompletedToday ? 'Completed Today!' : 'Mark as Complete'}
              </span>
            </button>
            {isBrainliftCompletedToday && (
              <p className="completion-message">Great job! Keep up the daily practice!</p>
            )}
          </div>
        </div>
      </div>

      {/* Session Goal Section */}
      {profile.sessionGoal && (
        <div className="session-goal-section">
          <h3>Session Goal</h3>
          <p>{profile.sessionGoal}</p>
        </div>
      )}

      {/* Check Chart Section */}
      {!checkChartLoading && checkChart && checkChart.chart && checkChart.chart.stages.length > 0 && (
        <div className="check-chart-section">
          <div className="section-header">
            <h3>Check Chart Progress</h3>
            <div className="progress-summary">
              <span className="progress-stat">
                {checkChart.summary.totalTasks} tasks completed
              </span>
              <span className="progress-stat">
                {checkChart.summary.totalPointsEarned} / {checkChart.summary.totalPossiblePoints} points
              </span>
              <span className="progress-stat">
                {checkChart.summary.completionPercentage}% complete
              </span>
            </div>
          </div>
          
          <div className="chart-stages">
            {checkChart.chart.stages.map((stage, stageIndex) => (
              <div key={stage.id} className="stage-section">
                <h4 className="stage-title">{stage.name}</h4>
                <div className="topics-list">
                  {stage.topics.map((topic, topicIndex) => (
                    <div key={topic.id} className="topic-section">
                      <h5 className="topic-title">{topic.name}</h5>
                      <div className="tasks-list">
                        {topic.tasks.map((task, taskIndex) => (
                          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <div className="task-content">
                              <span className="task-check">
                                {task.completed ? '✓' : '○'}
                              </span>
                              <span className="task-name">{task.name}</span>
                              <span className="task-points">{task.points} pts</span>
                              {task.instructions && (
                                <a 
                                  href={task.instructions} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="task-instructions-button"
                                  title="Click here for instructions"
                                >
                                  Instructions
                                </a>
                              )}
                            </div>
                            {task.completed && task.completedInfo && (
                              <div className="task-completed-info">
                                Completed on {new Date(task.completedInfo.completedDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .overview-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .welcome-section {
          margin-bottom: 40px;
          text-align: center;
        }

        .welcome-section h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 2rem;
          font-weight: 300;
        }

        .welcome-section p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .overview-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .overview-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }

        .project-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .project-card .card-header h3,
        .project-card .project-text,
        .project-card .empty-text {
          color: white;
        }

        .daily-goal-card {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .daily-goal-card.completed {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        }

        .daily-goal-card .card-header h3,
        .daily-goal-card .goal-text,
        .daily-goal-card .empty-text {
          color: white;
        }

        .goal-checkbox {
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid white;
          border-radius: 12px;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          justify-content: center;
          margin-top: 16px;
        }

        .goal-checkbox:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.02);
        }

        .goal-checkbox.checked {
          background: rgba(255, 255, 255, 0.5);
        }

        .session-goal-card {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .session-goal-card .card-header h3,
        .session-goal-card .goal-text,
        .session-goal-card .empty-text {
          color: white;
        }

        .brainlift-card {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        }

        .brainlift-card.completed {
          background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
        }

        .brainlift-card .card-header h3 {
          color: white;
        }

        .card-header {
          margin-bottom: 16px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-content {
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .project-text,
        .goal-text {
          font-size: 1.1rem;
          line-height: 1.5;
          margin: 0;
          font-weight: 400;
        }

        .empty-text {
          font-size: 0.95rem;
          opacity: 0.9;
          font-style: italic;
          margin: 0;
        }

        .brainlift-checkbox {
          background: rgba(255, 255, 255, 0.3);
          border: 2px solid white;
          border-radius: 12px;
          padding: 16px 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          justify-content: center;
        }

        .brainlift-checkbox:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.02);
        }

        .brainlift-checkbox.checked {
          background: rgba(255, 255, 255, 0.5);
        }

        .checkbox-icon {
          width: 24px;
          height: 24px;
          border: 2px solid white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          background: rgba(255, 255, 255, 0.2);
        }

        .checkbox-label {
          font-size: 1.1rem;
          font-weight: 500;
          color: white;
        }

        .completion-message {
          margin-top: 16px;
          text-align: center;
          font-size: 0.95rem;
          color: white;
          font-weight: 500;
        }

        .session-goal-section {
          margin-top: 40px;
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #f0f0f0;
          text-align: center;
        }

        .session-goal-section h3 {
          margin: 0 0 16px 0;
          color: #1a1a1a;
          font-size: 1.3rem;
          font-weight: 400;
        }

        .session-goal-section p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
          line-height: 1.5;
        }

        .check-chart-section {
          margin-top: 40px;
          background: white;
          border-radius: 16px;
          padding: 32px;
          border: 1px solid #f0f0f0;
        }

        .check-chart-section .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .check-chart-section h3 {
          margin: 0;
          color: #1a1a1a;
          font-size: 1.4rem;
          font-weight: 500;
        }

        .progress-summary {
          display: flex;
          gap: 20px;
        }

        .progress-stat {
          padding: 8px 16px;
          background: #f5f5f5;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .chart-stages {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .stage-section {
          padding: 20px;
          background: #fafafa;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .stage-title {
          margin: 0 0 16px 0;
          color: #1a1a1a;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .topics-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .topic-section {
          padding: 16px;
          background: white;
          border-radius: 8px;
        }

        .topic-title {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 1rem;
          font-weight: 500;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-item {
          padding: 12px;
          background: #f9f9f9;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
          transition: all 0.2s ease;
        }

        .task-item:hover {
          background: #f5f5f5;
          transform: translateX(2px);
        }

        .task-item.completed {
          background: #e8f5e9;
          border-color: #4CAF50;
        }

        .task-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          width: 100%;
        }

        .task-check {
          font-size: 1.2rem;
          color: #999;
          min-width: 20px;
        }

        .task-item.completed .task-check {
          color: #4CAF50;
        }

        .task-name {
          flex: 1;
          color: #333;
          font-weight: 400;
        }

        .task-item.completed .task-name {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .task-instructions-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 8px;
          padding: 4px 10px;
          background: #000000;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
          transition: all 0.2s ease;
          border: 1px solid #000000;
        }

        .task-instructions-button:hover {
          background: #333333;
          border-color: #333333;
        }

        .task-item.completed .task-instructions-button {
          background: #2a2a2a;
          opacity: 0.8;
        }

        .task-item.completed .task-instructions-button:hover {
          background: #444444;
          opacity: 1;
        }

        .task-points {
          background: #e0e0e0;
          color: #666;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .task-item.completed .task-points {
          background: #4CAF50;
          color: white;
        }

        .task-completed-info {
          margin-top: 8px;
          padding-left: 32px;
          color: #999;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .overview-tab {
            padding: 20px;
          }
          
          .overview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Personal Goals Tab Component
function PersonalGoalsTab({ profile, setProfile, onSave, saving }) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationResults, setValidationResults] = useState({});
  const [validating, setValidating] = useState({});
  const [showOverride, setShowOverride] = useState({});
  const [overridePassword, setOverridePassword] = useState({});

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const handleChange = (field, value) => {
    setLocalProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    
    // Clear validation results when user changes the goal
    if (field === 'dailyGoal' || field === 'sessionGoal') {
      setValidationResults(prev => ({
        ...prev,
        [field]: null
      }));
      setShowOverride(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const validateGoal = async (goalType) => {
    const goalText = localProfile[goalType];
    if (!goalText || goalText.trim().length < 10) {
      return;
    }

    setValidating(prev => ({ ...prev, [goalType]: true }));
    
    try {
      const response = await fetch('/api/goals/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalText: goalText.trim(),
          goalType: goalType,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setValidationResults(prev => ({
          ...prev,
          [goalType]: result
        }));
      } else {
        console.error('Validation failed:', result.message);
      }
    } catch (error) {
      console.error('Error validating goal:', error);
    } finally {
      setValidating(prev => ({ ...prev, [goalType]: false }));
    }
  };

  const handleOverride = async (goalType) => {
    const password = overridePassword[goalType];
    if (!password) return;

    setValidating(prev => ({ ...prev, [goalType]: true }));
    
    try {
      const response = await fetch('/api/goals/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalText: localProfile[goalType],
          goalType: goalType,
          overridePassword: password,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.overridden) {
        setValidationResults(prev => ({
          ...prev,
          [goalType]: result
        }));
        setShowOverride(prev => ({
          ...prev,
          [goalType]: false
        }));
        setOverridePassword(prev => ({
          ...prev,
          [goalType]: ''
        }));
      } else {
        alert(result.message || 'Invalid override password');
      }
    } catch (error) {
      console.error('Error with override:', error);
      alert('Error processing override');
    } finally {
      setValidating(prev => ({ ...prev, [goalType]: false }));
    }
  };

  const canSave = () => {
    // Check if daily goal and session goal are validated or overridden
    const dailyGoalValid = !localProfile.dailyGoal || 
                          validationResults.dailyGoal?.validated || 
                          validationResults.dailyGoal?.overridden;
    const sessionGoalValid = !localProfile.sessionGoal || 
                            validationResults.sessionGoal?.validated || 
                            validationResults.sessionGoal?.overridden;
    
    return hasChanges && dailyGoalValid && sessionGoalValid && !saving;
  };

  const handleSave = async () => {
    if (!canSave()) return;
    
    setProfile(localProfile);
    await onSave();
    setHasChanges(false);
  };

  return (
    <div className="personal-goals-tab">
      <div className="tab-header">
        <h2>My Personal Goals</h2>
        <p>Set your goals and track your progress</p>
      </div>

      <div className="goals-container">
        {/* Project Oneliner */}
        <div className="goal-section">
          <div className="section-header">
            <h3>Project Oneliner</h3>
            <p>Describe your main project in one compelling sentence</p>
          </div>
          <textarea
            className="goal-input"
            placeholder="e.g., Building an AI-powered app that helps students learn faster..."
            value={localProfile.projectOneliner || ''}
            onChange={(e) => handleChange('projectOneliner', e.target.value)}
            rows="2"
          />
        </div>

        {/* Daily Goal */}
        <div className="goal-section">
          <div className="section-header">
            <h3>Daily Goal ⚡</h3>
            <p>What do you want to accomplish today? (Should be achievable in 3 hours)</p>
          </div>
          <textarea
            className="goal-input"
            placeholder="e.g., Complete the authentication system for my app..."
            value={localProfile.dailyGoal || ''}
            onChange={(e) => handleChange('dailyGoal', e.target.value)}
            rows="3"
          />
          
          {localProfile.dailyGoal && localProfile.dailyGoal.trim().length >= 10 && (
            <div className="goal-validation">
              <button 
                className="validate-btn"
                onClick={() => validateGoal('dailyGoal')}
                disabled={validating.dailyGoal || validationResults.dailyGoal?.validated || validationResults.dailyGoal?.overridden}
              >
                {validating.dailyGoal ? '🤔 AI is thinking...' : '🧠 Validate with AI'}
              </button>
              
              {validationResults.dailyGoal && (
                <div className={`validation-result ${validationResults.dailyGoal.validated || validationResults.dailyGoal.overridden ? 'valid' : 'invalid'}`}>
                  <div className="validation-header">
                    <span className={`validation-status ${validationResults.dailyGoal.validated || validationResults.dailyGoal.overridden ? 'success' : 'warning'}`}>
                      {validationResults.dailyGoal.overridden ? '✅ Overridden' : 
                       validationResults.dailyGoal.validated ? '✅ Goal Approved' : '⚠️ Needs Improvement'}
                    </span>
                    {validationResults.dailyGoal.score && (
                      <span className="validation-score">Score: {validationResults.dailyGoal.score}/10</span>
                    )}
                  </div>
                  <p className="validation-feedback">{validationResults.dailyGoal.feedback}</p>
                  
                  {validationResults.dailyGoal.suggestions && validationResults.dailyGoal.suggestions.length > 0 && (
                    <div className="validation-suggestions">
                      <strong>Suggestions:</strong>
                      <ul>
                        {validationResults.dailyGoal.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {!validationResults.dailyGoal.validated && !validationResults.dailyGoal.overridden && (
                    <div className="override-section">
                      <button 
                        className="override-btn"
                        onClick={() => setShowOverride(prev => ({ ...prev, dailyGoal: !prev.dailyGoal }))}
                      >
                        {showOverride.dailyGoal ? 'Cancel Override' : '🚀 Override AI (I know my goal is ambitious)'}
                      </button>
                      
                      {showOverride.dailyGoal && (
                        <div className="override-form">
                          <input
                            type="password"
                            placeholder="Enter override password..."
                            value={overridePassword.dailyGoal || ''}
                            onChange={(e) => setOverridePassword(prev => ({ ...prev, dailyGoal: e.target.value }))}
                            className="override-password"
                          />
                          <button 
                            className="confirm-override-btn"
                            onClick={() => handleOverride('dailyGoal')}
                            disabled={!overridePassword.dailyGoal || validating.dailyGoal}
                          >
                            {validating.dailyGoal ? 'Processing...' : 'Confirm Override'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Session Goal */}
        <div className="goal-section">
          <div className="section-header">
            <h3>Session Goal 🎯</h3>
            <p>Your goal for the current session (Should be achievable in 8 weeks)</p>
          </div>
          <textarea
            className="goal-input"
            placeholder="e.g., Launch MVP by end of the month..."
            value={localProfile.sessionGoal || ''}
            onChange={(e) => handleChange('sessionGoal', e.target.value)}
            rows="3"
          />
          
          {localProfile.sessionGoal && localProfile.sessionGoal.trim().length >= 10 && (
            <div className="goal-validation">
              <button 
                className="validate-btn"
                onClick={() => validateGoal('sessionGoal')}
                disabled={validating.sessionGoal || validationResults.sessionGoal?.validated || validationResults.sessionGoal?.overridden}
              >
                {validating.sessionGoal ? '🤔 AI is thinking...' : '🧠 Validate with AI'}
              </button>
              
              {validationResults.sessionGoal && (
                <div className={`validation-result ${validationResults.sessionGoal.validated || validationResults.sessionGoal.overridden ? 'valid' : 'invalid'}`}>
                  <div className="validation-header">
                    <span className={`validation-status ${validationResults.sessionGoal.validated || validationResults.sessionGoal.overridden ? 'success' : 'warning'}`}>
                      {validationResults.sessionGoal.overridden ? '✅ Overridden' : 
                       validationResults.sessionGoal.validated ? '✅ Goal Approved' : '⚠️ Needs Improvement'}
                    </span>
                    {validationResults.sessionGoal.score && (
                      <span className="validation-score">Score: {validationResults.sessionGoal.score}/10</span>
                    )}
                  </div>
                  <p className="validation-feedback">{validationResults.sessionGoal.feedback}</p>
                  
                  {validationResults.sessionGoal.suggestions && validationResults.sessionGoal.suggestions.length > 0 && (
                    <div className="validation-suggestions">
                      <strong>Suggestions:</strong>
                      <ul>
                        {validationResults.sessionGoal.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {!validationResults.sessionGoal.validated && !validationResults.sessionGoal.overridden && (
                    <div className="override-section">
                      <button 
                        className="override-btn"
                        onClick={() => setShowOverride(prev => ({ ...prev, sessionGoal: !prev.sessionGoal }))}
                      >
                        {showOverride.sessionGoal ? 'Cancel Override' : '🚀 Override AI (I know my goal is ambitious)'}
                      </button>
                      
                      {showOverride.sessionGoal && (
                        <div className="override-form">
                          <input
                            type="password"
                            placeholder="Enter override password..."
                            value={overridePassword.sessionGoal || ''}
                            onChange={(e) => setOverridePassword(prev => ({ ...prev, sessionGoal: e.target.value }))}
                            className="override-password"
                          />
                          <button 
                            className="confirm-override-btn"
                            onClick={() => handleOverride('sessionGoal')}
                            disabled={!overridePassword.sessionGoal || validating.sessionGoal}
                          >
                            {validating.sessionGoal ? 'Processing...' : 'Confirm Override'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="save-section">
          {hasChanges && (localProfile.dailyGoal || localProfile.sessionGoal) && 
           !(validationResults.dailyGoal?.validated || validationResults.dailyGoal?.overridden || !localProfile.dailyGoal) && 
           !(validationResults.sessionGoal?.validated || validationResults.sessionGoal?.overridden || !localProfile.sessionGoal) && (
            <p className="validation-warning">
              ⚠️ Please validate your goals with AI before saving, or use the override option if you're confident they're ambitious enough.
            </p>
          )}
          
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!canSave()}
          >
            {saving ? 'Saving...' : canSave() ? 'Save Changes' : hasChanges ? 'Validate Goals to Save' : 'Saved'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .personal-goals-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .tab-header {
          margin-bottom: 40px;
          text-align: center;
        }

        .tab-header h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
          font-weight: 300;
        }

        .tab-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .goals-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .goal-section {
          margin-bottom: 36px;
          padding: 24px;
          background: white;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
        }

        .section-header {
          margin-bottom: 16px;
        }

        .section-header h3 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.2rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-header p {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
        }

        .goal-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s ease;
          background: white;
          box-sizing: border-box;
        }

        .goal-input:focus {
          outline: none;
          border-color: #1a1a1a;
          box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.05);
        }

        .goal-input::placeholder {
          color: #999;
        }

        .save-btn {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          margin-top: 24px;
        }

        .save-btn:hover:not(:disabled) {
          background: #333;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        /* Goal Validation Styles */
        .goal-validation {
          margin-top: 16px;
        }

        .validate-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 12px;
        }

        .validate-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .validate-btn:disabled {
          background: #ddd;
          cursor: not-allowed;
          transform: none;
        }

        .validation-result {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-top: 12px;
        }

        .validation-result.valid {
          background: #d4edda;
          border-color: #c3e6cb;
        }

        .validation-result.invalid {
          background: #fff3cd;
          border-color: #ffeaa7;
        }

        .validation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .validation-status {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .validation-status.success {
          color: #155724;
        }

        .validation-status.warning {
          color: #856404;
        }

        .validation-score {
          background: #6c757d;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .validation-feedback {
          margin: 8px 0;
          color: #495057;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .validation-suggestions {
          margin-top: 12px;
        }

        .validation-suggestions strong {
          color: #495057;
          font-size: 0.9rem;
        }

        .validation-suggestions ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .validation-suggestions li {
          margin-bottom: 4px;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .override-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #dee2e6;
        }

        .override-btn {
          background: #fd7e14;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .override-btn:hover {
          background: #e76f00;
          transform: translateY(-1px);
        }

        .override-form {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .override-password {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .override-password:focus {
          outline: none;
          border-color: #fd7e14;
          box-shadow: 0 0 0 2px rgba(253, 126, 20, 0.1);
        }

        .confirm-override-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .confirm-override-btn:hover:not(:disabled) {
          background: #218838;
        }

        .confirm-override-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .save-section {
          margin-top: 24px;
        }

        .validation-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 0.9rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .personal-goals-tab {
            padding: 20px;
          }
          
          .goal-section {
            padding: 20px 16px;
          }

          .override-form {
            flex-direction: column;
            align-items: stretch;
          }

          .validation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

// Audience Building Tab (renamed from ProfileTab)
function AudienceTab({ profile, onPlatformChange, onGoalChange, onSave, saving }) {
  return (
    <div className="audience-tab">
      <div className="tab-header">
        <h2>Audience Building</h2>
        <p>Set your social media goals and connect your accounts</p>
      </div>

      <div className="audience-sections">
        {/* Social Media Profiles Section */}
        <div className="section-card">
          <h3>Social Media Profiles</h3>
          <div className="form-section">
            <div className="platform-input">
              <label>X (Twitter) Handle</label>
              <input
                type="text"
                placeholder="@username"
                value={profile.platforms?.x || ''}
                onChange={(e) => onPlatformChange('x', e.target.value)}
              />
            </div>

            <div className="platform-input">
              <label>YouTube Channel</label>
              <input
                type="text"
                placeholder="@channelname"
                value={profile.platforms?.youtube || ''}
                onChange={(e) => onPlatformChange('youtube', e.target.value)}
              />
            </div>

            <div className="platform-input">
              <label>TikTok Username</label>
              <input
                type="text"
                placeholder="@username"
                value={profile.platforms?.tiktok || ''}
                onChange={(e) => onPlatformChange('tiktok', e.target.value)}
              />
            </div>

            <div className="platform-input">
              <label>Instagram Handle</label>
              <input
                type="text"
                placeholder="@username"
                value={profile.platforms?.instagram || ''}
                onChange={(e) => onPlatformChange('instagram', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Daily Posting Goals Section */}
        <div className="section-card">
          <h3>Daily Posting Goals</h3>
          <div className="form-section">
            <div className="goal-input">
              <label>X (Twitter) - Posts per day</label>
              <input
                type="number"
                min="0"
                max="50"
                placeholder="0"
                value={profile.goals?.x || 0}
                onChange={(e) => onGoalChange('x', e.target.value)}
              />
            </div>

            <div className="goal-input">
              <label>YouTube - Videos per day</label>
              <input
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={profile.goals?.youtube || 0}
                onChange={(e) => onGoalChange('youtube', e.target.value)}
              />
            </div>

            <div className="goal-input">
              <label>TikTok - Videos per day</label>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="0"
                value={profile.goals?.tiktok || 0}
                onChange={(e) => onGoalChange('tiktok', e.target.value)}
              />
            </div>

            <div className="goal-input">
              <label>Instagram - Posts per day</label>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="0"
                value={profile.goals?.instagram || 0}
                onChange={(e) => onGoalChange('instagram', e.target.value)}
              />
            </div>
          </div>
        </div>

        <button 
          className="save-btn" 
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <style jsx>{`
        .audience-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .tab-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .tab-header h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
          font-weight: 300;
        }

        .tab-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .audience-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .section-card {
          background: white;
          border-radius: 12px;
          padding: 28px;
          border: 1px solid #f0f0f0;
        }

        .section-card h3 {
          margin: 0 0 24px 0;
          color: #1a1a1a;
          font-size: 1.3rem;
          font-weight: 400;
        }

        .form-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .platform-input,
        .goal-input {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .platform-input label,
        .goal-input label {
          color: #1a1a1a;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .platform-input input,
        .goal-input input {
          padding: 12px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .platform-input input:focus,
        .goal-input input:focus {
          outline: none;
          border-color: #1a1a1a;
          box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.05);
        }

        .save-btn {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          margin-top: 16px;
        }

        .save-btn:hover:not(:disabled) {
          background: #333;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .audience-tab {
            padding: 20px;
          }
          
          .form-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}


// History Tab Component
function HistoryTab({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user, currentMonth]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      // Fetch 90 days to ensure we have enough data for the calendar
      const response = await fetch(`/api/goals/history/${user.id}?days=90`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get task completion status for a specific day
  const getTaskCompletionStatus = (entry) => {
    if (!entry) return { brainlift: false, dailyGoal: false, contentCreation: false };
    
    // Check if content creation was done (any audience goal > 0 means content was created)
    const hasContentCreation = entry.audienceGoals && 
      Object.values(entry.audienceGoals).some(goal => goal > 0);
    
    return {
      brainlift: entry.brainliftCompleted || false,
      dailyGoal: entry.dailyGoalCompleted || false,
      contentCreation: hasContentCreation || false
    };
  };

  // Get color indicators for completed tasks
  const getTaskIndicators = (entry) => {
    const tasks = getTaskCompletionStatus(entry);
    const indicators = [];
    
    if (tasks.brainlift) indicators.push('brainlift');
    if (tasks.dailyGoal) indicators.push('daily-goal');
    if (tasks.contentCreation) indicators.push('content');
    
    return indicators;
  };

  // Calendar helper functions

  const getHistoryForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return history.find(entry => entry.date === dateStr);
  };

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const renderCalendar = (calendarType = 'brainlift') => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date().toISOString().split('T')[0];
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    // Sunday = 0, Monday = 1, etc. We want Monday = 0, so adjust
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div key={`prev-${day}`} className="calendar__date calendar__date--grey">
          <span>{day}</span>
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayHistory = getHistoryForDate(date);
      const isToday = dateStr === today;
      const isSelected = selectedDate === dateStr;
      
      let isCompleted = false;
      let hasGoalSet = true;
      
      // Determine completion based on calendar type
      if (dayHistory) {
        switch (calendarType) {
          case 'brainlift':
            isCompleted = dayHistory.brainliftCompleted === true;
            hasGoalSet = true; // Brainlift is always available
            break;
          case 'dailyGoal':
            isCompleted = dayHistory.dailyGoalCompleted === true;
            hasGoalSet = dayHistory.dailyGoal && dayHistory.dailyGoal.trim() !== ''; // Only show red/green if goal is actually set
            break;
          case 'audienceBuilding':
            isCompleted = dayHistory.contentCreated === true;
            hasGoalSet = true; // Audience building is always trackable
            break;
        }
      }
      
      let dayClasses = 'calendar__date';
      
      // Apply completion styling
      if (isCompleted) {
        dayClasses += ' calendar__date--completed'; // Green for completed
      } else if (hasGoalSet && dayHistory) {
        dayClasses += ' calendar__date--not-completed'; // Red for not completed but goal was set
      }
      
      // Apply today styling
      if (isToday) {
        dayClasses += ' calendar__date--today';
      }
      
      // Apply selected styling
      if (isSelected) {
        dayClasses += ' calendar__date--active';
      }
      
      days.push(
        <div 
          key={`current-${day}`} 
          className={dayClasses}
          onClick={() => setSelectedDate(dateStr)}
        >
          <span>{day}</span>
        </div>
      );
    }
    
    // Fill remaining cells with next month days
    const totalCellsUsed = adjustedFirstDay + daysInMonth;
    const totalCellsNeeded = Math.ceil(totalCellsUsed / 7) * 7;
    const remainingCells = totalCellsNeeded - totalCellsUsed;
    
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="calendar__date calendar__date--grey">
          <span>{day}</span>
        </div>
      );
    }
    
    return days;
  };

  const selectedEntry = selectedDate ? history.find(entry => entry.date === selectedDate) : null;
  const selectedTasks = selectedEntry ? getTaskCompletionStatus(selectedEntry) : null;

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-tab">
      <div className="tab-header">
        <h2>Goal History Calendar</h2>
        <p>Track your daily progress on Brainlift, Daily Goals, and Content Creation</p>
      </div>

      {/* Multiple Calendars Grid */}
      <div className="calendars-container">
        <div className="calendars-grid">
          {/* Brainlift Calendar */}
          <div className="calendar-section">
            <h3 className="calendar-title">🧠 Brainlift</h3>
            <div className="calendar calendar-brainlift">
              <div className="calendar__opts">
                <select 
                  value={currentMonth.getMonth()} 
                  onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
                >
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                
                <select 
                  value={currentMonth.getFullYear()} 
                  onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="calendar__body">
                <div className="calendar__days">
                  <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
                </div>
                <div className="calendar__dates">
                  {renderCalendar('brainlift')}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goals Calendar */}
          <div className="calendar-section">
            <h3 className="calendar-title">📅 Daily Goals</h3>
            <div className="calendar calendar-daily">
              <div className="calendar__opts">
                <select 
                  value={currentMonth.getMonth()} 
                  onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
                >
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                
                <select 
                  value={currentMonth.getFullYear()} 
                  onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="calendar__body">
                <div className="calendar__days">
                  <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
                </div>
                <div className="calendar__dates">
                  {renderCalendar('dailyGoal')}
                </div>
              </div>
            </div>
          </div>

          {/* Audience Building Calendar */}
          <div className="calendar-section">
            <h3 className="calendar-title">📈 Audience Building</h3>
            <div className="calendar calendar-audience">
              <div className="calendar__opts">
                <select 
                  value={currentMonth.getMonth()} 
                  onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
                >
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                
                <select 
                  value={currentMonth.getFullYear()} 
                  onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="calendar__body">
                <div className="calendar__days">
                  <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
                </div>
                <div className="calendar__dates">
                  {renderCalendar('audienceBuilding')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="calendar-controls">
          <button 
            className="calendar__button calendar__button--grey"
            onClick={() => {
              const prevMonth = new Date(currentMonth);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setCurrentMonth(prevMonth);
            }}
          >
            ← Previous Month
          </button>
          <button 
            className="calendar__button calendar__button--primary"
            onClick={() => {
              setCurrentMonth(new Date());
            }}
          >
            Today
          </button>
          <button 
            className="calendar__button calendar__button--grey"
            onClick={() => {
              const nextMonth = new Date(currentMonth);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setCurrentMonth(nextMonth);
            }}
          >
            Next Month →
          </button>
        </div>
      </div>

      {selectedEntry && (
        <div className="selected-day-details">
          <h3>Details for {new Date(selectedEntry.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}</h3>
          
          <div className="details-content">
            <div className="task-completion-grid">
              <div className={`task-card ${selectedTasks.brainlift ? 'completed' : 'incomplete'}`}>
                <div className="task-header">
                  <span className="task-icon">🧠</span>
                  <span className="task-name">Brainlift</span>
                </div>
                <div className="task-status">
                  {selectedTasks.brainlift ? (
                    <><span className="status-icon">✓</span> Completed</>
                  ) : (
                    <><span className="status-icon">✗</span> Not completed</>
                  )}
                </div>
              </div>

              <div className={`task-card ${selectedTasks.dailyGoal ? 'completed' : 'incomplete'}`}>
                <div className="task-header">
                  <span className="task-icon">🎯</span>
                  <span className="task-name">Daily Goal</span>
                </div>
                <div className="task-status">
                  {selectedTasks.dailyGoal ? (
                    <><span className="status-icon">✓</span> Completed</>
                  ) : (
                    <><span className="status-icon">✗</span> Not completed</>
                  )}
                </div>
                {selectedEntry.dailyGoal && (
                  <div className="task-detail">
                    {selectedEntry.dailyGoal}
                  </div>
                )}
              </div>

              <div className={`task-card ${selectedTasks.contentCreation ? 'completed' : 'incomplete'}`}>
                <div className="task-header">
                  <span className="task-icon">📱</span>
                  <span className="task-name">Content Creation</span>
                </div>
                <div className="task-status">
                  {selectedTasks.contentCreation ? (
                    <><span className="status-icon">✓</span> Created</>
                  ) : (
                    <><span className="status-icon">✗</span> Not created</>
                  )}
                </div>
                {selectedEntry.audienceGoals && Object.keys(selectedEntry.audienceGoals).some(k => selectedEntry.audienceGoals[k] > 0) && (
                  <div className="task-detail">
                    <div className="platform-list">
                      {Object.entries(selectedEntry.audienceGoals).map(([platform, goal]) => (
                        goal > 0 && (
                          <span key={platform} className="platform-tag">
                            {platform}: {goal}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedEntry.projectOneliner && (
              <div className="additional-info">
                <h4>Project</h4>
                <p>{selectedEntry.projectOneliner}</p>
              </div>
            )}
            
            {selectedEntry.sessionGoal && (
              <div className="additional-info">
                <h4>Session Goal</h4>
                <p>{selectedEntry.sessionGoal}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .history-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .tab-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .tab-header h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
          font-weight: 300;
        }

        .tab-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        /* Three Calendars Layout */
        .calendars-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .calendars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .calendar-section {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }
        
        .calendar-title {
          text-align: center;
          margin: 0 0 20px 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        /* Adjust calendars for 3-grid layout */
        .calendars-grid .calendar {
          width: 100%;
          max-width: none;
          margin: 0;
          --side-padding: 16px;
          --border-radius: 24px;
          --accent-br: 12px;
        }
        
        .calendars-grid .calendar__date {
          --height: calc(320px / 6 - var(--side-padding));
        }
        
        .calendar-controls {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
        
        .calendar-controls .calendar__button {
          padding: 12px 24px;
          font-size: 0.95rem;
          font-weight: 600;
        }

        /* Calendar styles are imported from /styles/calendar.css */

        .selected-day-details {
          max-width: 800px;
          margin: 0 auto;
          background: #fafafa;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #f0f0f0;
        }

        .selected-day-details h3 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 1.2rem;
          font-weight: 400;
        }

        .details-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .task-completion-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .task-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          border: 2px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .task-card.completed {
          border-color: #10b981;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
        }

        .task-card.incomplete {
          border-color: #e5e7eb;
          opacity: 0.8;
        }

        .task-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .task-icon {
          font-size: 1.4rem;
        }

        .task-name {
          font-weight: 500;
          color: #1a1a1a;
          font-size: 0.95rem;
        }

        .task-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: #666;
        }

        .task-card.completed .task-status {
          color: #10b981;
          font-weight: 500;
        }

        .task-card.incomplete .task-status {
          color: #9ca3af;
        }

        .status-icon {
          font-weight: 600;
          font-size: 1rem;
        }

        .task-detail {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
          font-size: 0.85rem;
          color: #4b5563;
          line-height: 1.5;
        }

        .platform-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .platform-tag {
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #4b5563;
        }

        .additional-info {
          background: white;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #f0f0f0;
        }

        .additional-info h4 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .additional-info p {
          margin: 0;
          color: #4b5563;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        @media (max-width: 768px) {
          .history-tab {
            padding: 20px;
          }
          
          .calendars-grid {
            grid-template-columns: 1fr;
          }
          
          .calendar-section {
            padding: 16px;
          }
          
          .calendar-title {
            font-size: 1.1rem;
          }
          
          .selected-day-details {
            padding: 16px;
          }
          
          .task-completion-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .calendars-grid {
            gap: 16px;
          }
          
          .calendar-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

// Stats Tab Component
function StatsTab({ stats, profile, user, checkGoals, fetchHistoricalData }) {
  const [viewMode, setViewMode] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [historicalData, setHistoricalData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const platforms = ['x', 'youtube', 'tiktok', 'instagram'];

  useEffect(() => {
    if (viewMode === 'week') {
      loadHistoricalData(7);
    } else if (viewMode === 'month') {
      loadHistoricalData(30);
    } else if (viewMode === 'custom' && selectedDate !== new Date().toISOString().split('T')[0]) {
      checkGoals(user?.id, selectedDate);
    }
  }, [viewMode, selectedDate]);

  const loadHistoricalData = async (days) => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/goals/check/${user.id}?range=${days}`);
      const data = await response.json();
      if (data.success && data.historical) {
        setHistoricalData(data.data);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  const currentStats = viewMode === 'custom' && selectedDate !== new Date().toISOString().split('T')[0] ? 
    stats : stats;
  
  return (
    <div className="stats-tab">
      <div className="tab-header">
        <div className="header-row">
          <div>
            <h2>Performance Tracking</h2>
            <p>Monitor your audience building progress</p>
          </div>
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'today' ? 'active' : ''}`}
              onClick={() => setViewMode('today')}
            >
              Today
            </button>
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Past Week
            </button>
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Past Month
            </button>
            <button 
              className={`view-btn ${viewMode === 'custom' ? 'active' : ''}`}
              onClick={() => setViewMode('custom')}
            >
              Custom Date
            </button>
          </div>
        </div>
        
        {viewMode === 'custom' && (
          <div className="date-selector">
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>
        )}
      </div>

      {viewMode === 'today' || viewMode === 'custom' ? (
        <div>
          <div className="current-date">
            <h3>{viewMode === 'today' ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
          </div>
          <div className="stats-grid">
            {platforms.map(platform => {
              const goal = profile.goals?.[platform] || 0;
              const actual = currentStats?.[platform] || 0;
              const percentage = goal > 0 ? Math.round((actual / goal) * 100) : 0;
              const isComplete = actual >= goal && goal > 0;
              
              return (
                <div key={platform} className={`stat-card ${isComplete ? 'complete' : ''}`}>
                  <div className="platform-name">
                    {platform === 'x' ? 'X (Twitter)' : 
                     platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </div>
                  <div className="stat-numbers">
                    <span className="actual">{actual}</span>
                    <span className="divider">/</span>
                    <span className="goal">{goal}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="percentage">
                    {percentage}% Complete
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="historical-view">
          {loadingHistory ? (
            <div className="loading">Loading historical data...</div>
          ) : historicalData ? (
            <div className="historical-grid">
              {Object.entries(historicalData)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([date, dayData]) => {
                  const totalPercentage = dayData.overall.percentage;
                  const isComplete = totalPercentage >= 100;
                  
                  return (
                    <div key={date} className={`day-card ${isComplete ? 'complete' : ''}`}>
                      <div className="day-header">
                        <div className="day-date">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className={`day-percentage ${isComplete ? 'success' : ''}`}>
                          {totalPercentage}%
                        </div>
                      </div>
                      <div className="day-stats">
                        <div className="day-summary">
                          {dayData.overall.totalActual} / {dayData.overall.totalGoals} posts
                        </div>
                        <div className="platform-mini-stats">
                          {platforms.map(platform => (
                            <span key={platform} className="mini-stat">
                              {platform === 'x' ? 'X' : platform.slice(0, 2).toUpperCase()}: {dayData.stats[platform]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="no-data">No historical data available</div>
          )}
        </div>
      )}

      <div className="info-message">
        <p>Statistics are tracked daily. Social media activity is checked using public data when available.</p>
      </div>

      <style jsx>{`
        .stats-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .tab-header {
          margin-bottom: 32px;
        }

        .tab-header h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
          font-weight: 300;
        }

        .tab-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: #fafafa;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .stat-card.complete {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .platform-name {
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 16px;
          font-size: 1.1rem;
        }

        .stat-numbers {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 16px;
        }

        .actual {
          font-size: 2rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .stat-card.complete .actual {
          color: #16a34a;
        }

        .divider {
          color: #999;
          font-size: 1.5rem;
        }

        .goal {
          font-size: 1.5rem;
          color: #666;
        }

        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: #1a1a1a;
          transition: width 0.3s ease;
        }

        .stat-card.complete .progress-fill {
          background: #16a34a;
        }

        .percentage {
          font-size: 0.9rem;
          color: #666;
        }

        .stat-card.complete .percentage {
          color: #16a34a;
          font-weight: 500;
        }

        .info-message {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          border-left: 3px solid #1a1a1a;
        }

        .info-message p {
          margin: 0;
          color: #666;
          line-height: 1.5;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .view-controls {
          display: flex;
          gap: 8px;
        }

        .view-btn {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .view-btn:hover {
          background: #f5f5f5;
        }

        .view-btn.active {
          background: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }

        .date-selector {
          margin: 24px 0;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
        }

        .current-date {
          margin-bottom: 24px;
        }

        .current-date h3 {
          margin: 0;
          color: #1a1a1a;
          font-size: 1.2rem;
          font-weight: 400;
        }

        .historical-view {
          min-height: 400px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .historical-grid {
          display: grid;
          gap: 16px;
        }

        .day-card {
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .day-card.complete {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .day-date {
          font-weight: 500;
          color: #1a1a1a;
        }

        .day-percentage {
          font-size: 1.2rem;
          font-weight: 600;
          color: #666;
        }

        .day-percentage.success {
          color: #16a34a;
        }

        .day-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .day-summary {
          color: #666;
          font-size: 0.9rem;
        }

        .platform-mini-stats {
          display: flex;
          gap: 12px;
        }

        .mini-stat {
          font-size: 0.8rem;
          color: #999;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #999;
        }
        
        @media (max-width: 768px) {
          .stats-tab {
            padding: 20px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
