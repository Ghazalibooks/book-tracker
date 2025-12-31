// 🎨 THEME CREATOR SYSTEM
import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { Palette, Save, Eye, Download, Upload, Star, Trash2 } from 'lucide-react';

export function ThemeCreatorView({ user, userData, showToast }) {
  const [customTheme, setCustomTheme] = useState({
    name: 'My Custom Theme',
    primary: '#9333EA',
    secondary: '#A855F7',
    accent: '#C084FC',
    background: '#1a1a1a',
    card: '#2a2a2a',
    text: '#ffffff'
  });
  
  const [savedThemes, setSavedThemes] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  useEffect(() => {
    loadSavedThemes();
  }, [userData]);
  
  const loadSavedThemes = () => {
    setSavedThemes(userData?.customThemes || []);
  };
  
  const saveTheme = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        customThemes: arrayUnion(customTheme)
      });
      
      showToast(`✅ Theme "${customTheme.name}" saved!`);
      await loadSavedThemes();
    } catch (error) {
      console.error("Save theme error:", error);
      showToast("❌ Failed to save theme");
    }
  };
  
  const applyTheme = (theme) => {
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--secondary', theme.secondary);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--bg-main', theme.background);
    document.documentElement.style.setProperty('--bg-card', theme.card);
    document.documentElement.style.setProperty('--text-primary', theme.text);
    
    showToast(`✅ Applied theme: ${theme.name}`);
  };
  
  const exportTheme = () => {
    const themeData = JSON.stringify(customTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customTheme.name.replace(/\s/g, '_')}.json`;
    a.click();
    showToast("✅ Theme exported!");
  };
  
  const importTheme = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setCustomTheme(imported);
        showToast("✅ Theme imported!");
      } catch (error) {
        showToast("❌ Invalid theme file");
      }
    };
    reader.readAsText(file);
  };
  
  const presetThemes = [
    {
      name: 'Ocean Blue',
      primary: '#0077BE',
      secondary: '#00A8E8',
      accent: '#00D9FF',
      background: '#001F3F',
      card: '#003366',
      text: '#ffffff'
    },
    {
      name: 'Forest Green',
      primary: '#2D6A4F',
      secondary: '#40916C',
      accent: '#52B788',
      background: '#1B4332',
      card: '#2D6A4F',
      text: '#ffffff'
    },
    {
      name: 'Sunset Orange',
      primary: '#FF6B35',
      secondary: '#FF8C42',
      accent: '#FFAD5A',
      background: '#2B2118',
      card: '#3D2E24',
      text: '#ffffff'
    },
    {
      name: 'Royal Purple',
      primary: '#6A0572',
      secondary: '#AB83A1',
      accent: '#C3B1E1',
      background: '#1A1423',
      card: '#2D1B3D',
      text: '#ffffff'
    }
  ];
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎨 Theme Creator</h1>
        <p className="page-subtitle">Design your perfect reading experience</p>
      </div>
      
      {/* Color Customization */}
      <div className="desktop-grid-2" style={{ marginBottom: 30 }}>
        <div className="cozy-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>
            Customize Colors
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ColorPicker
              label="Theme Name"
              value={customTheme.name}
              onChange={(value) => setCustomTheme({ ...customTheme, name: value })}
              type="text"
            />
            
            <ColorPicker
              label="Primary Color"
              value={customTheme.primary}
              onChange={(value) => setCustomTheme({ ...customTheme, primary: value })}
            />
            
            <ColorPicker
              label="Secondary Color"
              value={customTheme.secondary}
              onChange={(value) => setCustomTheme({ ...customTheme, secondary: value })}
            />
            
            <ColorPicker
              label="Accent Color"
              value={customTheme.accent}
              onChange={(value) => setCustomTheme({ ...customTheme, accent: value })}
            />
            
            <ColorPicker
              label="Background"
              value={customTheme.background}
              onChange={(value) => setCustomTheme({ ...customTheme, background: value })}
            />
            
            <ColorPicker
              label="Card Background"
              value={customTheme.card}
              onChange={(value) => setCustomTheme({ ...customTheme, card: value })}
            />
            
            <ColorPicker
              label="Text Color"
              value={customTheme.text}
              onChange={(value) => setCustomTheme({ ...customTheme, text: value })}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={saveTheme} className="btn-main" style={{ flex: 1 }}>
              <Save size={16} /> Save Theme
            </button>
            <button onClick={() => applyTheme(customTheme)} className="btn-main" style={{ flex: 1, background: 'var(--success)' }}>
              <Eye size={16} /> Preview
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button onClick={exportTheme} className="btn-ghost" style={{ flex: 1 }}>
              <Download size={16} /> Export
            </button>
            <label className="btn-ghost" style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Upload size={16} /> Import
              <input type="file" accept=".json" onChange={importTheme} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        
        {/* Preview */}
        <div className="cozy-card" style={{ padding: 24, background: customTheme.background }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20, color: customTheme.text }}>
            Theme Preview
          </h3>
          
          <div style={{ background: customTheme.card, padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 8, color: customTheme.text }}>
              Card Example
            </div>
            <div style={{ fontSize: '14px', marginBottom: 12, color: customTheme.text, opacity: 0.8 }}>
              This is how text will look on cards
            </div>
            <button style={{
              background: customTheme.primary,
              color: customTheme.text,
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              marginRight: 8,
              cursor: 'pointer'
            }}>
              Primary Button
            </button>
            <button style={{
              background: customTheme.accent,
              color: customTheme.text,
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer'
            }}>
              Accent Button
            </button>
          </div>
          
          <div style={{ padding: 16, background: customTheme.primary, borderRadius: 12, marginBottom: 16, color: customTheme.text }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Primary Background</div>
          </div>
          
          <div style={{ padding: 16, background: customTheme.secondary, borderRadius: 12, marginBottom: 16, color: customTheme.text }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Secondary Background</div>
          </div>
          
          <div style={{ padding: 16, background: customTheme.accent, borderRadius: 12, color: customTheme.text }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Accent Background</div>
          </div>
        </div>
      </div>
      
      {/* Preset Themes */}
      <div className="cozy-card" style={{ padding: 24, marginBottom: 30 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>
          Preset Themes
        </h3>
        <div className="desktop-grid-4">
          {presetThemes.map(theme => (
            <div
              key={theme.name}
              onClick={() => setCustomTheme(theme)}
              className="cozy-card"
              style={{
                padding: 16,
                cursor: 'pointer',
                background: theme.background,
                border: customTheme.name === theme.name ? `3px solid ${theme.accent}` : 'none'
              }}
            >
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 4, background: theme.primary }}></div>
                <div style={{ width: 30, height: 30, borderRadius: 4, background: theme.secondary }}></div>
                <div style={{ width: 30, height: 30, borderRadius: 4, background: theme.accent }}></div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text }}>
                {theme.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Saved Themes */}
      {savedThemes.length > 0 && (
        <div className="cozy-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>
            Your Saved Themes
          </h3>
          <div className="desktop-grid-4">
            {savedThemes.map((theme, i) => (
              <div key={i} className="cozy-card" style={{ padding: 16, background: theme.background }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 4, background: theme.primary }}></div>
                  <div style={{ width: 30, height: 30, borderRadius: 4, background: theme.secondary }}></div>
                  <div style={{ width: 30, height: 30, borderRadius: 4, background: theme.accent }}></div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 8, color: theme.text }}>
                  {theme.name}
                </div>
                <button onClick={() => applyTheme(theme)} className="btn-main" style={{ width: '100%', fontSize: '12px', padding: '6px 12px' }}>
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ColorPicker({ label, value, onChange, type = 'color' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input"
          style={{ flex: type === 'color' ? 0 : 1, width: type === 'color' ? 60 : 'auto', height: type === 'color' ? 40 : 'auto' }}
        />
        {type === 'color' && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input"
            style={{ flex: 1 }}
            placeholder="#000000"
          />
        )}
      </div>
    </div>
  );
}

export default ThemeCreatorView;
