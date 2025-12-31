// 🎨 AVATAR BUILDER - WORKING VERSION WITH REAL UPDATES
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from './firebase';
import { X, Check, ShoppingCart, Lock, Sparkles } from 'lucide-react';

// COMPLETE AVATAR CONFIGURATION
export const AVATAR_CONFIG = {
  skinTones: [
    { id: 'light', name: 'Light', color: '#FFE0BD', price: 0 },
    { id: 'fair', name: 'Fair', color: '#F1C27D', price: 0 },
    { id: 'medium', name: 'Medium', color: '#C68642', price: 0 },
    { id: 'tan', name: 'Tan', color: '#8D5524', price: 50 },
    { id: 'brown', name: 'Brown', color: '#6F4E37', price: 50 },
    { id: 'dark', name: 'Dark', color: '#4A3728', price: 50 }
  ],
  
  hairStyles: [
    { id: 'short', name: 'Short', icon: '✂️', price: 0 },
    { id: 'long', name: 'Long', icon: '💇‍♀️', price: 50 },
    { id: 'curly', name: 'Curly', icon: '🌀', price: 100 },
    { id: 'ponytail', name: 'Ponytail', icon: '🎀', price: 100 },
    { id: 'braid', name: 'Braids', icon: '🪢', price: 150 },
    { id: 'mohawk', name: 'Mohawk', icon: '🦅', price: 200 },
    { id: 'bald', name: 'Bald', icon: '🥚', price: 0 },
    { id: 'afro', name: 'Afro', icon: '☁️', price: 200 }
  ],
  
  hairColors: [
    { id: 'black', name: 'Black', color: '#1C1C1C', price: 0 },
    { id: 'brown', name: 'Brown', color: '#5C4033', price: 0 },
    { id: 'blonde', name: 'Blonde', color: '#F0E68C', price: 50 },
    { id: 'red', name: 'Red', color: '#C04000', price: 100 },
    { id: 'gray', name: 'Gray', color: '#808080', price: 50 },
    { id: 'blue', name: 'Blue', color: '#4169E1', price: 200 },
    { id: 'pink', name: 'Pink', color: '#FF69B4', price: 200 },
    { id: 'purple', name: 'Purple', color: '#9370DB', price: 200 },
    { id: 'green', name: 'Green', color: '#32CD32', price: 200 }
  ],
  
  eyeShapes: [
    { id: 'round', name: 'Round', icon: '⭕', price: 0 },
    { id: 'almond', name: 'Almond', icon: '🔶', price: 50 },
    { id: 'cat', name: 'Cat Eyes', icon: '🐱', price: 100 },
    { id: 'sleepy', name: 'Sleepy', icon: '😴', price: 100 },
    { id: 'happy', name: 'Happy', icon: '😊', price: 0 },
    { id: 'anime', name: 'Anime', icon: '✨', price: 200, rarity: 'rare' }
  ],
  
  eyeColors: [
    { id: 'brown', name: 'Brown', color: '#5C4033', price: 0 },
    { id: 'blue', name: 'Blue', color: '#4169E1', price: 0 },
    { id: 'green', name: 'Green', color: '#228B22', price: 50 },
    { id: 'hazel', name: 'Hazel', color: '#8E7618', price: 50 },
    { id: 'gray', name: 'Gray', color: '#808080', price: 100 },
    { id: 'violet', name: 'Violet', color: '#8A2BE2', price: 200 }
  ],
  
  accessories: {
    glasses: [
      { id: 'none', name: 'None', icon: '❌', price: 0 },
      { id: 'nerd', name: 'Nerd', icon: '🤓', price: 100 },
      { id: 'aviator', name: 'Aviators', icon: '😎', price: 150 },
      { id: 'round', name: 'Round', icon: '⭕', price: 100 }
    ],
    
    hats: [
      { id: 'none', name: 'None', icon: '❌', price: 0 },
      { id: 'cap', name: 'Cap', icon: '🧢', price: 100 },
      { id: 'beanie', name: 'Beanie', icon: '🎿', price: 100 },
      { id: 'crown', name: 'Crown', icon: '👑', price: 500, rarity: 'legendary' }
    ]
  },
  
  clothing: [
    { id: 'tshirt', name: 'T-Shirt', icon: '👕', price: 0 },
    { id: 'hoodie', name: 'Hoodie', icon: '🧥', price: 150 },
    { id: 'suit', name: 'Suit', icon: '🤵', price: 300 }
  ],
  
  backgrounds: [
    { id: 'library', name: 'Library', icon: '📚', price: 0 },
    { id: 'space', name: 'Space', icon: '🌌', price: 200 },
    { id: 'neon', name: 'Neon City', icon: '🌆', price: 300, rarity: 'rare' }
  ]
};

export function AvatarBuilder({ user, userData, onClose, showToast }) {
  const [avatar, setAvatar] = useState(userData?.avatar || {
    skin: 'light',
    hairStyle: 'short',
    hairColor: 'black',
    eyeShape: 'round',
    eyeColor: 'brown',
    glasses: 'none',
    hat: 'none',
    clothing: 'tshirt',
    background: 'library'
  });
  
  const [activeTab, setActiveTab] = useState('body');
  const [coins, setCoins] = useState(userData?.coins || 0);
  const [inventory, setInventory] = useState(userData?.inventory || []);
  const [loading, setLoading] = useState(false);
  
  // Refresh user data when component mounts
  useEffect(() => {
    const refreshData = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCoins(data.coins || 0);
        setInventory(data.inventory || []);
        if (data.avatar) setAvatar(data.avatar);
      }
    };
    refreshData();
  }, [user.uid]);
  
  const isOwned = (itemId) => {
    if (itemId === 'none') return true;
    const item = findItemById(itemId);
    if (!item) return true;
    return item.price === 0 || inventory.includes(itemId);
  };
  
  const canAfford = (price) => coins >= price;
  
  const findItemById = (itemId) => {
    for (const category of Object.values(AVATAR_CONFIG)) {
      if (Array.isArray(category)) {
        const found = category.find(item => item.id === itemId);
        if (found) return found;
      } else if (typeof category === 'object') {
        for (const subcategory of Object.values(category)) {
          if (Array.isArray(subcategory)) {
            const found = subcategory.find(item => item.id === itemId);
            if (found) return found;
          }
        }
      }
    }
    return null;
  };
  
  const purchaseItem = async (itemId, price) => {
    if (!canAfford(price)) {
      showToast("❌ Not enough coins!");
      return false;
    }
    if (isOwned(itemId)) return true;
    
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      
      // Update Firestore
      await setDoc(userRef, {
        coins: increment(-price),
        inventory: arrayUnion(itemId)
      }, { merge: true });
      
      // Update local state
      setCoins(prev => prev - price);
      setInventory(prev => [...prev, itemId]);
      
      showToast(`✅ Purchased for ${price} coins!`);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Purchase error:", error);
      showToast("❌ Purchase failed!");
      setLoading(false);
      return false;
    }
  };
  
  const selectItem = async (category, itemId, price = 0) => {
    // Check if item needs to be purchased
    if (!isOwned(itemId) && price > 0) {
      const success = await purchaseItem(itemId, price);
      if (!success) return;
    }
    
    // Update avatar immediately
    setAvatar(prev => ({ ...prev, [category]: itemId }));
  };
  
  const saveAvatar = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        avatar: avatar
      }, { merge: true });
      
      showToast("✅ Avatar saved successfully!");
      setTimeout(() => onClose && onClose(), 500);
    } catch (error) {
      console.error("Save error:", error);
      showToast("❌ Failed to save avatar!");
    }
    setLoading(false);
  };
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 4 }}>🎨 Avatar Builder</h1>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Customize your character</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ 
              background: 'var(--grad-main)', 
              padding: '10px 20px', 
              borderRadius: 12, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: '18px' }}>💰</span>
              <span>{coins}</span>
            </div>
            <button onClick={onClose} className="btn-ghost" style={{ width: 44, height: 44, borderRadius: '50%', padding: 0 }}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Preview */}
        <div className="cozy-card" style={{ padding: 30, marginBottom: 25, textAlign: 'center', background: 'var(--grad-main)' }}>
          <div style={{ 
            width: 180, 
            height: 180, 
            margin: '0 auto 20px', 
            borderRadius: '50%', 
            overflow: 'hidden',
            border: '4px solid white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <SimpleAvatar config={avatar} size={180} />
          </div>
          
          <button 
            onClick={saveAvatar} 
            className="btn-main" 
            disabled={loading}
            style={{ 
              padding: '14px 32px', 
              fontSize: '16px',
              background: 'rgba(255,255,255,0.25)',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : <><Check size={18} /> Save Avatar</>}
          </button>
        </div>
        
        {/* Tabs */}
        <div className="tab-container">
          {[
            { id: 'body', label: 'Body', icon: '👤' },
            { id: 'hair', label: 'Hair', icon: '💇' },
            { id: 'eyes', label: 'Eyes', icon: '👁️' },
            { id: 'accessories', label: 'Accessories', icon: '👓' },
            { id: 'clothing', label: 'Clothing', icon: '👕' },
            { id: 'background', label: 'Background', icon: '🖼️' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="cozy-card" style={{ padding: 24, minHeight: 400, maxHeight: 500, overflowY: 'auto' }}>
          {activeTab === 'body' && <BodyTab avatar={avatar} selectItem={selectItem} isOwned={isOwned} canAfford={canAfford} />}
          {activeTab === 'hair' && <HairTab avatar={avatar} selectItem={selectItem} isOwned={isOwned} canAfford={canAfford} />}
          {activeTab === 'eyes' && <EyesTab avatar={avatar} selectItem={selectItem} isOwned={isOwned} canAfford={canAfford} />}
          {activeTab === 'accessories' && <AccessoriesTab avatar={avatar} selectItem={selectItem} isOwned={isOwned} canAfford={canAfford} />}
          {activeTab === 'clothing' && <ClothingTab avatar={avatar} selectItem={selectItem} isOwned={isOwned} canAfford={canAfford} />}
          {activeTab === 'background' && <BackgroundTab avatar={avatar} selectItem={selectItem} isOwned={isOwned} canAfford={canAfford} />}
        </div>
      </div>
    </div>
  );
}

// TAB COMPONENTS
function BodyTab({ avatar, selectItem, isOwned, canAfford }) {
  return (
    <div>
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Skin Tone</h3>
      <div className="avatar-grid">
        {AVATAR_CONFIG.skinTones.map(skin => (
          <div
            key={skin.id}
            onClick={() => selectItem('skin', skin.id, skin.price)}
            className={`avatar-item ${avatar.skin === skin.id ? 'active' : ''} ${!isOwned(skin.id) && !canAfford(skin.price) ? 'locked' : ''}`}
          >
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: skin.color, border: '2px solid rgba(255,255,255,0.2)' }}></div>
            <div style={{ fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>{skin.name}</div>
            {skin.price > 0 && !isOwned(skin.id) && (
              <div style={{ fontSize: '11px', color: canAfford(skin.price) ? 'var(--accent)' : '#FF6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
                {canAfford(skin.price) ? <ShoppingCart size={10} /> : <Lock size={10} />}
                {skin.price}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HairTab({ avatar, selectItem, isOwned, canAfford }) {
  return (
    <div>
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Hair Style</h3>
      <div className="avatar-grid" style={{ marginBottom: 32 }}>
        {AVATAR_CONFIG.hairStyles.map(hair => (
          <ItemButton key={hair.id} item={hair} selected={avatar.hairStyle === hair.id} owned={isOwned(hair.id)} canAfford={canAfford(hair.price)} onSelect={() => selectItem('hairStyle', hair.id, hair.price)} />
        ))}
      </div>
      
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Hair Color</h3>
      <div className="avatar-grid">
        {AVATAR_CONFIG.hairColors.map(color => (
          <div
            key={color.id}
            onClick={() => selectItem('hairColor', color.id, color.price)}
            className={`avatar-item ${avatar.hairColor === color.id ? 'active' : ''} ${!isOwned(color.id) && !canAfford(color.price) ? 'locked' : ''}`}
          >
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: color.color, border: '2px solid rgba(255,255,255,0.2)' }}></div>
            <div style={{ fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>{color.name}</div>
            {color.price > 0 && !isOwned(color.id) && (
              <div style={{ fontSize: '11px', color: canAfford(color.price) ? 'var(--accent)' : '#FF6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
                {canAfford(color.price) ? <ShoppingCart size={10} /> : <Lock size={10} />}
                {color.price}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EyesTab({ avatar, selectItem, isOwned, canAfford }) {
  return (
    <div>
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Eye Shape</h3>
      <div className="avatar-grid" style={{ marginBottom: 32 }}>
        {AVATAR_CONFIG.eyeShapes.map(eye => (
          <ItemButton key={eye.id} item={eye} selected={avatar.eyeShape === eye.id} owned={isOwned(eye.id)} canAfford={canAfford(eye.price)} onSelect={() => selectItem('eyeShape', eye.id, eye.price)} />
        ))}
      </div>
      
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Eye Color</h3>
      <div className="avatar-grid">
        {AVATAR_CONFIG.eyeColors.map(color => (
          <div
            key={color.id}
            onClick={() => selectItem('eyeColor', color.id, color.price)}
            className={`avatar-item ${avatar.eyeColor === color.id ? 'active' : ''} ${!isOwned(color.id) && !canAfford(color.price) ? 'locked' : ''}`}
          >
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: color.color, border: '2px solid rgba(255,255,255,0.2)' }}></div>
            <div style={{ fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>{color.name}</div>
            {color.price > 0 && !isOwned(color.id) && (
              <div style={{ fontSize: '11px', color: canAfford(color.price) ? 'var(--accent)' : '#FF6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
                {canAfford(color.price) ? <ShoppingCart size={10} /> : <Lock size={10} />}
                {color.price}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AccessoriesTab({ avatar, selectItem, isOwned, canAfford }) {
  return (
    <div>
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Glasses</h3>
      <div className="avatar-grid" style={{ marginBottom: 32 }}>
        {AVATAR_CONFIG.accessories.glasses.map(item => (
          <ItemButton key={item.id} item={item} selected={avatar.glasses === item.id} owned={isOwned(item.id)} canAfford={canAfford(item.price)} onSelect={() => selectItem('glasses', item.id, item.price)} />
        ))}
      </div>
      
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Hats</h3>
      <div className="avatar-grid">
        {AVATAR_CONFIG.accessories.hats.map(item => (
          <ItemButton key={item.id} item={item} selected={avatar.hat === item.id} owned={isOwned(item.id)} canAfford={canAfford(item.price)} onSelect={() => selectItem('hat', item.id, item.price)} />
        ))}
      </div>
    </div>
  );
}

function ClothingTab({ avatar, selectItem, isOwned, canAfford }) {
  return (
    <div>
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Clothing</h3>
      <div className="avatar-grid">
        {AVATAR_CONFIG.clothing.map(item => (
          <ItemButton key={item.id} item={item} selected={avatar.clothing === item.id} owned={isOwned(item.id)} canAfford={canAfford(item.price)} onSelect={() => selectItem('clothing', item.id, item.price)} />
        ))}
      </div>
    </div>
  );
}

function BackgroundTab({ avatar, selectItem, isOwned, canAfford }) {
  return (
    <div>
      <h3 style={{ fontSize: '18px', marginBottom: 16, fontWeight: '600' }}>Background</h3>
      <div className="avatar-grid">
        {AVATAR_CONFIG.backgrounds.map(item => (
          <ItemButton key={item.id} item={item} selected={avatar.background === item.id} owned={isOwned(item.id)} canAfford={canAfford(item.price)} onSelect={() => selectItem('background', item.id, item.price)} />
        ))}
      </div>
    </div>
  );
}

// ITEM BUTTON COMPONENT
function ItemButton({ item, selected, owned, canAfford, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`avatar-item ${selected ? 'active' : ''} ${!owned && !canAfford ? 'locked' : ''}`}
    >
      <div style={{ fontSize: '32px' }}>{item.icon}</div>
      <div style={{ fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>{item.name}</div>
      {item.rarity && (
        <div style={{ fontSize: '10px', color: item.rarity === 'legendary' ? '#F59E0B' : '#3B82F6', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Sparkles size={10} /> {item.rarity}
        </div>
      )}
      {item.price > 0 && !owned && (
        <div style={{ fontSize: '11px', color: canAfford ? 'var(--accent)' : '#FF6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
          {canAfford ? <ShoppingCart size={10} /> : <Lock size={10} />}
          {item.price}
        </div>
      )}
      {owned && item.price > 0 && (
        <div style={{ fontSize: '11px', color: 'var(--success)' }}>✓ Owned</div>
      )}
    </div>
  );
}

// SIMPLE AVATAR DISPLAY
export function SimpleAvatar({ config, size = 60 }) {
  if (!config) config = {
    skin: 'light',
    hairStyle: 'short',
    hairColor: 'black',
    eyeShape: 'round',
    eyeColor: 'brown',
    background: 'library'
  };
  
  const skinColor = AVATAR_CONFIG.skinTones.find(s => s.id === config.skin)?.color || '#FFE0BD';
  const hairColor = AVATAR_CONFIG.hairColors.find(h => h.id === config.hairColor)?.color || '#1C1C1C';
  const eyeColor = AVATAR_CONFIG.eyeColors.find(e => e.id === config.eyeColor)?.color || '#5C4033';
  
  return (
    <div style={{ width: size, height: size, position: 'relative', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Head */}
      <div style={{ 
        position: 'absolute', 
        bottom: '10%', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '70%', 
        height: '70%', 
        borderRadius: '50%', 
        background: skinColor 
      }}></div>
      
      {/* Eyes */}
      <div style={{ position: 'absolute', bottom: '35%', left: '30%', width: '15%', height: '15%', borderRadius: '50%', background: eyeColor }}></div>
      <div style={{ position: 'absolute', bottom: '35%', right: '30%', width: '15%', height: '15%', borderRadius: '50%', background: eyeColor }}></div>
      
      {/* Hair */}
      {config.hairStyle !== 'bald' && (
        <div style={{ 
          position: 'absolute', 
          top: '5%', 
          left: '15%', 
          right: '15%', 
          height: '40%', 
          background: hairColor, 
          borderRadius: '50% 50% 0 0' 
        }}></div>
      )}
      
      {/* Hat overlay */}
      {config.hat && config.hat !== 'none' && (
        <div style={{ 
          position: 'absolute', 
          top: '3%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          fontSize: size * 0.35 
        }}>
          {AVATAR_CONFIG.accessories.hats.find(h => h.id === config.hat)?.icon}
        </div>
      )}
      
      {/* Glasses overlay */}
      {config.glasses && config.glasses !== 'none' && (
        <div style={{ 
          position: 'absolute', 
          bottom: '30%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          fontSize: size * 0.28 
        }}>
          {AVATAR_CONFIG.accessories.glasses.find(g => g.id === config.glasses)?.icon}
        </div>
      )}
    </div>
  );
}
