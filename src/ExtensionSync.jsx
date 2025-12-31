// EXTENSION SYNC COMPONENT - Add to Web App
// This component enables the extension to use the web app's authentication

import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { X, Chrome, Check, AlertCircle } from 'lucide-react';

export function ExtensionSync({ user }) {
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [synced, setSynced] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    checkExtension();
  }, []);

  useEffect(() => {
    if (user && extensionInstalled) {
      syncAuthToExtension();
    }
  }, [user, extensionInstalled]);

  // Check if extension is installed
  const checkExtension = () => {
    // Extension will set a flag in localStorage when loaded
    const hasExtension = localStorage.getItem('bookyo-extension-installed');
    setExtensionInstalled(!!hasExtension);
    
    // Listen for extension messages
    window.addEventListener('message', (event) => {
      if (event.data.type === 'BOOKYO_EXTENSION_PING') {
        setExtensionInstalled(true);
        localStorage.setItem('bookyo-extension-installed', 'true');
      }
    });
  };

  // Sync authentication to extension
  const syncAuthToExtension = async () => {
    if (!user) return;

    try {
      // Get Firebase ID token
      const token = await auth.currentUser.getIdToken();
      
      // Send to extension via postMessage
      window.postMessage({
        type: 'BOOKYO_AUTH_TOKEN',
        token: token,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      }, '*');

      setSynced(true);
      console.log('✅ Auth synced to extension');
    } catch (error) {
      console.error('❌ Sync error:', error);
    }
  };

  // Manual sync button
  const handleManualSync = async () => {
    await syncAuthToExtension();
  };

  if (!user) return null;
  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 20,
      zIndex: 1000,
      maxWidth: 350,
    }}>
      <div className="cozy-card" style={{
        padding: 16,
        background: extensionInstalled && synced 
          ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
          : extensionInstalled
          ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative'
      }}>
        <button
          onClick={() => setShowBanner(false)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 24,
            height: 24,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Chrome size={32} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>
              {extensionInstalled && synced ? '✅ Extension Synced' : 
               extensionInstalled ? '🔄 Extension Detected' : 
               '📥 Extension Available'}
            </div>
          </div>
        </div>

        {!extensionInstalled && (
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
            Install the Bookyo extension to quickly add books from any website!
          </div>
        )}

        {extensionInstalled && !synced && (
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
            Click to sync your account with the extension
          </div>
        )}

        {extensionInstalled && synced && (
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
            Your extension is connected and syncing!
          </div>
        )}

        {extensionInstalled && !synced && (
          <button
            onClick={handleManualSync}
            className="btn-main"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.25)',
              padding: '10px'
            }}
          >
            Sync Now
          </button>
        )}

        {!extensionInstalled && (
          <a
            href="https://chrome.google.com/webstore" // Update with actual extension URL when published
            target="_blank"
            rel="noopener noreferrer"
            className="btn-main"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.25)',
              padding: '10px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'block'
            }}
          >
            Get Extension
          </a>
        )}
      </div>
    </div>
  );
}

// Add this to App.jsx after login:
// {user && <ExtensionSync user={user} />}
