import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        // Store auth token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.role);
        
        // Store user info for students
        if (data.role === 'student') {
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          // Redirect to student dashboard
          router.push('/student-dashboard');
        } else {
          // Redirect to admin dashboard
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Head>
        <title>Admin Login - AlphaX Tracker</title>
        <meta name="description" content="Admin login for AlphaX Tracker" />
      </Head>

      <div className="login-card">
        <div className="logo-section">
          <h1>AlphaX Tracker</h1>
          <p>Alpha High School</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              placeholder="firstname.lastname@alpha.school"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="login-btn"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="help-text">
          <p>Students: Use your school email and password</p>
          <p className="admin-note">Admin access requires special credentials</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          padding: 20px;
        }

        .login-card {
          background: white;
          padding: 48px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
          width: 100%;
          max-width: 420px;
          border: 1px solid #f0f0f0;
        }

        .logo-section {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .logo-section h1 {
          margin: 0;
          font-size: 1.8rem;
          color: #1a1a1a;
          font-weight: 400;
          letter-spacing: -0.5px;
        }

        .logo-section p {
          margin: 8px 0 0 0;
          color: #999;
          font-size: 0.95rem;
          font-weight: 300;
        }

        .login-form {
          width: 100%;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 400;
          color: #666;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 15px;
          transition: all 0.2s;
          box-sizing: border-box;
          background: #fafafa;
        }

        .form-group input:focus {
          outline: none;
          border-color: #1a1a1a;
          background: white;
        }

        .form-group input::placeholder {
          color: #bbb;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          border-left: 3px solid #dc2626;
          font-size: 0.9rem;
        }

        .login-btn {
          width: 100%;
          background: #1a1a1a;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-btn:hover:not(:disabled) {
          background: #333;
          transform: translateY(-1px);
        }

        .login-btn:disabled {
          background: #e0e0e0;
          color: #999;
          cursor: not-allowed;
          transform: none;
        }

        .help-text {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
        }

        .help-text p {
          color: #999;
          font-size: 0.85rem;
          margin: 0 0 4px 0;
          font-weight: 300;
        }

        .help-text .admin-note {
          color: #bbb;
          font-size: 0.8rem;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
          }
          
          .logo-section h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
