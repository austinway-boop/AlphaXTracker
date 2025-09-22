import { useState, useEffect } from 'react';

export default function SettingsTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeSection, setActiveSection] = useState('api');
  
  // API Keys form state
  const [apiKeys, setApiKeys] = useState({
    twitterApiKey: '',
    youtubeApiKey: '',
    instagramToken: '',
    tiktokApiKey: ''
  });
  
  // Auto-check settings
  const [autoCheck, setAutoCheck] = useState({
    enabled: false,
    interval: 60
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        setAutoCheck({
          enabled: data.settings.autoCheckEnabled || false,
          interval: data.settings.checkInterval || 60
        });
      } else {
        showNotification('Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotification('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveApiKeys = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'updateApiKeys',
          ...apiKeys
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('API keys saved successfully!', 'success');
        loadSettings(); // Reload to show masked keys
        setApiKeys({ twitterApiKey: '', youtubeApiKey: '', instagramToken: '', tiktokApiKey: '' });
      } else {
        showNotification(data.message || 'Failed to save API keys', 'error');
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      showNotification('Error saving API keys', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTwitterApi = async () => {
    if (!apiKeys.twitterApiKey.trim()) {
      showNotification('Please enter a Twitter API key to test', 'error');
      return;
    }

    setTesting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'testTwitterApi',
          apiKey: apiKeys.twitterApiKey
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification(`✅ ${data.message}`, 'success');
      } else {
        showNotification(`❌ ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error testing API:', error);
      showNotification('Error testing API connection', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleTestYouTubeApi = async () => {
    if (!apiKeys.youtubeApiKey.trim()) {
      showNotification('Please enter a YouTube API key to test', 'error');
      return;
    }

    setTesting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'testYouTubeApi',
          apiKey: apiKeys.youtubeApiKey
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification(`✅ ${data.message}`, 'success');
      } else {
        showNotification(`❌ ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error testing API:', error);
      showNotification('Error testing API connection', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleUpdateAutoCheck = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'updateAutoCheck',
          enabled: autoCheck.enabled,
          interval: autoCheck.interval
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('Auto-check settings updated!', 'success');
        loadSettings();
      } else {
        showNotification(data.message || 'Failed to update settings', 'error');
      }
    } catch (error) {
      console.error('Error updating auto-check:', error);
      showNotification('Error updating auto-check settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRunManualCheck = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'runManualCheck'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification(`✅ ${data.message}`, 'success');
      } else {
        showNotification(`❌ ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error running manual check:', error);
      showNotification('Error running manual check', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-tab">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-tab">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="tab-header">
        <h2>Settings</h2>
        <p>Social Media API Configuration & Automation</p>
      </div>

      {/* Navigation */}
      <div className="settings-nav">
        <button 
          className={`nav-btn ${activeSection === 'api' ? 'active' : ''}`}
          onClick={() => setActiveSection('api')}
        >
          API Configuration
        </button>
        <button 
          className={`nav-btn ${activeSection === 'automation' ? 'active' : ''}`}
          onClick={() => setActiveSection('automation')}
        >
          Manual Check
        </button>
        <button 
          className={`nav-btn ${activeSection === 'instructions' ? 'active' : ''}`}
          onClick={() => setActiveSection('instructions')}
        >
          Setup Instructions
        </button>
      </div>

      <div className="settings-content">
        {/* API Configuration Section */}
        {activeSection === 'api' && (
          <div className="section">
            <div className="section-header">
              <h3>Social Media API Keys</h3>
              <p>Configure your social media API keys for real-time data tracking</p>
            </div>

            {/* Current Status */}
            <div className="status-grid">
              <div className="status-item">
                <div className="status-icon">
                  <span className={`indicator ${settings?.apiStatus?.twitter ? 'connected' : 'disconnected'}`}></span>
                </div>
                <div className="status-info">
                  <h4>Twitter/X API</h4>
                  <p>{settings?.apiStatus?.twitter ? 'Connected' : 'Not configured'}</p>
                  {settings?.twitterApiKey && <small>Key: {settings.twitterApiKey}</small>}
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-icon">
                  <span className={`indicator ${settings?.apiStatus?.youtube ? 'connected' : 'disconnected'}`}></span>
                </div>
                <div className="status-info">
                  <h4>YouTube API</h4>
                  <p>{settings?.apiStatus?.youtube ? 'Connected' : 'Not configured'}</p>
                  {settings?.youtubeApiKey && <small>Key: {settings.youtubeApiKey}</small>}
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon">
                  <span className={`indicator ${settings?.apiStatus?.instagram ? 'connected' : 'disconnected'}`}></span>
                </div>
                <div className="status-info">
                  <h4>Instagram API</h4>
                  <p>{settings?.apiStatus?.instagram ? 'Connected' : 'Not configured'}</p>
                  {settings?.instagramToken && <small>Token: {settings.instagramToken}</small>}
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon">
                  <span className={`indicator ${settings?.apiStatus?.tiktok ? 'connected' : 'disconnected'}`}></span>
                </div>
                <div className="status-info">
                  <h4>TikTok API</h4>
                  <p>{settings?.apiStatus?.tiktok ? 'Connected' : 'Not configured'}</p>
                  {settings?.tiktokApiKey && <small>Key: {settings.tiktokApiKey}</small>}
                </div>
              </div>
            </div>

            {/* API Key Form */}
            <div className="form-section">
              <h4>Add/Update API Keys</h4>
              
              <div className="form-group">
                <label htmlFor="twitterApiKey">Twitter/X Bearer Token</label>
                <div className="input-group">
                  <input
                    type="password"
                    id="twitterApiKey"
                    value={apiKeys.twitterApiKey}
                    onChange={(e) => setApiKeys({...apiKeys, twitterApiKey: e.target.value})}
                    placeholder="AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BuSeid..."
                  />
                  <button 
                    type="button" 
                    className="test-btn"
                    onClick={handleTestTwitterApi}
                    disabled={testing || !apiKeys.twitterApiKey.trim()}
                  >
                    {testing ? 'Testing...' : 'Test'}
                  </button>
                </div>
                <small>Get your Bearer Token from <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer">developer.twitter.com</a></small>
              </div>

              <div className="form-group">
                <label htmlFor="youtubeApiKey">YouTube Data API Key</label>
                <div className="input-group">
                  <input
                    type="password"
                    id="youtubeApiKey"
                    value={apiKeys.youtubeApiKey}
                    onChange={(e) => setApiKeys({...apiKeys, youtubeApiKey: e.target.value})}
                    placeholder="AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw"
                  />
                  <button 
                    type="button" 
                    className="test-btn"
                    onClick={handleTestYouTubeApi}
                    disabled={testing || !apiKeys.youtubeApiKey.trim()}
                  >
                    {testing ? 'Testing...' : 'Test'}
                  </button>
                </div>
                <small>Get your API Key from <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></small>
              </div>

              <div className="form-group">
                <label htmlFor="instagramToken">Instagram Access Token</label>
                <input
                  type="password"
                  id="instagramToken"
                  value={apiKeys.instagramToken}
                  onChange={(e) => setApiKeys({...apiKeys, instagramToken: e.target.value})}
                  placeholder="IGQVJYeXlOaW5..."
                />
                <small>Get your Access Token from <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">Facebook Developers</a></small>
              </div>

              <div className="form-group">
                <label htmlFor="tiktokApiKey">TikTok API Key</label>
                <input
                  type="password"
                  id="tiktokApiKey"
                  value={apiKeys.tiktokApiKey}
                  onChange={(e) => setApiKeys({...apiKeys, tiktokApiKey: e.target.value})}
                  placeholder="act.1234567890abcdef..."
                />
                <small>Get your API Key from <a href="https://developers.tiktok.com" target="_blank" rel="noopener noreferrer">TikTok Developers</a> (requires approval)</small>
              </div>

              <div className="form-actions">
                <button 
                  className="save-btn"
                  onClick={handleSaveApiKeys}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save API Keys'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Check Section */}
        {activeSection === 'automation' && (
          <div className="section">
            <div className="section-header">
              <h3>Manual Social Media Checking</h3>
              <p>Run social media checks on-demand for all connected students</p>
            </div>

            {/* Manual Check Status */}
            <div className="automation-status">
              <div className="status-card">
                <div className="status-header">
                  <h4>Check Status</h4>
                  <span className="status-badge manual">Manual Control</span>
                </div>
                <div className="status-details">
                  <div className="detail-row">
                    <span>Check Type</span>
                    <span>On-Demand Manual</span>
                  </div>
                  <div className="detail-row">
                    <span>Last Check</span>
                    <span>{settings?.lastAutoCheck ? new Date(settings.lastAutoCheck).toLocaleString() : 'Never'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Data Storage</span>
                    <span>Local Files</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Check Button */}
            <div className="manual-check-section">
              <div className="check-card">
                <div className="check-header">
                  <h4>Run Social Media Check</h4>
                  <p>Check all connected student accounts for today's activity</p>
                </div>
                
                <div className="check-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-content">
                        <h5>Connected Students</h5>
                        <p>Only students with social media handles configured will be checked</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-content">
                        <h5>Real Data Only</h5>
                        <p>Only uses real APIs when configured - no simulated data</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-content">
                        <h5>Data Saved</h5>
                        <p>Results saved to student history files for tracking progress</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="check-actions">
                  <button 
                    className="check-btn"
                    onClick={handleRunManualCheck}
                    disabled={saving}
                  >
                    {saving ? 'Checking All Students...' : 'Check All Connected Students Now'}
                  </button>
                </div>
              </div>
            </div>

            {/* What Gets Checked */}
            <div className="info-section">
              <h4>What Gets Checked</h4>
              <div className="platform-grid">
                <div className="platform-item">
                  <div className="platform-icon twitter">X</div>
                  <div className="platform-info">
                    <h5>Twitter/X</h5>
                    <p>{settings?.apiStatus?.twitter ? 'Real API Connected' : 'No API Key'}</p>
                  </div>
                </div>
                <div className="platform-item">
                  <div className="platform-icon youtube">YT</div>
                  <div className="platform-info">
                    <h5>YouTube</h5>
                    <p>{settings?.apiStatus?.youtube ? 'Real API Connected' : 'No API Key'}</p>
                  </div>
                </div>
                <div className="platform-item">
                  <div className="platform-icon tiktok">TT</div>
                  <div className="platform-info">
                    <h5>TikTok</h5>
                    <p>Not Implemented</p>
                  </div>
                </div>
                <div className="platform-item">
                  <div className="platform-icon instagram">IG</div>
                  <div className="platform-info">
                    <h5>Instagram</h5>
                    <p>Not Implemented</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Section */}
        {activeSection === 'instructions' && (
          <div className="section">
            <div className="section-header">
              <h3>Complete Setup Instructions</h3>
              <p>Follow these comprehensive steps to set up each social media API</p>
            </div>

            {/* Twitter Setup */}
            <div className="instruction-card">
              <div className="instruction-header">
                <div className="platform-icon twitter">X</div>
                <div>
                  <h4>Twitter/X API Setup</h4>
                  <p>Get real-time tweet counts for your students</p>
                </div>
              </div>
              
              <div className="instruction-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h5>Create Developer Account</h5>
                    <p>Go to <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer">developer.twitter.com</a> and sign up for a developer account</p>
                    <ul>
                      <li>Use case: "Educational/Research"</li>
                      <li>Description: "Educational tool for tracking student social media goals"</li>
                      <li>Wait for approval (usually 1-3 days)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h5>Create App</h5>
                    <p>Once approved, create a new app in the developer portal</p>
                    <ul>
                      <li>App name: "AlphaXTracker"</li>
                      <li>Description: "Educational social media tracking tool"</li>
                      <li>Website: Your domain or GitHub repo</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h5>Get Bearer Token</h5>
                    <p>Navigate to your app's "Keys and Tokens" tab</p>
                    <ul>
                      <li>Generate Bearer Token</li>
                      <li>Copy the token (starts with "AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA")</li>
                      <li>Paste it in the API Configuration tab above</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Setup */}
            <div className="instruction-card">
              <div className="instruction-header">
                <div className="platform-icon youtube">YT</div>
                <div>
                  <h4>YouTube Data API Setup</h4>
                  <p>Track video uploads and channel activity</p>
                </div>
              </div>
              
              <div className="instruction-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h5>Google Cloud Console</h5>
                    <p>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">console.cloud.google.com</a></p>
                    <ul>
                      <li>Create a new project or select existing</li>
                      <li>Navigate to "APIs & Services" → "Library"</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h5>Enable YouTube Data API</h5>
                    <p>Search for and enable the YouTube Data API v3</p>
                    <ul>
                      <li>Click "Enable" on the YouTube Data API v3</li>
                      <li>Wait for activation to complete</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h5>Create API Key</h5>
                    <p>Go to "Credentials" and create an API Key</p>
                    <ul>
                      <li>Click "Create Credentials" → "API Key"</li>
                      <li>Copy the generated key</li>
                      <li>Optionally restrict the key to YouTube Data API only</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Setup */}
            <div className="instruction-card">
              <div className="instruction-header">
                <div className="platform-icon instagram">IG</div>
                <div>
                  <h4>Instagram Basic Display API</h4>
                  <p>Access Instagram posts and media (requires user authorization)</p>
                </div>
              </div>
              
              <div className="instruction-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h5>Facebook Developers</h5>
                    <p>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">developers.facebook.com</a></p>
                    <ul>
                      <li>Create a new app</li>
                      <li>Add "Instagram Basic Display" product</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h5>Configure OAuth</h5>
                    <p>Set up OAuth redirect URIs and permissions</p>
                    <ul>
                      <li>Add your domain to OAuth redirect URIs</li>
                      <li>Configure required permissions</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h5>Get Access Tokens</h5>
                    <p>Each student needs to authorize your app</p>
                    <ul>
                      <li>Implement OAuth flow for each student</li>
                      <li>Store individual access tokens securely</li>
                      <li>Note: This is the most complex setup</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* TikTok Setup */}
            <div className="instruction-card">
              <div className="instruction-header">
                <div className="platform-icon tiktok">TT</div>
                <div>
                  <h4>TikTok API Setup</h4>
                  <p>Access TikTok video data (requires approval)</p>
                </div>
              </div>
              
              <div className="instruction-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h5>Apply for Access</h5>
                    <p>Go to <a href="https://developers.tiktok.com" target="_blank" rel="noopener noreferrer">developers.tiktok.com</a></p>
                    <ul>
                      <li>Apply for API access (requires business justification)</li>
                      <li>Wait for approval (can take weeks)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h5>Create App</h5>
                    <p>Once approved, create your app</p>
                    <ul>
                      <li>Configure app settings</li>
                      <li>Set up OAuth credentials</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h5>Implementation</h5>
                    <p>Implement OAuth flow for user authorization</p>
                    <ul>
                      <li>Each user must authorize access</li>
                      <li>Handle access token refresh</li>
                      <li>Note: Very strict rate limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="important-notes">
              <h4>Important Notes</h4>
              <div className="note-grid">
                <div className="note-item">
                  <h5>Rate Limits</h5>
                  <p>All APIs have rate limits. The system caches results for 5 minutes to avoid hitting limits.</p>
                </div>
                <div className="note-item">
                  <h5>Costs</h5>
                  <p>Twitter API has paid tiers. YouTube is free for reasonable usage. Instagram and TikTok are free but complex.</p>
                </div>
                <div className="note-item">
                  <h5>Fallback</h5>
                  <p>Without API keys, the system uses realistic simulated data for demonstration purposes.</p>
                </div>
                <div className="note-item">
                  <h5>Security</h5>
                  <p>All API keys are stored securely in Google Sheets and never exposed in the frontend.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .settings-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #666;
          font-size: 1.1rem;
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 20px;
          padding-right: 48px;
          border-radius: 8px;
          font-weight: 400;
          z-index: 1000;
          max-width: 400px;
          min-width: 300px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .notification.success {
          border-left: 4px solid #16a34a;
        }

        .notification.error {
          border-left: 4px solid #dc2626;
        }

        .notification.info {
          border-left: 4px solid #2563eb;
        }

        .tab-header {
          margin-bottom: 40px;
          text-align: center;
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

        .settings-nav {
          display: flex;
          justify-content: center;
          gap: 0;
          margin-bottom: 40px;
          background: white;
          border-radius: 12px;
          padding: 6px;
          border: 1px solid #f0f0f0;
          max-width: 600px;
          margin: 0 auto 40px auto;
        }

        .nav-btn {
          background: none;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          font-weight: 400;
          color: #666;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          flex: 1;
        }

        .nav-btn:hover {
          color: #1a1a1a;
          background: #fafafa;
        }

        .nav-btn.active {
          color: #1a1a1a;
          background: #1a1a1a;
          color: white;
          font-weight: 500;
        }

        .settings-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          border: 1px solid #f0f0f0;
        }

        .section-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .section-header h3 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.6rem;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .section-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
          font-weight: 400;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .status-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .status-icon {
          flex-shrink: 0;
        }

        .indicator {
          display: block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .indicator.connected {
          background: #16a34a;
        }

        .indicator.disconnected {
          background: #dc2626;
        }

        .status-info h4 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .status-info p {
          margin: 0 0 4px 0;
          font-size: 0.9rem;
          color: #666;
        }

        .status-info small {
          font-size: 0.8rem;
          color: #999;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .form-section h4 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #1a1a1a;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.2s ease;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1a1a1a;
        }

        .input-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .input-group input {
          flex: 1;
        }

        .form-group small {
          display: block;
          margin-top: 6px;
          color: #666;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .form-group small a {
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 500;
        }

        .form-group small a:hover {
          text-decoration: underline;
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-weight: 400 !important;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto !important;
          margin: 0;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .save-btn,
        .test-btn {
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          border: none;
        }

        .save-btn {
          background: #1a1a1a;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #333;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .test-btn {
          background: white;
          color: #1a1a1a;
          border: 1px solid #e0e0e0;
        }

        .test-btn:hover:not(:disabled) {
          background: #fafafa;
          transform: translateY(-1px);
        }

        .test-btn:disabled {
          background: #f8f9fa;
          color: #999;
          cursor: not-allowed;
        }

        .automation-status {
          margin-bottom: 32px;
        }

        .status-card {
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 24px;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .status-header h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge.enabled {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.disabled {
          background: #f8d7da;
          color: #721c24;
        }

        .status-badge.manual {
          background: #e2e3e5;
          color: #383d41;
        }

        .status-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f5f5f5;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row span:first-child {
          color: #666;
          font-weight: 400;
        }

        .detail-row span:last-child {
          color: #1a1a1a;
          font-weight: 500;
        }

        .info-section {
          margin-top: 32px;
        }

        .info-section h4 {
          margin: 0 0 20px 0;
          color: #1a1a1a;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .info-item {
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .info-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }


        .info-content h5 {
          margin: 0 0 8px 0;
          font-size: 1rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .info-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.4;
        }

        .instruction-card {
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .instruction-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .platform-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
          flex-shrink: 0;
          letter-spacing: -0.02em;
        }

        .platform-icon.twitter {
          background: #1da1f2;
          color: white;
        }

        .platform-icon.youtube {
          background: #ff0000;
          color: white;
        }

        .platform-icon.instagram {
          background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
          color: white;
        }

        .platform-icon.tiktok {
          background: #000000;
          color: white;
        }

        .instruction-header h4 {
          margin: 0 0 4px 0;
          font-size: 1.2rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .instruction-header p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }

        .instruction-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1a1a1a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .step-content h5 {
          margin: 0 0 8px 0;
          font-size: 1rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .step-content p {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.4;
        }

        .step-content ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .step-content li {
          margin-bottom: 4px;
          font-size: 0.85rem;
          color: #666;
          line-height: 1.3;
        }

        .step-content a {
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 500;
        }

        .step-content a:hover {
          text-decoration: underline;
        }

        .important-notes {
          margin-top: 32px;
          padding: 24px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
        }

        .important-notes h4 {
          margin: 0 0 16px 0;
          color: #856404;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .note-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .note-item h5 {
          margin: 0 0 8px 0;
          font-size: 0.95rem;
          font-weight: 500;
          color: #856404;
        }

        .note-item p {
          margin: 0;
          font-size: 0.85rem;
          color: #856404;
          line-height: 1.3;
        }

        .manual-check-section {
          margin-bottom: 32px;
        }

        .check-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 24px;
        }

        .check-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .check-header h4 {
          margin: 0 0 8px 0;
          font-size: 1.3rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .check-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .check-info {
          margin-bottom: 24px;
        }

        .check-actions {
          text-align: center;
        }

        .check-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1.1rem;
          min-width: 280px;
        }

        .check-btn:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
        }

        .check-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .platform-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .platform-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .platform-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .platform-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
          letter-spacing: -0.01em;
        }

        .platform-icon.twitter {
          background: #1da1f2;
          color: white;
        }

        .platform-icon.youtube {
          background: #ff0000;
          color: white;
        }

        .platform-icon.tiktok {
          background: #000000;
          color: white;
        }

        .platform-icon.instagram {
          background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
          color: white;
        }

        .platform-info h5 {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .platform-info p {
          margin: 0;
          font-size: 0.85rem;
          color: #666;
        }

        .manual-check-section {
          margin-bottom: 32px;
        }

        .check-card {
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
        }

        .check-header {
          margin-bottom: 24px;
        }

        .check-header h4 {
          margin: 0 0 8px 0;
          font-size: 1.4rem;
          font-weight: 500;
          color: #1a1a1a;
        }

        .check-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .check-info {
          margin-bottom: 32px;
        }

        .check-actions {
          margin-top: 24px;
        }

        .check-btn {
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 6px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
          min-width: 280px;
        }

        .check-btn:hover:not(:disabled) {
          background: #333;
          transform: translateY(-1px);
        }

        .check-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .settings-tab {
            padding: 20px;
          }

          .section {
            padding: 24px 20px;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .note-grid {
            grid-template-columns: 1fr;
          }

          .settings-nav {
            flex-direction: column;
            gap: 4px;
          }

          .nav-btn {
            text-align: center;
          }

          .form-actions {
            flex-direction: column;
          }

          .input-group {
            flex-direction: column;
            align-items: stretch;
          }

          .instruction-header {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          .step {
            flex-direction: column;
            gap: 12px;
          }

          .step-number {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
