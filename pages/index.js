import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token) {
      if (userRole === 'admin') {
        router.push('/dashboard');
      } else if (userRole === 'student') {
        router.push('/student-dashboard');
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);
  const [formData, setFormData] = useState({
    userEmail: '',
    userId: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/slack/test-connection');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: 'Failed to test connection'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendDM = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/slack/send-dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>AlphaX Slack Bot</title>
        <meta name="description" content="Send direct messages via Slack bot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">
          AlphaX Slack Bot 🤖
        </h1>

        <p className="description">
          Send direct messages to Slack users
        </p>

        {/* Connection Test */}
        <div className="card">
          <h3>Connection Test</h3>
          <button 
            onClick={testConnection} 
            disabled={loading}
            className="test-btn"
          >
            {loading ? 'Testing...' : 'Test Slack Connection'}
          </button>
          
          {connectionStatus && (
            <div className={`status ${connectionStatus.success ? 'success' : 'error'}`}>
              {connectionStatus.success ? (
                <div>
                  ✅ Connected as: <strong>{connectionStatus.bot.name}</strong>
                  <br />
                  Team: {connectionStatus.bot.team}
                </div>
              ) : (
                <div>
                  ❌ Connection failed: {connectionStatus.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Send DM Form */}
        <div className="card">
          <h3>Send Direct Message</h3>
          <form onSubmit={sendDM}>
            <div className="form-group">
              <label htmlFor="userEmail">User Email:</label>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleInputChange}
                placeholder="user@company.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="userId">Or User ID:</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                placeholder="U1234567890"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Your message here..."
                required
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || (!formData.userEmail && !formData.userId)}
              className="send-btn"
            >
              {loading ? 'Sending...' : 'Send DM'}
            </button>
          </form>

          {result && (
            <div className={`result ${result.success ? 'success' : 'error'}`}>
              {result.success ? (
                <div>
                  ✅ Message sent successfully!
                  <br />
                  <small>Channel: {result.data.channel}</small>
                </div>
              ) : (
                <div>
                  ❌ Failed to send message: {result.message || result.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Usage Examples */}
        <div className="card">
          <h3>API Usage</h3>
          <p>You can also use the API directly:</p>
          <pre className="code-block">
{`POST /api/slack/send-dm
Content-Type: application/json

{
  "userEmail": "user@company.com",
  "message": "Hello from the bot!"
}`}
          </pre>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
          width: 100%;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          color: white;
          text-align: center;
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          color: white;
          margin-bottom: 2rem;
        }

        .card {
          margin: 1rem;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          background: white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 600px;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: #555;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .test-btn,
        .send-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          transition: background 0.2s;
        }

        .test-btn:hover,
        .send-btn:hover {
          background: #5a67d8;
        }

        .test-btn:disabled,
        .send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .status,
        .result {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
          font-weight: bold;
        }

        .status.success,
        .result.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status.error,
        .result.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .code-block {
          background: #f4f4f4;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9rem;
        }

        @media (max-width: 600px) {
          .title {
            font-size: 2.5rem;
          }
          
          .card {
            margin: 0.5rem;
            padding: 1rem;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
