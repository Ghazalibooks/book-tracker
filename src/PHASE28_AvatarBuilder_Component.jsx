// 🎨 AVATAR BUILDER COMPONENT - PHASE 28
// Complete Avatar Customization System with 1000+ combinations

import { useState } from 'react';
import { doc, setDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from './firebase';
import { X, Repeat, Check, ShoppingCart, Lock } from 'lucide-react';

// AVATAR CONFIGURATION - All customization options
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
    { id: 'afro', name: 'Afro', icon: '☁️', price: 200 },
    { id: 'buzz', name: 'Buzz Cut', icon: '✂️', price: 50 },
    { id: 'messy', name: 'Messy', icon: '🌪️', price: 100 },
    { id: 'slick', name: 'Slicked', icon: '✨', price: 150 },
    { id: 'undercut', name: 'Undercut', icon: '⚡', price: 250, rarity: 'epic' }
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
    { id: 'green', name: 'Green', color: '#32CD32', price: 200 },
    { id: 'rainbow', name: 'Rainbow', gradient: 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)', price: 500, rarity: 'legendary' }
  ],
  
  eyeShapes: [
    { id: 'round', name: 'Round', icon: '⭕', price: 0 },
    { id: 'almond', name: 'Almond', icon: '🔶', price: 50 },
    { id: 'cat', name: 'Cat Eyes', icon: '🐱', price: 100 },
    { id: 'sleepy', name: 'Sleepy', icon: '😴', price: 100 },
    { id: 'angry', name: 'Angry', icon: '😠', price: 100 },
    { id: 'happy', name: 'Happy', icon: '😊', price: 0 },
    { id: 'anime', name: 'Anime', icon: '✨', price: 200, rarity: 'rare' },
    { id: 'cyber', name: 'Cyberpunk', icon: '🤖', price: 300, rarity: 'epic' },
    { id: 'glowing', name: 'Glowing', icon: '💫', price: 500, rarity: 'legendary' },
    { id: 'hearts', name: 'Heart Eyes', icon: '😍', price: 150 }
  ],
  
  eyeColors: [
    { id: 'brown', name: 'Brown', color: '#5C4033', price: 0 },
    { id: 'blue', name: 'Blue', color: '#4169E1', price: 0 },
    { id: 'green', name: 'Green', color: '#228B22', price: 50 },
    { id: 'hazel', name: 'Hazel', color: '#8E7618', price: 50 },
    { id: 'gray', name: 'Gray', color: '#808080', price: 100 },
    { id: 'violet', name: 'Violet', color: '#8A2BE2', price: 200 },
    { id: 'red', name: 'Red', color: '#DC143C', price: 300, rarity: 'epic' },
    { id: 'heterochromia', name: 'Two Colors', split: true, price: 400, rarity: 'epic' }
  ],
  
  accessories: {
    glasses: [
      { id: 'none', name: 'None', icon: '👓', price: 0 },
      { id: 'nerd', name: 'Nerd', icon: '🤓', price: 100 },
      { id: 'aviator', name: 'Aviators', icon: '😎', price: 150 },
      { id: 'round', name: 'Round', icon: '⭕', price: 100 },
      { id: 'cat', name: 'Cat Eye', icon: '🐱', price: 150 },
      { id: 'sunglasses', name: 'Sunglasses', icon: '🕶️', price: 200 },
      { id: 'heart', name: 'Heart', icon: '💗', price: 250 },
      { id: 'star', name: 'Star', icon: '⭐', price: 250 },
      { id: 'monocle', name: 'Monocle', icon: '🧐', price: 300, rarity: 'rare' },
      { id: 'vr', name: 'VR Headset', icon: '🥽', price: 500, rarity: 'epic' },
      { id: 'cyber', name: 'Cyber Visor', icon: '🤖', price: 800, rarity: 'legendary' }
    ],
    
    hats: [
      { id: 'none', name: 'None', icon: '🎩', price: 0 },
      { id: 'cap', name: 'Cap', icon: '🧢', price: 100 },
      { id: 'beanie', name: 'Beanie', icon: '🎿', price: 100 },
      { id: 'crown', name: 'Crown', icon: '👑', price: 500, rarity: 'legendary' },
      { id: 'wizard', name: 'Wizard', icon: '🧙‍♂️', price: 300, rarity: 'epic' },
      { id: 'cowboy', name: 'Cowboy', icon: '🤠', price: 200 },
      { id: 'beret', name: 'Beret', icon: '👨‍🎨', price: 150 },
      { id: 'tophat', name: 'Top Hat', icon: '🎩', price: 250 },
      { id: 'santa', name: 'Santa', icon: '🎅', price: 200, seasonal: 'winter' },
      { id: 'witch', name: 'Witch', icon: '🧙‍♀️', price: 200, seasonal: 'halloween' },
      { id: 'headphones', name: 'Headphones', icon: '🎧', price: 300 },
      { id: 'halo', name: 'Halo', icon: '😇', price: 600, rarity: 'legendary' },
      { id: 'horns', name: 'Horns', icon: '😈', price: 400, rarity: 'epic' }
    ],
    
    jewelry: [
      { id: 'none', name: 'None', price: 0 },
      { id: 'earrings', name: 'Earrings', icon: '💍', price: 100 },
      { id: 'necklace', name: 'Necklace', icon: '📿', price: 150 },
      { id: 'nosering', name: 'Nose Ring', icon: '💎', price: 100 },
      { id: 'choker', name: 'Choker', icon: '⛓️', price: 200 },
      { id: 'crown_small', name: 'Mini Crown', icon: '👸', price: 300, rarity: 'rare' }
    ],
    
    face: [
      { id: 'none', name: 'None', price: 0 },
      { id: 'mask', name: 'Mask', icon: '😷', price: 50 },
      { id: 'beard', name: 'Beard', icon: '🧔', price: 100 },
      { id: 'mustache', name: 'Mustache', icon: '🥸', price: 100 },
      { id: 'facepaint', name: 'Face Paint', icon: '🎨', price: 150 },
      { id: 'scar', name: 'Scar', icon: '⚡', price: 200, rarity: 'rare' },
      { id: 'tattoo', name: 'Tattoo', icon: '🔱', price: 300, rarity: 'epic' }
    ]
  },
  
  clothing: [
    { id: 'tshirt', name: 'T-Shirt', icon: '👕', price: 0 },
    { id: 'hoodie', name: 'Hoodie', icon: '🧥', price: 150 },
    { id: 'suit', name: 'Suit', icon: '🤵', price: 300 },
    { id: 'dress', name: 'Dress', icon: '👗', price: 250 },
    { id: 'armor', name: 'Armor', icon: '🛡️', price: 500, rarity: 'epic' },
    { id: 'cape', name: 'Cape', icon: '🦸', price: 400, rarity: 'epic' },
    { id: 'kimono', name: 'Kimono', icon: '👘', price: 300, rarity: 'rare' },
    { id: 'tracksuit', name: 'Tracksuit', icon: '🏃', price: 200 },
    { id: 'wizard', name: 'Wizard Robe', icon: '🧙', price: 400, rarity: 'epic' },
    { id: 'astronaut', name: 'Space Suit', icon: '👨‍🚀', price: 600, rarity: 'legendary' },
    { id: 'ninja', name: 'Ninja', icon: '🥷', price: 500, rarity: 'epic' },
    { id: 'pirate', name: 'Pirate', icon: '🏴‍☠️', price: 450, rarity: 'epic' }
  ],
  
  backgrounds: [
    { id: 'library', name: 'Library', icon: '📚', price: 0 },
    { id: 'space', name: 'Space', icon: '🌌', price: 200 },
    { id: 'beach', name: 'Beach', icon: '🏖️', price: 150 },
    { id: 'mountains', name: 'Mountains', icon: '🏔️', price: 150 },
    { id: 'city', name: 'City', icon: '🌃', price: 200 },
    { id: 'forest', name: 'Forest', icon: '🌲', price: 150 },
    { id: 'desert', name: 'Desert', icon: '🏜️', price: 150 },
    { id: 'underwater', name: 'Underwater', icon: '🌊', price: 250, rarity: 'rare' },
    { id: 'clouds', name: 'Clouds', icon: '☁️', price: 200 },
    { id: 'neon', name: 'Neon City', icon: '🌆', price: 300, rarity: 'rare' },
    { id: 'fantasy', name: 'Fantasy', icon: '🏰', price: 400, rarity: 'epic' },
    { id: 'aurora', name: 'Aurora', icon: '🌌', price: 500, animated: true, rarity: 'legendary' },
    { id: 'matrix', name: 'Matrix', icon: '💚', price: 600, animated: true, rarity: 'legendary' }
  ]
};

// HELPER: Get rarity color
const getRarityColor = (rarity) => {
  const colors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B'
  };
  return colors[rarity] || colors.common;
};

// AVATAR BUILDER COMPONENT
export function AvatarBuilder({ user, userData, onClose, showToast }) {
  const [avatar, setAvatar] = useState(userData?.avatar || {
    skin: 'light',
    hairStyle: 'short',
    hairColor: 'black',
    eyeShape: 'round',
    eyeColor: 'brown',
    glasses: 'none',
    hat: 'none',
    jewelry: 'none',
    face: 'none',
    clothing: 'tshirt',
    background: 'library'
  });
  
  const [activeTab, setActiveTab] = useState('body');
  const [previewRotation, setPreviewRotation] = useState(0);
  
  const coins = userData?.coins || 0;
  const inventory = userData?.inventory || [];
  
  const isOwned = (itemId) => {
    if (itemId === 'none') return true;
    const item = findItemById(itemId);
    return item?.price === 0 || inventory.includes(itemId);
  };
  
  const canAfford = (price) => coins >= price;
  
  const findItemById = (itemId) => {
    // Search through all config options
    for (const category of Object.values(AVATAR_CONFIG)) {
      if (Array.isArray(category)) {
        const found = category.find(item => item.id === itemId);
        if (found) return found;
      } else if (typeof category === 'object') {
        for (const subcategory of Object.values(category)) {
          const found = subcategory.find(item => item.id === itemId);
          if (found) return found;
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
    
    try {
      await setDoc(doc(db, "users", user.uid), {
        coins: increment(-price),
        inventory: arrayUnion(itemId)
      }, { merge: true });
      
      showToast(`✅ Purchased for ${price} coins!`);
      return true;
    } catch (error) {
      console.error("Purchase error:", error);
      showToast("❌ Purchase failed!");
      return false;
    }
  };
  
  const selectItem = async (category, itemId, price = 0) => {
    if (!isOwned(itemId) && price > 0) {
      const success = await purchaseItem(itemId, price);
      if (!success) return;
    }
    
    setAvatar(prev => ({ ...prev, [category]: itemId }));
  };
  
  const randomizeAvatar = () => {
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const freeItems = {
      skin: random(AVATAR_CONFIG.skinTones.filter(s => s.price === 0)),
      hairStyle: random(AVATAR_CONFIG.hairStyles.filter(h => h.price === 0)),
      hairColor: random(AVATAR_CONFIG.hairColors.filter(h => h.price === 0)),
      eyeShape: random(AVATAR_CONFIG.eyeShapes.filter(e => e.price === 0)),
      eyeColor: random(AVATAR_CONFIG.eyeColors.filter(e => e.price === 0)),
      clothing: random(AVATAR_CONFIG.clothing.filter(c => c.price === 0)),
      background: random(AVATAR_CONFIG.backgrounds.filter(b => b.price === 0))
    };
    
    setAvatar({
      skin: freeItems.skin.id,
      hairStyle: freeItems.hairStyle.id,
      hairColor: freeItems.hairColor.id,
      eyeShape: freeItems.eyeShape.id,
      eyeColor: freeItems.eyeColor.id,
      glasses: 'none',
      hat: 'none',
      jewelry: 'none',
      face: 'none',
      clothing: freeItems.clothing.id,
      background: freeItems.background.id
    });
    
    showToast("🎲 Randomized!");
  };
  
  const saveAvatar = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), { avatar }, { merge: true });
      showToast("✅ Avatar saved!");
      onClose && onClose();
    } catch (error) {
      console.error("Save error:", error);
      showToast("❌ Save failed!");
    }
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 5000, overflowY: 'auto', padding: 20 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>🎨 Avatar Builder</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-card)', padding: '10px 20px', borderRadius: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span>{coins}</span>
            </div>
            <button onClick={onClose} className="btn-ghost" style={{ width: 50, height: 50, borderRadius: '50%', padding: 0 }}>
              <X />
            </button>
          </div>
        </div>
        
        {/* Preview */}
        <div className="cozy-card" style={{ padding: 40, marginBottom: 25, textAlign: 'center', background: 'var(--grad-main)' }}>
          <div 
            style={{ 
              width: 200, 
              height: 200, 
              margin: '0 auto 20px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              border: '5px solid white',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              transform: `rotate(${previewRotation}deg)`,
              transition: 'transform 0.5s',
              cursor: 'pointer'
            }}
            onClick={() => setPreviewRotation(prev => prev + 360)}
          >
            <SimpleAvatar config={avatar} size={200} />
          </div>
          
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={randomizeAvatar} className="btn-main" style={{ width: 'auto', padding: '12px 24px', background: 'rgba(255,255,255,0.2)' }}>
              <Repeat size={18} /> Randomize
            </button>
            <button onClick={saveAvatar} className="btn-main" style={{ width: 'auto', padding: '12px 24px', background: 'rgba(255,255,255,0.2)' }}>
              <Check size={18} /> Save Avatar
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 10 }}>
          {['body', 'hair', 'eyes', 'accessories', 'clothing', 'background'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`btn-ghost ${activeTab === tab ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap', textTransform: 'capitalize', minWidth: 100 }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="cozy-card" style={{ padding: 20, minHeight: 400 }}>
          {activeTab === 'body' && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Skin Tone</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {AVATAR_CONFIG.skinTones.map(skin => (
                  <button
                    key={skin.id}
                    onClick={() => selectItem('skin', skin.id, skin.price)}
                    className={`btn-ghost ${avatar.skin === skin.id ? 'active' : ''}`}
                    style={{ flexDirection: 'column', padding: '15px', opacity: !isOwned(skin.id) && !canAfford(skin.price) ? 0.5 : 1 }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: skin.color, marginBottom: 8, border: '2px solid rgba(255,255,255,0.2)' }}></div>
                    <div style={{ fontSize: '12px' }}>{skin.name}</div>
                    {skin.price > 0 && !isOwned(skin.id) && (
                      <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {canAfford(skin.price) ? <ShoppingCart size={12} /> : <Lock size={12} />}
                        {skin.price}
                      </div>
                    )}
                    {isOwned(skin.id) && skin.price > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: 5 }}>✓ Owned</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'hair' && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Hair Style</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 30 }}>
                {AVATAR_CONFIG.hairStyles.map(hair => (
                  <ItemCard 
                    key={hair.id} 
                    item={hair} 
                    selected={avatar.hairStyle === hair.id}
                    owned={isOwned(hair.id)}
                    canAfford={canAfford(hair.price)}
                    onSelect={() => selectItem('hairStyle', hair.id, hair.price)}
                  />
                ))}
              </div>
              
              <h3 style={{ fontSize: '18px', marginBottom: 15, marginTop: 30 }}>Hair Color</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {AVATAR_CONFIG.hairColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => selectItem('hairColor', color.id, color.price)}
                    className={`btn-ghost ${avatar.hairColor === color.id ? 'active' : ''}`}
                    style={{ flexDirection: 'column', padding: '15px', opacity: !isOwned(color.id) && !canAfford(color.price) ? 0.5 : 1 }}
                  >
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: color.gradient || color.color, 
                      marginBottom: 8, 
                      border: '2px solid rgba(255,255,255,0.2)' 
                    }}></div>
                    <div style={{ fontSize: '12px' }}>{color.name}</div>
                    {color.rarity && <div style={{ fontSize: '10px', color: getRarityColor(color.rarity) }}>{color.rarity}</div>}
                    {color.price > 0 && !isOwned(color.id) && (
                      <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {canAfford(color.price) ? <ShoppingCart size={12} /> : <Lock size={12} />}
                        {color.price}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'eyes' && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Eye Shape</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 30 }}>
                {AVATAR_CONFIG.eyeShapes.map(eye => (
                  <ItemCard 
                    key={eye.id} 
                    item={eye} 
                    selected={avatar.eyeShape === eye.id}
                    owned={isOwned(eye.id)}
                    canAfford={canAfford(eye.price)}
                    onSelect={() => selectItem('eyeShape', eye.id, eye.price)}
                  />
                ))}
              </div>
              
              <h3 style={{ fontSize: '18px', marginBottom: 15, marginTop: 30 }}>Eye Color</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {AVATAR_CONFIG.eyeColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => selectItem('eyeColor', color.id, color.price)}
                    className={`btn-ghost ${avatar.eyeColor === color.id ? 'active' : ''}`}
                    style={{ flexDirection: 'column', padding: '15px', opacity: !isOwned(color.id) && !canAfford(color.price) ? 0.5 : 1 }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: color.color, marginBottom: 8, border: '2px solid rgba(255,255,255,0.2)' }}></div>
                    <div style={{ fontSize: '12px' }}>{color.name}</div>
                    {color.rarity && <div style={{ fontSize: '10px', color: getRarityColor(color.rarity) }}>{color.rarity}</div>}
                    {color.price > 0 && !isOwned(color.id) && (
                      <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {canAfford(color.price) ? <ShoppingCart size={12} /> : <Lock size={12} />}
                        {color.price}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'accessories' && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Glasses</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 30 }}>
                {AVATAR_CONFIG.accessories.glasses.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    selected={avatar.glasses === item.id}
                    owned={isOwned(item.id)}
                    canAfford={canAfford(item.price)}
                    onSelect={() => selectItem('glasses', item.id, item.price)}
                  />
                ))}
              </div>
              
              <h3 style={{ fontSize: '18px', marginBottom: 15, marginTop: 30 }}>Hats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 30 }}>
                {AVATAR_CONFIG.accessories.hats.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    selected={avatar.hat === item.id}
                    owned={isOwned(item.id)}
                    canAfford={canAfford(item.price)}
                    onSelect={() => selectItem('hat', item.id, item.price)}
                  />
                ))}
              </div>
              
              <h3 style={{ fontSize: '18px', marginBottom: 15, marginTop: 30 }}>Jewelry</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 30 }}>
                {AVATAR_CONFIG.accessories.jewelry.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    selected={avatar.jewelry === item.id}
                    owned={isOwned(item.id)}
                    canAfford={canAfford(item.price)}
                    onSelect={() => selectItem('jewelry', item.id, item.price)}
                  />
                ))}
              </div>
              
              <h3 style={{ fontSize: '18px', marginBottom: 15, marginTop: 30 }}>Face</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {AVATAR_CONFIG.accessories.face.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    selected={avatar.face === item.id}
                    owned={isOwned(item.id)}
                    canAfford={canAfford(item.price)}
                    onSelect={() => selectItem('face', item.id, item.price)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'clothing' && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Clothing</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {AVATAR_CONFIG.clothing.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    selected={avatar.clothing === item.id}
                    owned={isOwned(item.id)}
                    canAfford={canAfford(item.price)}
                    onSelect={() => selectItem('clothing', item.id, item.price)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'background' && (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Background</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {AVATAR_CONFIG.backgrounds.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    selected={avatar.background === item.id}
                    owned={isOwned(item.id)}
                    canAfford={canAfford(item.price)}
                    onSelect={() => selectItem('background', item.id, item.price)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ITEM CARD COMPONENT
function ItemCard({ item, selected, owned, canAfford, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`btn-ghost ${selected ? 'active' : ''}`}
      style={{ 
        flexDirection: 'column', 
        padding: '15px', 
        opacity: !owned && !canAfford ? 0.5 : 1,
        position: 'relative'
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: 8 }}>{item.icon}</div>
      <div style={{ fontSize: '12px', textAlign: 'center' }}>{item.name}</div>
      {item.rarity && (
        <div style={{ fontSize: '10px', color: getRarityColor(item.rarity), marginTop: 4 }}>
          {item.rarity}
        </div>
      )}
      {item.seasonal && (
        <div style={{ fontSize: '10px', color: 'var(--accent)', marginTop: 4 }}>
          ❄️ {item.seasonal}
        </div>
      )}
      {item.animated && (
        <div style={{ fontSize: '10px', color: 'var(--accent)', marginTop: 4 }}>
          ✨ Animated
        </div>
      )}
      {item.price > 0 && !owned && (
        <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          {canAfford ? <ShoppingCart size={12} /> : <Lock size={12} />}
          {item.price}
        </div>
      )}
      {owned && item.price > 0 && (
        <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: 5 }}>
          ✓ Owned
        </div>
      )}
    </button>
  );
}

// SIMPLE AVATAR DISPLAY (for preview)
export function SimpleAvatar({ config, size = 60 }) {
  const skinColor = AVATAR_CONFIG.skinTones.find(s => s.id === config.skin)?.color || '#FFE0BD';
  const hairColor = AVATAR_CONFIG.hairColors.find(h => h.id === config.hairColor)?.color || '#1C1C1C';
  const eyeColor = AVATAR_CONFIG.eyeColors.find(e => e.id === config.eyeColor)?.color || '#5C4033';
  const bgItem = AVATAR_CONFIG.backgrounds.find(b => b.id === config.background);
  
  return (
    <div style={{ width: size, height: size, position: 'relative', borderRadius: '50%', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: bgItem?.id === 'library' ? '#4A3728' : 
                   bgItem?.id === 'space' ? '#1a1a2e' :
                   bgItem?.id === 'neon' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                   'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}></div>
      
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
        <div style={{ position: 'absolute', top: '5%', left: '15%', right: '15%', height: '40%', background: hairColor, borderRadius: '50% 50% 0 0' }}></div>
      )}
      
      {/* Hat icon overlay */}
      {config.hat !== 'none' && (
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.4 }}>
          {AVATAR_CONFIG.accessories.hats.find(h => h.id === config.hat)?.icon}
        </div>
      )}
      
      {/* Glasses icon overlay */}
      {config.glasses !== 'none' && (
        <div style={{ position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.3 }}>
          {AVATAR_CONFIG.accessories.glasses.find(g => g.id === config.glasses)?.icon}
        </div>
      )}
    </div>
  );
}
