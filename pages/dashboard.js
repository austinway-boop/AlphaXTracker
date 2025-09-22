import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ManageStudentsTab = dynamic(() => import('../components/ManageStudentsTab'), {
  ssr: false
});

const SettingsTab = dynamic(() => import('../components/SettingsTab'), {
  ssr: false
});

const CheckChartTab = dynamic(() => import('../components/CheckChartTab'), {
  ssr: false
});

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('audience-building');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'admin') {
      router.push('/login');
      return;
    }

    // Set user info
    setUser({ role: userRole });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
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
            background: #f5f5f5;
          }
          .loading-spinner {
            font-size: 1.2rem;
            color: #667eea;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Head>
        <title>AlphaX Tracker - Admin Dashboard</title>
        <meta name="description" content="AlphaX Tracker Admin Dashboard" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link href="/styles/calendar.css" rel="stylesheet" />
        <link href="/styles/checkchart.css" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <h1>AlphaX Tracker</h1>
          </div>
          <div className="header-actions">
            <span className="user-info">Admin Dashboard</span>
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
            className={`nav-tab ${activeTab === 'audience-building' ? 'active' : ''}`}
            onClick={() => setActiveTab('audience-building')}
          >
            Students
          </button>
          <button 
            className={`nav-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Students
          </button>
          <button 
            className={`nav-tab ${activeTab === 'goal-history' ? 'active' : ''}`}
            onClick={() => setActiveTab('goal-history')}
          >
            Goal History
          </button>
          <button 
            className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'check-chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('check-chart')}
          >
            Check Chart
          </button>
          <button 
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-content">
          {activeTab === 'audience-building' && <AudienceBuildingTab />}
          {activeTab === 'manage' && <ManageStudentsTab />}
          {activeTab === 'goal-history' && <GoalHistoryTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'check-chart' && <CheckChartTab />}
          {activeTab === 'settings' && <SettingsTab />}
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

// Audience Building Tab Component
function AudienceBuildingTab() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentStats, setStudentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    goals: { x: 0, youtube: 0, tiktok: 0, instagram: 0 },
    platforms: { x: '', youtube: '', tiktok: '', instagram: '' },
    dailyGoal: '',
    sessionGoal: '',
    projectOneliner: '',
    groupId: '',
    honors: false
  });
  const [groups, setGroups] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchStudentsAndStats();
  }, []);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = students.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        // Partial match for better usability
        return fullName.includes(query) || 
               student.firstName.toLowerCase().includes(query) || 
               student.lastName.toLowerCase().includes(query);
      });
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchStudentsAndStats = async () => {
    try {
      // Fetch students
      const response = await fetch('/api/students');
      const data = await response.json();
      
      // Also fetch groups for the dropdown
      const groupsResponse = await fetch('/api/admin/groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const groupsData = await groupsResponse.json();
      if (groupsData.success) {
        setGroups(groupsData.groups || []);
      }
      
      if (data.success) {
        // Remove duplicates and sort students by name
        const uniqueStudents = Array.from(
          new Map(data.students.map(s => [`${s.firstName}_${s.lastName}_${s.id}`, s])).values()
        );
        const sortedStudents = uniqueStudents.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setStudents(sortedStudents);
        setFilteredStudents(sortedStudents);
        
        // Fetch stats for each student
        const stats = {};
        for (const student of data.students) {
          try {
            const statsResponse = await fetch(`/api/goals/check/${student.id}`);
            const statsData = await statsResponse.json();
            if (statsData.success) {
              stats[student.id] = statsData;
            }
          } catch (error) {
            console.error(`Error fetching stats for student ${student.id}:`, error);
          }
        }
        setStudentStats(stats);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async (student) => {
    console.log('Edit button clicked for student:', student);
    setEditingStudent(student);
    
    // Fetch current profile
    try {
      const token = localStorage.getItem('authToken');
      console.log('Using token for fetch:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`/api/admin/student/${student.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Profile fetch response:', data);
      
      if (data.success) {
        setEditForm({
          ...data.profile,
          groupId: student.groupId || '',
          honors: student.honors || false
        });
      } else {
        // Initialize with empty form if no profile exists
        setEditForm({
          goals: { x: 0, youtube: 0, tiktok: 0, instagram: 0 },
          platforms: { x: '', youtube: '', tiktok: '', instagram: '' },
          dailyGoal: '',
          sessionGoal: '',
          projectOneliner: '',
          groupId: student.groupId || '',
          honors: student.honors || false
        });
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      // Initialize with empty form on error
      setEditForm({
        goals: { x: 0, youtube: 0, tiktok: 0, instagram: 0 },
        platforms: { x: '', youtube: '', tiktok: '', instagram: '' },
        dailyGoal: '',
        sessionGoal: '',
        projectOneliner: '',
        groupId: '',
        honors: false
      });
    }
  };

  const handleSaveStudent = async () => {
    console.log('Saving student profile:', editingStudent.id, editForm);
    try {
      const token = localStorage.getItem('authToken');
      
      // First update student data (groupId and honors)
      const studentUpdateResponse = await fetch(`/api/admin/update-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: editingStudent.id,
          groupId: editForm.groupId,
          honors: editForm.honors
        })
      });
      
      if (!studentUpdateResponse.ok) {
        const errorData = await studentUpdateResponse.json();
        showNotification(errorData.message || 'Failed to update student settings', 'error');
        return;
      }
      
      // Then update profile data
      const response = await fetch(`/api/admin/student/${editingStudent.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      console.log('Save response:', data);
      
      if (data.success) {
        showNotification('Student profile updated successfully!', 'success');
        setEditingStudent(null);
        // Refresh stats
        fetchStudentsAndStats();
      } else {
        showNotification('Failed to update: ' + (data.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error saving student profile:', error);
      showNotification('Error saving profile: ' + error.message, 'error');
    }
  };

  const [showResetModal, setShowResetModal] = useState(false);
  
  const handleResetSession = async () => {
    setShowResetModal(false);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/reset-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Session goals reset for all students!', 'success');
        // Refresh data
        fetchStudentsAndStats();
      } else {
        showNotification('Failed to reset session: ' + (data.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error resetting session:', error);
      showNotification('Error resetting session: ' + error.message, 'error');
    }
  };

  if (loading) {
    return <div className="tab-loading">Loading student data...</div>;
  }

  return (
    <div className="audience-building-tab">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <div className="tab-header">
        <div className="header-section">
          <div className="header-left">
            <h2>Students</h2>
            <p>{filteredStudents.length} of {students.length} students</p>
          </div>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search students by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            className="reset-session-btn"
            onClick={() => setShowResetModal(true)}
            title="Reset session goals for all students"
          >
            Reset Session
          </button>
        </div>
      </div>

      <div className="students-grid">
        {filteredStudents.map((student) => {
          const stats = studentStats[student.id];
          const hasGoals = stats && stats.overall && stats.overall.totalGoals > 0;
          const progressPercentage = stats?.overall?.percentage || 0;
          
          return (
            <div 
              key={student.id} 
              className={`student-card ${student.honors ? 'distinguished' : ''} ${progressPercentage >= 100 ? 'goal-met' : ''}`}
            >
              <div className="student-info">
                <div className="student-name">
                  {student.firstName} {student.lastName}
                </div>
                {hasGoals ? (
                  <div className="goal-progress">
                    <div className="progress-text">
                      <span className="actual">{stats.overall.totalActual}</span>
                      <span className="divider">/</span>
                      <span className="goal">{stats.overall.totalGoals}</span>
                      <span className="label">daily posts</span>
                    </div>
                    <div className="progress-bar-mini">
                      <div 
                        className="progress-fill-mini"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="platform-breakdown">
                      {stats.stats.x > 0 && <span className="platform-stat">X: {stats.stats.x}</span>}
                      {stats.stats.youtube > 0 && <span className="platform-stat">YT: {stats.stats.youtube}</span>}
                      {stats.stats.tiktok > 0 && <span className="platform-stat">TT: {stats.stats.tiktok}</span>}
                      {stats.stats.instagram > 0 && <span className="platform-stat">IG: {stats.stats.instagram}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="no-goals">
                    No platform info configured
                  </div>
                )}
              </div>
              <div className="student-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEditStudent(student)}
                  title="Edit student profile"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="edit-modal-overlay" onClick={() => setEditingStudent(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Student Profile</h3>
              <button className="close-btn" onClick={() => setEditingStudent(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="student-info-header">
                <h4>{editingStudent.firstName} {editingStudent.lastName}</h4>
                {editForm.honors && <span className="honors-badge">Honors</span>}
              </div>
              
              {/* Student Settings Section */}
              <div className="form-section">
                <h5>Student Settings</h5>
                <div className="settings-grid">
                  <div className="form-group">
                    <label>House/Group</label>
                    <select
                      value={editForm.groupId || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        groupId: e.target.value
                      }))}
                    >
                      <option value="">No House</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={editForm.honors}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          honors: e.target.checked
                        }))}
                      />
                      <span>Honors Student</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Personal Goals Section */}
              <div className="form-section">
                <h5>Personal Goals</h5>
                <div className="personal-goals-grid">
                  <div className="form-group full-width">
                    <label>🚀 Project Oneliner</label>
                    <textarea
                      placeholder="Student's main project description..."
                      value={editForm.projectOneliner || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        projectOneliner: e.target.value
                      }))}
                      rows="2"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>📅 Daily Goal</label>
                    <textarea
                      placeholder="What should they accomplish today..."
                      value={editForm.dailyGoal || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        dailyGoal: e.target.value
                      }))}
                      rows="2"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>🎯 Session Goal</label>
                    <textarea
                      placeholder="Goal for the current session..."
                      value={editForm.sessionGoal || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        sessionGoal: e.target.value
                      }))}
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h5>Audience Building Goals</h5>
                <div className="goals-grid">
                  <div className="form-group">
                    <label>X (Twitter)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={editForm.goals?.x || 0}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        goals: { ...prev.goals, x: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>YouTube</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editForm.goals?.youtube || 0}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        goals: { ...prev.goals, youtube: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>TikTok</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={editForm.goals?.tiktok || 0}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        goals: { ...prev.goals, tiktok: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Instagram</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={editForm.goals?.instagram || 0}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        goals: { ...prev.goals, instagram: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h5>Social Media Handles</h5>
                <div className="handles-grid">
                  <div className="form-group">
                    <label>X Handle</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={editForm.platforms?.x || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        platforms: { ...prev.platforms, x: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>YouTube Channel</label>
                    <input
                      type="text"
                      placeholder="Channel ID or @handle"
                      value={editForm.platforms?.youtube || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        platforms: { ...prev.platforms, youtube: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>TikTok Handle</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={editForm.platforms?.tiktok || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        platforms: { ...prev.platforms, tiktok: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Instagram Handle</label>
                    <input
                      type="text"
                      placeholder="username"
                      value={editForm.platforms?.instagram || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        platforms: { ...prev.platforms, instagram: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-note">
                <p>Note: Only YouTube RSS feeds provide real tracking. Other platforms will show 0 unless proper API keys are configured.</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEditingStudent(null)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveStudent}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Session Modal */}
      {showResetModal && (
        <div className="reset-modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Session Goals</h3>
              <button className="close-btn" onClick={() => setShowResetModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="warning-icon">Warning</div>
              
              <h4>What will happen:</h4>
              <ul className="reset-info">
                <li>All students' <strong>Session Goals</strong> will be cleared</li>
                <li>This marks the end of the current session and the start of a new one</li>
                <li>Students can set new session goals for the upcoming period</li>
                <li>Daily goals and other settings will NOT be affected</li>
                <li>This action cannot be undone</li>
              </ul>
              
              <div className="session-explanation">
                <p><strong>What are Session Goals?</strong></p>
                <p>Session goals are medium-term objectives that students work towards over a specific period (e.g., a semester, quarter, or custom timeframe). Resetting them allows you to start a fresh tracking period for all students.</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
              <button className="confirm-reset-btn" onClick={handleResetSession}>
                Yes, Reset All Session Goals
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .audience-building-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .tab-header {
          margin-bottom: 40px;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
        }

        .header-left {
          flex: 0 0 auto;
        }

        .search-container {
          flex: 1;
          max-width: 500px;
          position: relative;
          display: flex;
          justify-content: center;
        }

        .search-input {
          width: 100%;
          padding: 16px 50px 16px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1.1rem;
          transition: all 0.2s ease;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .search-input:focus {
          outline: none;
          border-color: #1a1a1a;
          box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .search-input::placeholder {
          color: #999;
          font-weight: 400;
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          padding: 4px 8px;
          transition: color 0.2s ease;
        }

        .clear-search:hover {
          color: #1a1a1a;
        }

        .tab-header h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 2.2rem;
          font-weight: 300;
          letter-spacing: -0.02em;
        }

        .tab-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
          font-weight: 400;
        }

        .reset-session-btn {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reset-session-btn:hover {
          background: #333;
          transform: translateY(-1px);
        }

        .students-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .student-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
          border: 1px solid #f0f0f0;
          position: relative;
        }

        .student-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          border-color: #e0e0e0;
        }

        .student-card.distinguished {
          background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
          border-color: #f5e6a3;
        }

        .student-card.distinguished:hover {
          box-shadow: 0 8px 25px rgba(245, 230, 163, 0.15);
        }

        .student-info {
          flex: 1;
        }

        .student-name {
          font-size: 1.1rem;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .student-card.distinguished .student-name {
          color: #8b6914;
          font-weight: 600;
        }

        .student-details {
          display: flex;
          gap: 16px;
          font-size: 0.9rem;
          color: #666;
        }

        .points {
          font-weight: 500;
          color: #4a5568;
        }

        .student-card.distinguished .points {
          color: #8b6914;
        }

        .activity {
          color: #999;
        }


        .student-card.goal-met {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          border-color: #86efac;
        }

        .goal-progress {
          margin-top: 12px;
        }

        .progress-text {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }

        .progress-text .actual {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .student-card.goal-met .progress-text .actual {
          color: #16a34a;
        }

        .progress-text .divider {
          color: #999;
          font-size: 1rem;
        }

        .progress-text .goal {
          font-size: 1rem;
          color: #666;
        }

        .progress-text .label {
          font-size: 0.85rem;
          color: #999;
          margin-left: 8px;
        }

        .progress-bar-mini {
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill-mini {
          height: 100%;
          background: #1a1a1a;
          transition: width 0.3s ease;
        }

        .student-card.goal-met .progress-fill-mini {
          background: #16a34a;
        }

        .platform-breakdown {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .platform-stat {
          font-size: 0.8rem;
          color: #666;
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .no-goals {
          margin-top: 8px;
          font-size: 0.9rem;
          color: #999;
          font-style: italic;
        }

        .tab-loading {
          text-align: center;
          padding: 80px 20px;
          color: #666;
          font-size: 1.1rem;
          font-weight: 300;
        }

        .student-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .edit-btn {
          background: #1a1a1a;
          color: white;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: #333;
          border-color: #333;
        }

        /* Modal Styles */
        .edit-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .edit-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 400;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 24px;
        }

        .student-info-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .student-info-header h4 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .honors-badge {
          background: #ffd700;
          color: #1a1a1a;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .form-section h5 {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 500;
          color: #666;
        }

        .goals-grid, .handles-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 4px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
        }
        
        .form-group select {
          background: white;
          cursor: pointer;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1a1a1a;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding-top: 10px;
        }
        
        .checkbox-group input[type="checkbox"] {
          margin-right: 8px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .personal-goals-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .modal-note {
          background: #f8f9fa;
          border-left: 3px solid #ffd700;
          padding: 12px;
          border-radius: 4px;
        }

        .modal-note p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #f0f0f0;
        }

        .cancel-btn, .save-btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: white;
          border: 1px solid #e0e0e0;
          color: #666;
        }

        .cancel-btn:hover {
          background: #f5f5f5;
        }

        .save-btn {
          background: #1a1a1a;
          border: none;
          color: white;
        }

        .save-btn:hover {
          background: #333;
        }

        /* Reset Modal Styles */
        .reset-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .reset-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .reset-modal .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .reset-modal .modal-header h3 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 400;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reset-modal .modal-body {
          padding: 24px;
        }

        .warning-icon {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 20px;
        }

        .reset-modal h4 {
          margin: 0 0 16px 0;
          color: #1a1a1a;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .reset-info {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
        }

        .reset-info li {
          padding: 10px 0;
          padding-left: 28px;
          position: relative;
          color: #666;
          line-height: 1.5;
        }

        .reset-info li:before {
          content: "•";
          position: absolute;
          left: 12px;
          color: #1a1a1a;
          font-weight: bold;
        }

        .reset-info li strong {
          color: #1a1a1a;
          font-weight: 500;
        }

        .session-explanation {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          border-left: 3px solid #1a1a1a;
        }

        .session-explanation p {
          margin: 0 0 8px 0;
          color: #666;
          line-height: 1.5;
        }

        .session-explanation p:last-child {
          margin-bottom: 0;
        }

        .session-explanation p strong {
          color: #1a1a1a;
        }

        .reset-modal .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
        }

        .confirm-reset-btn {
          background: #dc2626;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .confirm-reset-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
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

        @media (max-width: 768px) {
          .audience-building-tab {
            padding: 20px;
          }

          .students-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .student-card {
            padding: 20px;
          }

          .tab-header h2 {
            font-size: 1.8rem;
          }

          .header-section {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .header-left {
            text-align: center;
          }

          .search-container {
            max-width: 100%;
            order: 1;
          }

          .search-input {
            padding: 14px 45px 14px 16px;
            font-size: 1rem;
          }

          .clear-search {
            right: 10px;
          }

          .reset-session-btn {
            order: 2;
            align-self: center;
          }
        }

        @media (max-width: 480px) {
          .student-details {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}

// OLD Manage Students Tab Component - REPLACED BY COMPONENT
function OldManageStudentsTab() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    honors: false
  });
  const [loading, setLoading] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/add-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newStudent)
      });

      const data = await response.json();

      if (data.success) {
        showNotification(`Student added successfully! Email: ${data.credentials.email}, Password: ${data.credentials.temporaryPassword}`, 'success');
        setNewStudent({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          honors: false
        });
        setShowAddForm(false);
      } else {
        showNotification(data.message || 'Failed to add student', 'error');
      }
    } catch (error) {
      showNotification('Error adding student', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-students-tab">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <div className="tab-header">
        <h2>Manage Students</h2>
        <button 
          className="add-student-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add New Student'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-student-form">
          <h3>Add New Student</h3>
          <form onSubmit={handleAddStudent}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email (optional - will auto-generate if blank)</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="firstname.lastname@alpha.school"
                />
              </div>
              <div className="form-group">
                <label>Password (optional - defaults to "Iloveschool")</label>
                <input
                  type="text"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  placeholder="Leave blank for default"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={newStudent.honors}
                  onChange={(e) => setNewStudent({...newStudent, honors: e.target.checked})}
                />
                <span>Honors Student</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Adding...' : 'Add Student'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="info-section">
        <h3>Important Notes</h3>
        <ul>
          <li>New students will receive an auto-generated email in the format: firstname.lastname@alpha.school</li>
          <li>Default password is "Iloveschool" unless specified otherwise</li>
          <li>Share the login credentials with the student securely</li>
          <li>Students can set their daily goals and social media profiles after logging in</li>
        </ul>
      </div>

      <style jsx>{`
        .manage-students-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
          position: relative;
        }

        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .tab-header h2 {
          font-size: 1.8rem;
          font-weight: 300;
          color: #1a1a1a;
        }

        .add-student-btn {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-student-btn:hover {
          background: #333;
        }

        .add-student-form {
          background: white;
          padding: 32px;
          border-radius: 8px;
          margin-bottom: 32px;
          border: 1px solid #e0e0e0;
        }

        .add-student-form h3 {
          margin: 0 0 24px 0;
          font-size: 1.3rem;
          font-weight: 400;
          color: #1a1a1a;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 8px;
        }

        .form-group input[type="text"],
        .form-group input[type="email"] {
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #1a1a1a;
        }

        .checkbox-group {
          margin-bottom: 24px;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          margin-right: 8px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .submit-btn {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #333;
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: white;
          color: #666;
          border: 1px solid #e0e0e0;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: #f5f5f5;
        }

        .info-section {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .info-section h3 {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          font-weight: 400;
          color: #1a1a1a;
        }

        .info-section ul {
          margin: 0;
          padding-left: 24px;
          color: #666;
        }

        .info-section li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .manage-students-tab {
            padding: 20px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Goal History Tab Component - Admin View
function GoalHistoryTab() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentHistory();
    }
  }, [selectedStudent, dateRange]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students);
        // Don't auto-select first student, let user choose
      } else {
        console.error('API returned error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentHistory = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const url = `/api/goals/history/${selectedStudent}?days=${dateRange}${forceRefresh ? '&refresh=true' : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': forceRefresh ? 'no-cache' : 'default'
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      if (forceRefresh) setRefreshing(false);
    }
  };

  const getCompletionRate = (entry) => {
    let completed = 0;
    let total = 0;
    
    if (entry.dailyGoal) {
      total++;
      if (entry.dailyGoalCompleted) completed++;
    }
    
    total++;
    if (entry.brainliftCompleted) completed++;
    
    if (entry.audienceGoals) {
      Object.values(entry.audienceGoals).forEach(goal => {
        if (goal > 0) total++;
      });
    }
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Calendar helper functions
  const getHistoryForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    const entry = history.find(h => h.date === dateKey) || {};
    
    // Check audience building - handle both new and old data formats
    const hasAudienceActivity = (
      (entry.audienceX > 0 || entry.audienceYouTube > 0 || entry.audienceTikTok > 0 || entry.audienceInstagram > 0) ||
      (entry.audienceGoals && (
        entry.audienceGoals.x > 0 || 
        entry.audienceGoals.youtube > 0 || 
        entry.audienceGoals.tiktok > 0 || 
        entry.audienceGoals.instagram > 0
      ))
    );
    
    const today = new Date().toISOString().split('T')[0];
    const isToday = dateKey === today;
    
    const result = {
      brainlift: entry.brainliftCompleted || false,
      dailyGoal: entry.dailyGoalCompleted || false,
      audienceBuilding: hasAudienceActivity,
      goalText: entry.dailyGoal || '',
      hasGoalSet: !!entry.dailyGoal
    };
    
    // Calendar data ready
    
    return result;
  };

  const renderCalendar = (calendarType = 'brainlift') => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0];
    
    const days = [];
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div key={`prev-${day}`} className="calendar__date calendar__date--grey">
          <span>{day}</span>
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isToday = dateStr === todayDateStr;
      const isSelected = selectedDate && dateStr === selectedDate.toISOString().split('T')[0];
      const historyData = getHistoryForDate(currentDate);
      
      let isCompleted = false;
      let hasGoalSet = true;
      
      // Determine completion based on calendar type
      switch (calendarType) {
        case 'brainlift':
          isCompleted = historyData.brainlift;
          hasGoalSet = true; // Brainlift is always available
          break;
        case 'dailyGoal':
          isCompleted = historyData.dailyGoal;
          hasGoalSet = historyData.hasGoalSet; // Only show red/green if goal is actually set
          break;
        case 'audienceBuilding':
          isCompleted = historyData.audienceBuilding;
          hasGoalSet = true; // Audience building is always trackable
          break;
      }
      
      // Calendar highlighting logic complete
      
      let dayClasses = 'calendar__date';
      
      // Apply completion styling
      if (isCompleted) {
        dayClasses += ' calendar__date--completed'; // Green for completed
      } else if (hasGoalSet) {
        dayClasses += ' calendar__date--not-completed'; // Red for not completed but goal was set
      }
      
      // Apply today styling
      if (isToday) {
        dayClasses += ' calendar__date--today';
      }
      
      // Calendar rendering complete
      
      days.push(
        <div 
          key={day} 
          className={dayClasses}
          onClick={() => {
            setSelectedDate(currentDate);
          }}
        >
          <span>{day}</span>
          {isCompleted && (
            <div className="completion-badge">
              ✓
            </div>
          )}
        </div>
      );
    }
    
    // Next month days
    const remainingCells = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="calendar__date calendar__date--grey">
          <span>{day}</span>
        </div>
      );
    }
    
    return days;
  };

  const selectedStudentData = students.find(s => s.id == selectedStudent);

  return (
    <div className="goal-history-tab">
      <div className="tab-header">
        <h2>Student Goal History</h2>
        <p>View historical goal completion for all students</p>
      </div>

      <div className="controls-row">
        <div className="student-selector">
          <label>Select Student:</label>
          <select 
            value={selectedStudent || ''} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="student-select"
            disabled={loading || students.length === 0}
          >
            {loading ? (
              <option value="">Loading students...</option>
            ) : students.length === 0 ? (
              <option value="">No students found</option>
            ) : (
              <>
                <option value="">Select a student...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="date-selector">
          <label>Time Period:</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${!showCalendar ? 'active' : ''}`}
            onClick={() => setShowCalendar(false)}
          >
            List View
          </button>
          <button 
            className={`view-btn ${showCalendar ? 'active' : ''}`}
            onClick={() => setShowCalendar(true)}
          >
            Calendar View
          </button>
        </div>
      </div>

      {selectedStudentData && (
        <div className="student-info-card">
          <h3>{selectedStudentData.firstName} {selectedStudentData.lastName}</h3>
          {selectedStudentData.honors && <span className="honors-badge">Honors</span>}
        </div>
      )}

      <div className="history-container">
        {loading ? (
          <div className="loading">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="no-history">
            <p>No history available for this student in the selected period</p>
          </div>
        ) : showCalendar ? (
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
              <button 
                className="calendar__button calendar__button--primary"
                onClick={() => {
                  if (selectedStudent) {
                    fetchStudentHistory(true);
                  }
                }}
                disabled={!selectedStudent || refreshing}
              >
                {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        ) : (
          <div className="history-grid">
            {history.map((entry, index) => {
              const completionRate = getCompletionRate(entry);
              const date = new Date(entry.date);
              
              return (
                <div key={index} className="history-card">
                  <div className="card-header">
                    <div className="date-info">
                      <span className="date">{date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className={`completion-badge ${completionRate >= 80 ? 'high' : completionRate >= 50 ? 'medium' : 'low'}`}>
                      {completionRate}%
                    </div>
                  </div>
                  
                  <div className="card-body">
                    {entry.projectOneliner && (
                      <div className="history-item">
                        <span className="item-icon">🚀</span>
                        <span className="item-text">{entry.projectOneliner}</span>
                      </div>
                    )}
                    
                    {entry.dailyGoal && (
                      <div className="history-item">
                        <span className="item-icon">📅</span>
                        <span className="item-text">{entry.dailyGoal}</span>
                        {entry.dailyGoalCompleted && <span className="check">✓</span>}
                      </div>
                    )}
                    
                    {entry.sessionGoal && (
                      <div className="history-item">
                        <span className="item-icon">🎯</span>
                        <span className="item-text">{entry.sessionGoal}</span>
                      </div>
                    )}
                    
                    <div className="history-item">
                      <span className="item-icon">🧠</span>
                      <span className="item-text">Brainlift</span>
                      <span className={entry.brainliftCompleted ? 'check' : 'cross'}>
                        {entry.brainliftCompleted ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .goal-history-tab {
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
          font-size: 2.2rem;
          font-weight: 300;
        }

        .tab-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .controls-row {
          display: flex;
          gap: 24px;
          justify-content: center;
          margin-bottom: 32px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .view-toggle {
          display: flex;
          gap: 4px;
          background: #f0f0f0;
          border-radius: 8px;
          padding: 4px;
        }
        
        .view-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .view-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .view-btn.active {
          background: white;
          color: #1a1a1a;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Three Calendars Layout */
        .calendars-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .calendars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 32px;
          margin-bottom: 32px;
        }
        
        .calendar-section {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }
        
        .calendar-title {
          text-align: center;
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        /* Smaller calendars for 3-grid layout */
        .calendars-grid .calendar {
          width: 100%;
          max-width: none;
          --side-padding: 16px;
          --border-radius: 16px;
          --accent-br: 12px;
        }
        
        .calendars-grid .calendar__date {
          --height: calc(300px / 6 - var(--side-padding));
          font-size: 0.9rem;
        }
        
        .calendars-grid .calendar select {
          padding: 10px 14px;
          font-size: 0.9rem;
        }
        
        .calendars-grid .calendar__days > div {
          font-size: 0.9rem;
          padding: 8px 0;
        }
        
        /* Red/Green Color Coding */
        .calendar__date--completed {
          color: #fff;
          background: #10b981;
          border-radius: 8px;
          font-weight: 600;
        }
        
        .calendar__date--completed::before {
          background-color: #10b981 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .calendar__date--not-completed {
          color: #fff;
          background: #ef4444;
          border-radius: 8px;
          font-weight: 600;
        }
        
        .calendar__date--not-completed::before {
          background-color: #ef4444 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .calendar__date--today {
          border: 2px solid #1752ff;
          font-weight: 800;
        }
        
        .calendar__date--completed.calendar__date--today {
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px #1752ff, 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .calendar__date--not-completed.calendar__date--today {
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px #1752ff, 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .calendar-controls {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
        
        .calendar-controls .calendar__button {
          padding: 12px 24px;
          font-size: 1rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .student-selector,
        .date-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .student-selector label,
        .date-selector label {
          color: #666;
          font-weight: 500;
        }

        .student-select,
        .date-range-select {
          padding: 10px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .student-select:hover:not(:disabled),
        .date-range-select:hover:not(:disabled) {
          border-color: #1a1a1a;
        }
        
        .student-select:disabled,
        .date-range-select:disabled {
          background-color: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        .student-info-card {
          text-align: center;
          margin-bottom: 32px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .student-info-card h3 {
          margin: 0;
          color: #1a1a1a;
          font-size: 1.4rem;
          font-weight: 400;
          display: inline-block;
        }

        .honors-badge {
          display: inline-block;
          background: #ffd700;
          color: #1a1a1a;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          margin-left: 12px;
        }

        .history-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .history-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .history-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #fafafa;
          border-bottom: 1px solid #f0f0f0;
        }

        .date-info .date {
          color: #1a1a1a;
          font-weight: 500;
        }

        .completion-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
        }

        .completion-badge.high {
          background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
        }

        .completion-badge.medium {
          background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        }

        .completion-badge.low {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        .card-body {
          padding: 20px;
        }

        .history-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          padding: 8px 0;
        }

        .history-item:last-child {
          margin-bottom: 0;
        }

        .item-icon {
          font-size: 1.1rem;
          min-width: 24px;
        }

        .item-text {
          flex: 1;
          color: #333;
          line-height: 1.4;
          font-size: 0.95rem;
        }

        .check {
          color: #16a34a;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .cross {
          color: #dc2626;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .loading,
        .no-history {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        @media (max-width: 1200px) {
          .calendars-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .calendars-grid .calendar {
            --side-padding: 20px;
          }
          
          .calendars-grid .calendar__date {
            --height: calc(350px / 6 - var(--side-padding));
            font-size: 1rem;
          }
        }

        @media (max-width: 768px) {
          .goal-history-tab {
            padding: 20px;
          }

          .controls-row {
            flex-direction: column;
            gap: 16px;
          }

          .student-selector,
          .date-selector {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }
          
          .calendars-grid {
            gap: 20px;
          }
          
          .calendar-section {
            padding: 16px;
          }
          
          .calendar-title {
            font-size: 1.1rem;
          }
          
          .calendars-grid .calendar {
            --side-padding: 14px;
          }
          
          .calendars-grid .calendar__date {
            --height: calc(280px / 6 - var(--side-padding));
            font-size: 0.85rem;
          }
          
          .calendar-controls {
            flex-direction: column;
            gap: 12px;
          }
          
          .calendar-controls .calendar__button {
            padding: 10px 20px;
            font-size: 0.9rem;
          }

          .history-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('daily'); // daily, audience, brainlift
  const [timePeriod, setTimePeriod] = useState('today'); // today, yesterday, week, month
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [housePoints, setHousePoints] = useState({});
  const [sheetsConfigured, setSheetsConfigured] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [cachedData, setCachedData] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Only recalculate when type or period changes after initial load
    if (students.length > 0 && initialLoadComplete) {
      calculateLeaderboard();
    }
  }, [leaderboardType, timePeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students and groups in parallel
      const token = localStorage.getItem('authToken');
      const [studentsResponse, groupsResponse] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/admin/groups', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);
      
      const [studentsData, groupsData] = await Promise.all([
        studentsResponse.json(),
        groupsResponse.json()
      ]);
      
      if (studentsData.success) {
        const studentsList = studentsData.students || [];
        const groupsList = groupsData.success ? (groupsData.groups || []) : [];
        
        setStudents(studentsList);
        setGroups(groupsList);
        setInitialLoadComplete(true);
        
        // Directly calculate leaderboard with the fetched data
        if (studentsList.length > 0) {
          await calculateLeaderboardWithData(studentsList, groupsList);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setStudents([]);
      setGroups([]);
      setInitialLoadComplete(true);
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (timePeriod) {
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;
        break;
      default: // today
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;
    }

    return { startDate, endDate };
  };

  // Helper function to calculate leaderboard with provided data
  const calculateLeaderboardWithData = async (studentsList, groupsList, forceRefresh = false) => {
    try {
      setLoading(true);
      const houseScores = {};
      
      // Initialize house scores
      groupsList.forEach(group => {
        houseScores[group.id] = {
          name: group.name,
          points: 0,
          studentsCompleted: 0,
          totalStudents: 0
        };
      });

      const token = localStorage.getItem('authToken');
      const days = timePeriod === 'month' ? 30 : timePeriod === 'week' ? 7 : 1;
      const { startDate, endDate } = getDateRange();
      
      let batchData;
      
      // Check if we can use cached data (cache for 30 seconds)
      const now = Date.now();
      const cacheExpired = !lastFetchTime || (now - lastFetchTime > 30000);
      
      if (!forceRefresh && cachedData && !cacheExpired && cachedData.days === days) {
        // Use cached data
        batchData = cachedData;
      } else {
        // Fetch all student data in a single batch request
        const studentIds = studentsList.map(s => s.id);
        
        const batchResponse = await fetch('/api/admin/batch-leaderboard-data', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentIds,
            days
          })
        });

        batchData = await batchResponse.json();
        
        if (!batchData.success) {
          throw new Error('Failed to fetch batch data');
        }
        
        // Cache the data
        setCachedData(batchData);
        setLastFetchTime(now);
      }

      // Process the batch data
      const leaderboard = studentsList.map(student => {
        let score = 0;
        let completed = false;
        let hasGoalSet = false;

        const studentData = batchData.data[student.id];
        if (!studentData) {
          return {
            ...student,
            score: 0,
            completed: false,
            hasGoalSet: false
          };
        }

        const profile = studentData.profile;
        const history = studentData.history || [];

        const relevantHistory = history.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });

        // Calculate score based on leaderboard type
        switch (leaderboardType) {
          case 'daily':
            // Check if daily goal is set in profile
            hasGoalSet = profile && 
                        profile.dailyGoal && 
                        profile.dailyGoal.trim() !== '';
            score = relevantHistory.filter(entry => entry.dailyGoalCompleted).length;
            completed = timePeriod === 'today' || timePeriod === 'yesterday' 
              ? relevantHistory.some(entry => entry.dailyGoalCompleted)
              : score > 0;
            break;
          case 'audience':
            // Check if any audience goals are set
            hasGoalSet = profile && 
                        profile.goals && 
                        Object.values(profile.goals).some(g => g > 0);
            score = relevantHistory.reduce((total, entry) => {
              if (!entry.audienceGoals) return total;
              const dailyCompleted = Object.entries(entry.audienceGoals).every(([platform, goal]) => {
                if (goal === 0) return true;
                const actual = entry.audienceActuals?.[platform] || 0;
                return actual >= goal;
              });
              return total + (dailyCompleted ? 1 : 0);
            }, 0);
            completed = timePeriod === 'today' || timePeriod === 'yesterday'
              ? relevantHistory.some(entry => {
                  if (!entry.audienceGoals) return false;
                  return Object.entries(entry.audienceGoals).every(([platform, goal]) => {
                    if (goal === 0) return true;
                    const actual = entry.audienceActuals?.[platform] || 0;
                    return actual >= goal;
                  });
                })
              : score > 0;
            break;
          case 'brainlift':
            // Brainlift is always available/set
            hasGoalSet = true;
            score = relevantHistory.filter(entry => entry.brainliftCompleted).length;
            completed = timePeriod === 'today' || timePeriod === 'yesterday'
              ? relevantHistory.some(entry => entry.brainliftCompleted)
              : score > 0;
            break;
        }

        return {
          ...student,
          score,
          completed,
          hasGoalSet
        };
      });
      
      // Calculate house points based on the results
      leaderboard.forEach(student => {
        if (student.groupId && houseScores[student.groupId]) {
          houseScores[student.groupId].totalStudents++;
          if (!student.hasGoalSet) {
            // No goal set = -10 points
            houseScores[student.groupId].points -= 10;
          } else if (student.completed) {
            // Goal set and completed = +10 points
            houseScores[student.groupId].studentsCompleted++;
            houseScores[student.groupId].points += 10;
          } else {
            // Goal set but not completed = -10 points
            houseScores[student.groupId].points -= 10;
          }
        }
      });

      // Sort leaderboard by score, then by name
      leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      });
      
      setLeaderboardData(leaderboard);
      setHousePoints(houseScores);
    } catch (error) {
      console.error('Error calculating leaderboard:', error);
      setLeaderboardData([]);
      setHousePoints({});
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaderboard = async () => {
    // Simply use the batch version with current state
    await calculateLeaderboardWithData(students, groups);
  };

  const getLeaderboardTitle = () => {
    switch (leaderboardType) {
      case 'daily':
        return 'Daily Goals Leaderboard';
      case 'audience':
        return 'Audience Building Leaderboard';
      case 'brainlift':
        return 'Brainlift Leaderboard';
      default:
        return 'Leaderboard';
    }
  };

  if (loading && leaderboardData.length === 0) {
    return (
      <div className="leaderboard-tab">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading leaderboard data...</p>
            <p className="loading-subtext">Fetching {students.length} student records</p>
          </div>
        </div>
        <style jsx>{`
          .leaderboard-tab {
            background: #fafafa;
            min-height: calc(100vh - 200px);
            padding: 40px;
          }
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
          }
          .loading-spinner {
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 20px;
            border: 3px solid #f0f0f0;
            border-top: 3px solid #1a1a1a;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loading-spinner p {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 1.1rem;
          }
          .loading-subtext {
            font-size: 0.9rem;
            color: #999;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="leaderboard-tab">
      <div className="tab-header">
        <div className="header-row">
          <div>
            <h2>{getLeaderboardTitle()}</h2>
            <p>Track student performance and house competition</p>
          </div>
          <button 
            className="refresh-btn"
            onClick={async () => {
              setCachedData(null);
              setLastFetchTime(null);
              await calculateLeaderboardWithData(students, groups, true);
            }}
            disabled={loading}
            title="Refresh leaderboard data"
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* House Points Display */}
      <div className="house-points-section">
        <h3>House Competition</h3>
        <p className="house-explanation">
          +10 points for completing goals | -10 points for not setting or not completing goals
        </p>
        <div className="house-cards">
          {Object.entries(housePoints).map(([houseId, house]) => (
            <div key={houseId} className={`house-card ${house.points >= 0 ? 'positive' : 'negative'}`}>
              <div className="house-name">{house.name}</div>
              <div className="house-stats">
                <div className="house-score">
                  <span className={`points ${house.points >= 0 ? 'positive' : 'negative'}`}>
                    {house.points > 0 ? '+' : ''}{house.points} pts
                  </span>
                </div>
                <div className="house-completion">
                  {house.studentsCompleted} of {house.totalStudents} students completed
                </div>
                <div className="house-breakdown">
                  <span className="positive">+{house.studentsCompleted * 10} earned</span>
                  <span className="separator"> | </span>
                  <span className="negative">-{(house.totalStudents - house.studentsCompleted) * 10} lost</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {Object.keys(housePoints).length === 0 && (
          <div className="no-houses">
            <p>No houses configured. Students need to be assigned to groups/houses.</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="leaderboard-controls">
        <div className="type-selector">
          <button 
            className={`type-btn ${leaderboardType === 'daily' ? 'active' : ''}`}
            onClick={() => setLeaderboardType('daily')}
          >
            Daily Goals
          </button>
          <button 
            className={`type-btn ${leaderboardType === 'audience' ? 'active' : ''}`}
            onClick={() => setLeaderboardType('audience')}
          >
            Audience Building
          </button>
          <button 
            className={`type-btn ${leaderboardType === 'brainlift' ? 'active' : ''}`}
            onClick={() => setLeaderboardType('brainlift')}
          >
            Brainlift
          </button>
        </div>

        <div className="time-selector">
          <button 
            className={`time-btn ${timePeriod === 'today' ? 'active' : ''}`}
            onClick={() => setTimePeriod('today')}
          >
            Today
          </button>
          <button 
            className={`time-btn ${timePeriod === 'yesterday' ? 'active' : ''}`}
            onClick={() => setTimePeriod('yesterday')}
          >
            Yesterday
          </button>
          <button 
            className={`time-btn ${timePeriod === 'week' ? 'active' : ''}`}
            onClick={() => setTimePeriod('week')}
          >
            This Week
          </button>
          <button 
            className={`time-btn ${timePeriod === 'month' ? 'active' : ''}`}
            onClick={() => setTimePeriod('month')}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table">
        {leaderboardData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>House</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((student, index) => {
                const house = groups.find(g => g.id === student.groupId);
                return (
                  <tr key={student.id} className={index < 3 ? `top-${index + 1}` : ''}>
                    <td className="rank">
                      {index + 1}
                    </td>
                    <td className="student-name">
                      {student.firstName} {student.lastName}
                      {student.honors && <span className="honors-badge">H</span>}
                    </td>
                    <td className="house">{house?.name || 'No House'}</td>
                    <td className="score">{student.score || 0}</td>
                    <td className="status">
                      {!student.hasGoalSet ? (
                        <span className="status-badge no-goal">No Goal Set</span>
                      ) : (
                        <span className={`status-badge ${student.completed ? 'completed' : 'incomplete'}`}>
                          {student.completed ? '✓ Completed' : '✗ Not Done'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No leaderboard data available</p>
            <p className="sub-text">Students need to have goals set and tracked to appear on the leaderboard</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .leaderboard-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .tab-header {
          margin-bottom: 32px;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tab-header h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 2.2rem;
          font-weight: 300;
        }

        .tab-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .refresh-btn {
          padding: 10px 20px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          color: #1a1a1a;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #1a1a1a;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .house-points-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          border: 1px solid #f0f0f0;
        }

        .house-points-section h3 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.3rem;
          font-weight: 400;
        }

        .house-explanation {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 0.95rem;
          text-align: center;
        }

        .no-houses {
          text-align: center;
          padding: 40px;
          color: #999;
          background: #fafafa;
          border-radius: 8px;
        }

        .no-houses p {
          margin: 0;
        }

        .house-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .house-card {
          background: #fafafa;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e0e0e0;
          transition: all 0.2s ease;
        }

        .house-card.positive {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          border-color: #86efac;
        }

        .house-card.negative {
          background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
          border-color: #fca5a5;
        }

        .house-name {
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 12px;
          font-size: 1.1rem;
        }

        .house-score {
          margin-bottom: 8px;
        }

        .points {
          font-size: 1.8rem;
          font-weight: 600;
        }

        .points.positive {
          color: #16a34a;
        }

        .points.negative {
          color: #dc2626;
        }

        .house-completion {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .house-breakdown {
          display: flex;
          gap: 8px;
          font-size: 0.85rem;
          color: #999;
        }

        .house-breakdown .positive {
          color: #16a34a;
        }

        .house-breakdown .negative {
          color: #dc2626;
        }

        .house-breakdown .separator {
          color: #999;
        }

        .leaderboard-controls {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 24px;
          flex-wrap: wrap;
        }

        .type-selector,
        .time-selector {
          display: flex;
          gap: 8px;
        }

        .type-btn,
        .time-btn {
          padding: 10px 16px;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .type-btn:hover,
        .time-btn:hover {
          background: #f5f5f5;
        }

        .type-btn.active,
        .time-btn.active {
          background: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }

        .leaderboard-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #fafafa;
          border-bottom: 2px solid #f0f0f0;
        }

        th {
          padding: 16px;
          text-align: left;
          font-weight: 500;
          color: #666;
          font-size: 0.95rem;
        }

        tbody tr {
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.2s ease;
        }

        tbody tr:hover {
          background: #fafafa;
        }

        tbody tr.top-1 {
          background: linear-gradient(90deg, #ffd700 0%, transparent 10%);
        }

        tbody tr.top-2 {
          background: linear-gradient(90deg, #c0c0c0 0%, transparent 10%);
        }

        tbody tr.top-3 {
          background: linear-gradient(90deg, #cd7f32 0%, transparent 10%);
        }

        td {
          padding: 16px;
        }

        .rank {
          font-weight: 600;
          color: #1a1a1a;
          min-width: 60px;
        }

        .student-name {
          font-weight: 500;
          color: #1a1a1a;
        }

        .honors-badge {
          display: inline-block;
          background: #ffd700;
          color: #1a1a1a;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 8px;
        }

        .house {
          color: #666;
        }

        .score {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 1.1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .status-badge.completed {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.incomplete {
          background: #f8d7da;
          color: #721c24;
        }

        .status-badge.no-goal {
          background: #e0e0e0;
          color: #666;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #666;
        }

        .no-data {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .no-data p {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
        }

        .no-data .sub-text {
          font-size: 0.95rem;
          color: #aaa;
        }

        @media (max-width: 768px) {
          .leaderboard-tab {
            padding: 20px;
          }

          .leaderboard-controls {
            flex-direction: column;
          }

          .type-selector,
          .time-selector {
            width: 100%;
            justify-content: space-between;
          }

          .type-btn,
          .time-btn {
            flex: 1;
            font-size: 0.85rem;
            padding: 8px 12px;
          }

          table {
            font-size: 0.9rem;
          }

          th, td {
            padding: 12px 8px;
          }
        }
      `}</style>
    </div>
  );
}

// Google Sheets Section Component
function GoogleSheetsSection() {
  const [sheetsStatus, setSheetsStatus] = useState('checking');
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');

  useEffect(() => {
    checkSheetsStatus();
  }, []);

  const checkSheetsStatus = async () => {
    try {
      // Since we're using Sheets as primary database, if we can fetch students, it's configured
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSheetsStatus('connected');
        setSpreadsheetUrl('https://docs.google.com/spreadsheets/d/1CSo1_G3P8OQByvytcwhH3Ku-8-WubDZpGrmN3-Gl6K0/edit');
      } else {
        setSheetsStatus('error');
      }
    } catch (error) {
      console.error('Error checking sheets status:', error);
      setSheetsStatus('error');
    }
  };

  // Sync is no longer needed as Sheets is the primary database
  const syncToSheets = async () => {
    alert('Google Sheets is the primary database - data is always in sync!');
  };

  return (
    <div className="sheets-section">
      <div className="status-card">
        <div className="status-info">
          <div className="status-title">Google Sheets Connection</div>
          <div className={`status-badge ${sheetsStatus === 'connected' ? 'connected' : sheetsStatus === 'not-configured' ? 'warning' : 'error'}`}>
            {sheetsStatus === 'checking' && 'Checking...'}
            {sheetsStatus === 'connected' && 'Connected'}
            {sheetsStatus === 'not-configured' && 'Not Configured'}
            {sheetsStatus === 'error' && 'Error'}
          </div>
        </div>
        
        {sheetsStatus === 'connected' && (
          <>
            <div className="status-details">
              <div className="detail-item">
                <span>Spreadsheet</span>
                <a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer" className="sheet-link">
                  Open in Google Sheets →
                </a>
              </div>
              {lastSync && (
                <div className="detail-item">
                  <span>Last Sync</span>
                  <span>{lastSync}</span>
                </div>
              )}
            </div>
            
            <div className="sync-actions">
              <button 
                className="sync-button"
                onClick={syncToSheets}
                disabled={syncingSheets}
              >
                {syncingSheets ? 'Syncing...' : 'Sync All Data to Sheets'}
              </button>
              <p className="sync-info">
                This will sync all students, profiles, goals, and history to the Google Sheets spreadsheet.
              </p>
            </div>
          </>
        )}
        
        {sheetsStatus === 'not-configured' && (
          <div className="info-message warning">
            <p>Google Sheets integration is not configured. Please follow the setup guide:</p>
            <ol>
              <li>Create a Google Cloud service account</li>
              <li>Enable Google Sheets API</li>
              <li>Download credentials JSON</li>
              <li>Add credentials to environment or project root</li>
              <li>Share the spreadsheet with the service account email</li>
            </ol>
            <p>See <code>GOOGLE_SHEETS_SETUP.md</code> for detailed instructions.</p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .sheets-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .sheet-link {
          color: #0066cc;
          text-decoration: none;
          font-weight: 500;
        }
        
        .sheet-link:hover {
          text-decoration: underline;
        }
        
        .sync-actions {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
        }
        
        .sync-button {
          width: 100%;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .sync-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .sync-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .sync-info {
          margin: 12px 0 0 0;
          color: #666;
          font-size: 0.9rem;
          text-align: center;
        }
        
        .status-badge.warning {
          background: #fff3cd;
          color: #856404;
        }
        
        .status-badge.error {
          background: #f8d7da;
          color: #721c24;
        }
        
        .info-message.warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 16px;
          border-radius: 8px;
        }
        
        .info-message.warning ol {
          margin: 12px 0 12px 20px;
          padding: 0;
        }
        
        .info-message.warning li {
          margin: 4px 0;
        }
        
        .info-message.warning code {
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
      `}</style>
    </div>
  );
}

