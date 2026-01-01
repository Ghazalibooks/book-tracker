import { useState, useEffect } from 'react';
import { auth } from './firebase';

export function ExtensionSync({ user }) {
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    console.log('🔍 ExtensionSync mounted! User:', user?.email);
    
    // Force detect after short delay
    setTimeout(() => {
      console.log('🔍 Checking for extension...');
      const hasExtension = localStorage.getItem('bookyo-extension-enabled') === 'true';
      console.log('🔍 localStorage check:', hasExtension);
      
      if (hasExtension) {
        console.log('📡 Extension detected via localStorage!');
        setExtensionDetected(true);
      } else {
        console.log('⚠️ Extension not detected in localStorage');
      }
    }, 500);

    const handleMessage = (event) => {
      console.log('📨 Message received:', event.data.type);
      
      if (event.data.type === 'BOOKYO_EXTENSION_PING') {
        console.log('📡 Extension detected via ping!');
        setExtensionDetected(true);
      }
      
      if (event.data.type === 'BOOKYO_EXTENSION_SYNCED') {
        console.log('✅ Extension synced!');
        setSynced(true);
        setSyncing(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Ping the extension
    console.log('📤 Sending ping to extension...');
    window.postMessage({ type: 'BOOKYO_APP_PING' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [user]);

  const handleSync = async () => {
    if (!user || syncing) return;

    try {
      setSyncing(true);
      console.log('🔄 Syncing extension...');

      const token = await auth.currentUser.getIdToken();

      window.postMessage({
        type: 'BOOKYO_AUTH_TOKEN',
        token: token,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email
        }
      }, '*');

      console.log('✅ Auth token sent to extension');
    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncing(false);
      alert('Failed to sync extension');
    }
  };

  console.log('🎨 Rendering ExtensionSync. Detected:', extensionDetected);

  if (!extensionDetected) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 10000,
      background: synced ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '14px',
      fontWeight: '600'
    }}>
      {synced ? (
        <>
          <span>✅</span>
          <div>
            <div>Extension Synced!</div>
            <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: 'normal' }}>
              {user.email}
            </div>
          </div>
        </>
      ) : (
        <>
          <span>🔄</span>
          <div>
            <div>Extension Detected</div>
            <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: 'normal' }}>
              Click to sync
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              background: 'white',
              color: '#f59e0b',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            {syncing ? '⏳ Syncing...' : 'Sync Now'}
          </button>
        </>
      )}
    </div>
  );
}
