import { useEffect, useState } from 'react';

export default function StatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/admin/check-config');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        status: 'error',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>System Status</h1>
        <p>Checking configuration...</p>
      </div>
    );
  }

  const isHealthy = status?.status === 'healthy';

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <style jsx>{`
        .status-page {
          background: #f5f5f5;
          min-height: 100vh;
        }
        .status-header {
          background: ${isHealthy ? '#4caf50' : '#f44336'};
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .check-section {
          background: white;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .check-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          margin-left: 10px;
        }
        .status-ok {
          background: #4caf50;
        }
        .status-error {
          background: #f44336;
        }
        .detail-item {
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .detail-item:last-child {
          border-bottom: none;
        }
        .recommendation {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 12px;
          border-radius: 4px;
          margin-top: 10px;
        }
        .code-block {
          background: #f5f5f5;
          padding: 8px;
          border-radius: 4px;
          font-family: monospace;
          word-break: break-all;
          margin: 5px 0;
        }
        .success { color: #4caf50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
      `}</style>

      <div className="status-header">
        <h1>System Status: {isHealthy ? '✓ Healthy' : '✗ Unhealthy'}</h1>
        <p>Timestamp: {status?.timestamp || 'Unknown'}</p>
        <p>Environment: {status?.environment || 'Unknown'}</p>
      </div>

      {status?.checks?.environmentVariables && (
        <div className="check-section">
          <div className="check-title">
            Environment Variables
            <span className={`status-badge status-${status.checks.environmentVariables.status}`}>
              {status.checks.environmentVariables.status.toUpperCase()}
            </span>
          </div>
          
          {Object.entries(status.checks.environmentVariables.details || {}).map(([key, value]) => (
            <div key={key} className="detail-item">
              <strong>{key}:</strong>
              {value.exists ? (
                <span className="success"> ✓ Set</span>
              ) : (
                <span className="error"> ✗ Not Set</span>
              )}
              {value.valid === false && (
                <span className="error"> (Invalid Format: {value.error})</span>
              )}
              {value.serviceAccount && (
                <div className="code-block">Service Account: {value.serviceAccount}</div>
              )}
              {value.value && key === 'GOOGLE_SHEET_ID' && (
                <div className="code-block">Sheet ID: {value.value}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {status?.checks?.googleSheets && (
        <div className="check-section">
          <div className="check-title">
            Google Sheets Connection
            <span className={`status-badge status-${status.checks.googleSheets.status}`}>
              {status.checks.googleSheets.status.toUpperCase()}
            </span>
          </div>
          
          <div className="detail-item">
            <strong>Initialized:</strong> {status.checks.googleSheets.initialized ? '✓ Yes' : '✗ No'}
          </div>
          {status.checks.googleSheets.spreadsheetId && (
            <div className="detail-item">
              <strong>Spreadsheet ID:</strong>
              <div className="code-block">{status.checks.googleSheets.spreadsheetId}</div>
            </div>
          )}
          {status.checks.googleSheets.canRead !== undefined && (
            <div className="detail-item">
              <strong>Can Read Data:</strong> {status.checks.googleSheets.canRead ? '✓ Yes' : '✗ No'}
              {status.checks.googleSheets.studentCount !== undefined && (
                <span> ({status.checks.googleSheets.studentCount} students found)</span>
              )}
            </div>
          )}
          {status.checks.googleSheets.error && (
            <div className="detail-item error">
              <strong>Error:</strong> {status.checks.googleSheets.error}
            </div>
          )}
        </div>
      )}

      {status?.recommendations && status.recommendations.length > 0 && (
        <div className="check-section">
          <div className="check-title">Recommendations</div>
          {status.recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation">
              {idx + 1}. {rec}
            </div>
          ))}
        </div>
      )}

      <div className="check-section">
        <div className="check-title">Quick Setup Guide</div>
        <ol>
          <li>Go to <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">Vercel Dashboard</a></li>
          <li>Select your AlphaXTracker project</li>
          <li>Navigate to Settings → Environment Variables</li>
          <li>Add the required variables shown above</li>
          <li>Redeploy your application</li>
        </ol>
        
        <div style={{ marginTop: '20px' }}>
          <strong>Need the environment values?</strong>
          <p>Check the <code>VERCEL_ENV_VALUES.md</code> file in your project root for the exact values to copy.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}
