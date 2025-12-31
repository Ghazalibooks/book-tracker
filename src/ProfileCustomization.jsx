// 🎭 PROFILE CUSTOMIZATION SYSTEM
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User, Crown, Star, Sparkles, Image, Frame } from 'lucide-react';
import { SimpleAvatar } from './AvatarBuilder';

const PROFILE_FRAMES = [
  { id: 'none', name: 'No Frame', color: 'transparent', price: 0, image: null },
  { id: 'gold', name: 'Gold Frame', color: '#FFD700', price: 200, gradient: 'linear-gradient(45deg, #FFD700, #FFA500)' },
  { id: 'diamond', name: 'Diamond Frame', color: '#B9F2FF', price: 500, gradient: 'linear-gradient(45deg, #B9F2FF, #7DD3FC)' },
  { id: 'rainbow', name: 'Rainbow Frame', color: 'rainbow', price: 800, gradient: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' },
  { id: 'fire', name: 'Fire Frame', color: '#FF4500', price: 600, gradient: 'linear-gradient(45deg, #FF4500, #FFD700)' },
  { id: 'ice', name: 'Ice Frame', color: '#00CED1', price: 600, gradient: 'linear-gradient(45deg, #00CED1, #E0F7FA)' },
  { id: 'cosmic', name: 'Cosmic Frame', color: '#4B0082', price: 1000, gradient: 'linear-gradient(45deg, #4B0082, #9400D3, #FF00FF)' },
  { id: 'emerald', name: 'Emerald Frame', color: '#50C878', price: 700, gradient: 'linear-gradient(45deg, #50C878, #00FF7F)' }
];

const PROFILE_BACKGROUNDS = [
  { id: 'none', name: 'Default', preview: 'var(--bg-card)', price: 0 },
  { id: 'stars', name: 'Starry Night', preview: 'url(data:image/svg+xml,...)', price: 300 },
  { id: 'books', name: 'Book Shelf', preview: 'url(data:image/svg+xml,...)', price: 400 },
  { id: 'gradient1', name: 'Purple Dream', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', price: 200 },
  { id: 'gradient2', name: 'Ocean Breeze', preview: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)', price: 200 },
  { id: 'gradient3', name: 'Sunset', preview: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)', price: 200 }
];

const CUSTOM_TITLES = [
  { id: 'bookworm', name: 'Bookworm 📚', price: 100, requirement: 'Read 10 books' },
  { id: 'scholar', name: 'Scholar 🎓', price: 200, requirement: 'Read 50 books' },
  { id: 'master', name: 'Master Reader 👑', price: 500, requirement: 'Read 100 books' },
  { id: 'legend', name: 'Reading Legend ⭐', price: 1000, requirement: 'Read 500 books' },
  { id: 'speedster', name: 'Speed Reader ⚡', price: 300, requirement: 'Read 1000 pages in a week' },
  { id: 'night_owl', name: 'Night Owl 🦉', price: 150, requirement: 'Read at night 10 times' },
  { id: 'early_bird', name: 'Early Bird 🐦', price: 150, requirement: 'Read early morning 10 times' }
];

export function ProfileCustomizationView({ user, userData, showToast }) {
  const [selectedFrame, setSelectedFrame] = useState(userData?.profileFrame || 'none');
  const [selectedBackground, setSelectedBackground] = useState(userData?.profileBackground || 'none');
  const [selectedTitle, setSelectedTitle] = useState(userData?.customTitle || null);
  const [showPreview, setShowPreview] = useState(true);
  
  const saveCustomization = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        profileFrame: selectedFrame,
        profileBackground: selectedBackground,
        customTitle: selectedTitle
      });
      
      showToast("✅ Profile customization saved!");
    } catch (error) {
      console.error("Save customization error:", error);
      showToast("❌ Failed to save");
    }
  };
  
  const purchaseItem = async (itemId, price) => {
    if ((userData?.coins || 0) < price) {
      showToast("❌ Not enough coins!");
      return;
    }
    
    try {
      const inventory = userData?.inventory || [];
      await updateDoc(doc(db, "users", user.uid), {
        coins: (userData.coins || 0) - price,
        inventory: [...inventory, itemId]
      });
      
      showToast(`✅ Purchased! -${price} coins`);
    } catch (error) {
      showToast("❌ Purchase failed");
    }
  };
  
  const isOwned = (itemId) => {
    return (userData?.inventory || []).includes(itemId) || itemId === 'none';
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎭 Profile Customization</h1>
        <p className="page-subtitle">Make your profile unique!</p>
      </div>
      
      {/* Preview */}
      {showPreview && (
        <div className="cozy-card" style={{ padding: 40, marginBottom: 30, background: PROFILE_BACKGROUNDS.find(b => b.id === selectedBackground)?.preview || 'var(--bg-card)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
              <div style={{
                padding: 8,
                borderRadius: '50%',
                background: PROFILE_FRAMES.find(f => f.id === selectedFrame)?.gradient || 'transparent',
                display: 'inline-block'
              }}>
                <SimpleAvatar config={userData?.avatar} size={120} />
              </div>
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 8 }}>
              {userData?.displayName}
            </h2>
            
            {selectedTitle && (
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'var(--accent)',
                borderRadius: 20,
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: 12
              }}>
                {CUSTOM_TITLES.find(t => t.id === selectedTitle)?.name}
              </div>
            )}
            
            <div style={{ fontSize: '16px', opacity: 0.8 }}>
              Level {userData?.level || 1} • {userData?.xp || 0} XP
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Frames */}
      <div className="cozy-card" style={{ padding: 24, marginBottom: 30 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Frame size={20} /> Profile Frames
        </h3>
        
        <div className="desktop-grid-4">
          {PROFILE_FRAMES.map(frame => (
            <div
              key={frame.id}
              onClick={() => isOwned(frame.id) && setSelectedFrame(frame.id)}
              className="cozy-card"
              style={{
                padding: 20,
                cursor: isOwned(frame.id) ? 'pointer' : 'not-allowed',
                opacity: isOwned(frame.id) ? 1 : 0.5,
                border: selectedFrame === frame.id ? '3px solid var(--accent)' : 'none'
              }}
            >
              <div style={{ width: 80, height: 80, margin: '0 auto 12px', borderRadius: '50%', border: `6px solid transparent`, backgroundImage: frame.gradient, backgroundClip: 'padding-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-card)' }}></div>
              </div>
              
              <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginBottom: 4 }}>
                {frame.name}
              </div>
              
              {!isOwned(frame.id) ? (
                <button
                  onClick={(e) => { e.stopPropagation(); purchaseItem(frame.id, frame.price); }}
                  className="btn-main"
                  style={{ width: '100%', fontSize: '12px', padding: '6px' }}
                >
                  💰 {frame.price}
                </button>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--success)' }}>
                  ✅ Owned
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Profile Backgrounds */}
      <div className="cozy-card" style={{ padding: 24, marginBottom: 30 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image size={20} /> Profile Backgrounds
        </h3>
        
        <div className="desktop-grid-3">
          {PROFILE_BACKGROUNDS.map(bg => (
            <div
              key={bg.id}
              onClick={() => isOwned(bg.id) && setSelectedBackground(bg.id)}
              className="cozy-card"
              style={{
                padding: 0,
                cursor: isOwned(bg.id) ? 'pointer' : 'not-allowed',
                opacity: isOwned(bg.id) ? 1 : 0.5,
                border: selectedBackground === bg.id ? '3px solid var(--accent)' : 'none',
                overflow: 'hidden'
              }}
            >
              <div style={{ height: 120, background: bg.preview, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Preview
              </div>
              
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 8 }}>
                  {bg.name}
                </div>
                
                {!isOwned(bg.id) ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); purchaseItem(bg.id, bg.price); }}
                    className="btn-main"
                    style={{ width: '100%', fontSize: '12px', padding: '6px' }}
                  >
                    💰 {bg.price}
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--success)' }}>
                    ✅ Owned
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom Titles */}
      <div className="cozy-card" style={{ padding: 24, marginBottom: 30 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Crown size={20} /> Custom Titles
        </h3>
        
        <div className="desktop-grid-2">
          {CUSTOM_TITLES.map(title => (
            <div
              key={title.id}
              onClick={() => isOwned(title.id) && setSelectedTitle(title.id)}
              className="cozy-card"
              style={{
                padding: 16,
                cursor: isOwned(title.id) ? 'pointer' : 'not-allowed',
                opacity: isOwned(title.id) ? 1 : 0.5,
                border: selectedTitle === title.id ? '3px solid var(--accent)' : 'none'
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 4 }}>
                {title.name}
              </div>
              
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: 12 }}>
                {title.requirement}
              </div>
              
              {!isOwned(title.id) ? (
                <button
                  onClick={(e) => { e.stopPropagation(); purchaseItem(title.id, title.price); }}
                  className="btn-main"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  💰 {title.price}
                </button>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--success)' }}>
                  ✅ Owned
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Save Button */}
      <button onClick={saveCustomization} className="btn-main" style={{ width: '100%', padding: '16px', fontSize: '18px' }}>
        <Star size={20} /> Save Customization
      </button>
    </div>
  );
}

export default ProfileCustomizationView;
