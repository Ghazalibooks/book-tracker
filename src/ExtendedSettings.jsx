// ⚙️ EXTENDED SETTINGS SYSTEM
import { useState } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { Lock, Bell, Download, Trash2, Target, Eye, EyeOff, Globe, Moon, Sun, Zap, Shield } from 'lucide-react';

export function ExtendedSettingsView({ user, userData, showToast, onOpenAvatarBuilder }) {
  const [activeTab, setActiveTab] = useState('privacy');
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>
      
      {/* Tabs */}
      <div className="tab-container">
        {[
          { id: 'privacy', label: '🔒 Privacy', icon: Lock },
          { id: 'notifications', label: '🔔 Notifications', icon: Bell },
          { id: 'goals', label: '🎯 Goals', icon: Target },
          { id: 'accessibility', label: '♿ Accessibility', icon: Eye },
          { id: 'data', label: '💾 Data', icon: Download },
          { id: 'account', label: '👤 Account', icon: Shield }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      {activeTab === 'privacy' && <PrivacySettings user={user} userData={userData} showToast={showToast} />}
      {activeTab === 'notifications' && <NotificationSettings user={user} userData={userData} showToast={showToast} />}
      {activeTab === 'goals' && <GoalsSettings user={user} userData={userData} showToast={showToast} />}
      {activeTab === 'accessibility' && <AccessibilitySettings user={user} userData={userData} showToast={showToast} />}
      {activeTab === 'data' && <DataSettings user={user} userData={userData} showToast={showToast} />}
      {activeTab === 'account' && <AccountSettings user={user} userData={userData} showToast={showToast} />}
    </div>
  );
}

function PrivacySettings({ user, userData, showToast }) {
  const [profileVisibility, setProfileVisibility] = useState(userData?.privacy?.profileVisibility || 'public');
  const [readingActivity, setReadingActivity] = useState(userData?.privacy?.readingActivity !== false);
  const [showStatistics, setShowStatistics] = useState(userData?.privacy?.showStatistics !== false);
  const [allowMessages, setAllowMessages] = useState(userData?.privacy?.allowMessages !== false);
  
  const savePrivacySettings = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        privacy: {
          profileVisibility,
          readingActivity,
          showStatistics,
          allowMessages
        }
      }, { merge: true });
      showToast("✅ Privacy settings saved!");
    } catch (error) {
      console.error("Save privacy error:", error);
      showToast("❌ Failed to save");
    }
  };
  
  return (
    <div>
      <div className="cozy-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 16 }}>Profile Visibility</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {[
            { value: 'public', label: 'Public', desc: 'Everyone can see your profile' },
            { value: 'friends', label: 'Friends Only', desc: 'Only your friends can see' },
            { value: 'private', label: 'Private', desc: 'Only you can see' }
          ].map(option => (
            <label key={option.value} style={{
              padding: 16,
              background: profileVisibility === option.value ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={profileVisibility === option.value}
                onChange={(e) => setProfileVisibility(e.target.value)}
                style={{ width: 20, height: 20 }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: 4 }}>{option.label}</div>
                <div style={{ fontSize: '13px', opacity: 0.7 }}>{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      <div className="cozy-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 16 }}>Activity Settings</h3>
        
        <ToggleSetting
          label="Show Reading Activity"
          description="Let friends see what you're reading"
          checked={readingActivity}
          onChange={setReadingActivity}
        />
        
        <ToggleSetting
          label="Show Statistics"
          description="Display your reading stats on your profile"
          checked={showStatistics}
          onChange={setShowStatistics}
        />
        
        <ToggleSetting
          label="Allow Messages"
          description="Let other users send you messages"
          checked={allowMessages}
          onChange={setAllowMessages}
        />
      </div>
      
      <button onClick={savePrivacySettings} className="btn-main" style={{ width: '100%' }}>
        💾 Save Privacy Settings
      </button>
    </div>
  );
}

function NotificationSettings({ user, userData, showToast }) {
  const [emailNotifs, setEmailNotifs] = useState(userData?.notifications?.email !== false);
  const [pushNotifs, setPushNotifs] = useState(userData?.notifications?.push !== false);
  const [friendActivity, setFriendActivity] = useState(userData?.notifications?.friendActivity !== false);
  const [achievements, setAchievements] = useState(userData?.notifications?.achievements !== false);
  const [reminders, setReminders] = useState(userData?.notifications?.reminders !== false);
  
  const saveNotificationSettings = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        notifications: {
          email: emailNotifs,
          push: pushNotifs,
          friendActivity,
          achievements,
          reminders
        }
      }, { merge: true });
      showToast("✅ Notification settings saved!");
    } catch (error) {
      showToast("❌ Failed to save");
    }
  };
  
  return (
    <div>
      <div className="cozy-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 16 }}>Notification Channels</h3>
        
        <ToggleSetting
          label="Email Notifications"
          description="Receive notifications via email"
          checked={emailNotifs}
          onChange={setEmailNotifs}
        />
        
        <ToggleSetting
          label="Push Notifications"
          description="Receive push notifications in browser"
          checked={pushNotifs}
          onChange={setPushNotifs}
        />
      </div>
      
      <div className="cozy-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 16 }}>Notification Types</h3>
        
        <ToggleSetting
          label="Friend Activity"
          description="When friends finish books or post reviews"
          checked={friendActivity}
          onChange={setFriendActivity}
        />
        
        <ToggleSetting
          label="Achievements"
          description="When you unlock new achievements"
          checked={achievements}
          onChange={setAchievements}
        />
        
        <ToggleSetting
          label="Reading Reminders"
          description="Daily reminders to read"
          checked={reminders}
          onChange={setReminders}
        />
      </div>
      
      <button onClick={saveNotificationSettings} className="btn-main" style={{ width: '100%' }}>
        💾 Save Notification Settings
      </button>
    </div>
  );
}

function GoalsSettings({ user, userData, showToast }) {
  const [dailyGoal, setDailyGoal] = useState(userData?.goals?.daily || 30);
  const [weeklyGoal, setWeeklyGoal] = useState(userData?.goals?.weekly || 200);
  const [monthlyGoal, setMonthlyGoal] = useState(userData?.goals?.monthly || 1000);
  const [yearlyBooks, setYearlyBooks] = useState(userData?.goals?.yearlyBooks || 12);
  
  const saveGoals = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        goals: {
          daily: dailyGoal,
          weekly: weeklyGoal,
          monthly: monthlyGoal,
          yearlyBooks
        }
      }, { merge: true });
      showToast("✅ Goals updated!");
    } catch (error) {
      showToast("❌ Failed to save");
    }
  };
  
  return (
    <div>
      <div className="cozy-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 16 }}>Reading Goals</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: 8, opacity: 0.7 }}>
              Daily Reading (minutes)
            </label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value) || 0)}
              className="input"
              min="0"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: 8, opacity: 0.7 }}>
              Weekly Reading (minutes)
            </label>
            <input
              type="number"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 0)}
              className="input"
              min="0"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: 8, opacity: 0.7 }}>
              Monthly Pages
            </label>
            <input
              type="number"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(parseInt(e.target.value) || 0)}
              className="input"
              min="0"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: 8, opacity: 0.7 }}>
              Yearly Books
            </label>
            <input
              type="number"
              value={yearlyBooks}
              onChange={(e) => setYearlyBooks(parseInt(e.target.value) || 0)}
              className="input"
              min="0"
            />
          </div>
        </div>
      </div>
      
      <button onClick={saveGoals} className="btn-main" style={{ width: '100%' }}>
        🎯 Save Goals
      </button>
    </div>
  );
}

function AccessibilitySettings({ user, userData, showToast }) {
  const [fontSize, setFontSize] = useState(userData?.accessibility?.fontSize || 'normal');
  const [highContrast, setHighContrast] = useState(userData?.accessibility?.highContrast || false);
  const [reduceMotion, setReduceMotion] = useState(userData?.accessibility?.reduceMotion || false);
  const [dyslexicFont, setDyslexicFont] = useState(userData?.accessibility?.dyslexicFont || false);
  
  const saveAccessibility = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        accessibility: {
          fontSize,
          highContrast,
          reduceMotion,
          dyslexicFont
        }
      }, { merge: true });
      showToast("✅ Accessibility settings saved!");
    } catch (error) {
      showToast("❌ Failed to save");
    }
  };
  
  return (
    <div>
      <div className="cozy-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 16 }}>Display</h3>
        
        <label style={{ display: 'block', fontSize: '14px', marginBottom: 8, opacity: 0.7 }}>
          Font Size
        </label>
        <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="input" style={{ marginBottom: 20 }}>
          <option value="small">Small</option>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
          <option value="xlarge">Extra Large</option>
        </select>
        
        <ToggleSetting
          label="High Contrast"
          description="Increase contrast for better readability"
          checked={highContrast}
          onChange={setHighContrast}
        />
        
        <ToggleSetting
          label="Reduce Motion"
          description="Minimize animations and transitions"
          checked={reduceMotion}
          onChange={setReduceMotion}
        />
        
        <ToggleSetting
          label="Dyslexic-Friendly Font"
          description="Use OpenDyslexic font"
          checked={dyslexicFont}
          onChange={setDyslexicFont}
        />
      </div>
      
      <button onClick={saveAccessibility} className="btn-main" style={{ width: '100%' }}>
        💾 Save Accessibility Settings
      </button>
    </div>
  );
}

function DataSettings({ user, userData, showToast }) {
  const exportData = async () => {
    try {
      const dataToExport = {
        user: userData,
        exportDate: new Date().toISOString(),
        format: 'JSON'
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookyo-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      showToast("✅ Data exported!");
    } catch (error) {
      console.error("Export error:", error);
      showToast("❌ Export failed");
    }
  };
  
  return (
    <div>
      <div className="cozy-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 8 }}>💾 Export Your Data</h3>
        <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: 16 }}>
          Download all your reading data in JSON format
        </p>
        <button onClick={exportData} className="btn-main" style={{ width: '100%' }}>
          <Download size={18} /> Export Data
        </button>
      </div>
      
      <div className="cozy-card" style={{ padding: 24, background: 'rgba(255, 107, 107, 0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 8, color: '#FF6B6B' }}>
          ⚠️ Data Privacy
        </h3>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          Your data is stored securely and never shared with third parties. 
          You have full control over your information.
        </p>
      </div>
    </div>
  );
}

function AccountSettings({ user, userData, showToast }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast("❌ Please type DELETE to confirm");
      return;
    }
    
    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", user.uid));
      
      // Delete auth user
      await deleteUser(auth.currentUser);
      
      showToast("✅ Account deleted");
    } catch (error) {
      console.error("Delete account error:", error);
      showToast("❌ Failed to delete account. Please re-login and try again.");
    }
  };
  
  return (
    <div>
      <div className="cozy-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 16 }}>Account Information</h3>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: 4 }}>Email</div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>{user.email}</div>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: 4 }}>Member Since</div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>
            {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: 4 }}>User ID</div>
          <div style={{ fontSize: '12px', fontFamily: 'monospace', opacity: 0.6 }}>{user.uid}</div>
        </div>
      </div>
      
      <div className="cozy-card" style={{ padding: 24, background: 'rgba(244, 67, 54, 0.1)', border: '2px solid #F44336' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 8, color: '#F44336' }}>
          🗑️ Delete Account
        </h3>
        <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: 16 }}>
          This action is permanent and cannot be undone. All your data will be deleted.
        </p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-ghost"
            style={{ width: '100%', color: '#F44336', borderColor: '#F44336' }}
          >
            <Trash2 size={18} /> Delete My Account
          </button>
        ) : (
          <div>
            <input
              type="text"
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="input"
              style={{ marginBottom: 12, borderColor: '#F44336' }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn-main"
                style={{ flex: 1, background: '#F44336' }}
              >
                <Trash2 size={18} /> Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div>
        <div style={{ fontWeight: '600', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '13px', opacity: 0.7 }}>{description}</div>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 26 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: checked ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
          transition: '0.3s',
          borderRadius: 26,
        }}>
          <span style={{
            position: 'absolute',
            content: '',
            height: 20,
            width: 20,
            left: checked ? 27 : 3,
            bottom: 3,
            background: 'white',
            transition: '0.3s',
            borderRadius: '50%'
          }}></span>
        </span>
      </label>
    </div>
  );
}

export default ExtendedSettingsView;