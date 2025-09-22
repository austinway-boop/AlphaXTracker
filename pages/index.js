import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={styles.container}>
      <style jsx global>{`
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
      `}</style>
      
      <div style={styles.hero}>
        <h1 style={styles.title}>🚀 AlphaX Tracker</h1>
        <p style={styles.subtitle}>Student Progress Tracking System</p>
        
        <div style={styles.buttonContainer}>
          <button onClick={() => router.push('/login')} style={styles.primaryButton}>
            Go to Login
          </button>
          <button onClick={() => router.push('/status')} style={styles.secondaryButton}>
            System Status
          </button>
        </div>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>👨‍💼 Admin Access</h3>
          <div style={styles.credentials}>
            <code>Admin@Alpha.school</code>
            <code>FutureOfEducation</code>
          </div>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>🎓 Demo Student</h3>
          <div style={styles.credentials}>
            <code>demo@alpha.school</code>
            <code>demo123</code>
          </div>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>📊 Features</h3>
          <ul style={styles.featureList}>
            <li>✓ Student Management</li>
            <li>✓ Progress Tracking</li>
            <li>✓ Social Media Monitoring</li>
            <li>✓ Google Sheets Integration</li>
          </ul>
        </div>
      </div>

      <div style={styles.statusBar}>
        <span style={styles.statusIndicator}>●</span>
        System Status: <strong>Operational</strong> | 
        Mode: <strong>{process.env.GOOGLE_SHEETS_CREDENTIALS ? 'Production' : 'Demo'}</strong>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: 'white'
  },
  hero: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '48px',
    margin: '0 0 10px 0',
    fontWeight: 'bold',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
  },
  subtitle: {
    fontSize: '20px',
    opacity: 0.9,
    marginBottom: '30px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '30px'
  },
  primaryButton: {
    padding: '12px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  secondaryButton: {
    padding: '12px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    width: '100%',
    marginBottom: '40px'
  },
  infoCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  cardTitle: {
    margin: '0 0 15px 0',
    fontSize: '20px'
  },
  credentials: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  featureList: {
    margin: 0,
    padding: '0 0 0 20px',
    lineHeight: '1.8'
  },
  statusBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '10px 20px',
    textAlign: 'center',
    fontSize: '14px'
  },
  statusIndicator: {
    color: '#4CAF50',
    marginRight: '8px',
    animation: 'pulse 2s infinite'
  }
};