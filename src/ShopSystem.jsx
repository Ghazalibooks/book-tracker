// 🛒 COMPLETE SHOP SYSTEM
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { ShoppingCart, Star, Heart, TrendingUp, Gift, Lock, Sparkles, Search, Filter } from 'lucide-react';

// SHOP ITEMS DATABASE
export const SHOP_ITEMS = {
  avatarParts: [
    { id: 'hair_neon_blue', name: 'Neon Blue Hair', price: 300, category: 'avatar', type: 'hairColor', value: '#00FFFF', rarity: 'rare', icon: '💈' },
    { id: 'hair_galaxy', name: 'Galaxy Hair', price: 500, category: 'avatar', type: 'hairColor', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', rarity: 'legendary', icon: '🌌' },
    { id: 'eyes_rainbow', name: 'Rainbow Eyes', price: 400, category: 'avatar', type: 'eyeColor', value: 'rainbow', rarity: 'epic', icon: '🌈' },
    { id: 'hat_wizard', name: 'Wizard Hat', price: 600, category: 'avatar', type: 'hat', value: 'wizard', rarity: 'legendary', icon: '🧙' },
    { id: 'wings', name: 'Angel Wings', price: 800, category: 'avatar', type: 'accessory', value: 'wings', rarity: 'legendary', icon: '👼' }
  ],
  
  frames: [
    { id: 'frame_gold', name: 'Gold Frame', price: 200, category: 'frame', rarity: 'rare', icon: '🏆', color: '#FFD700' },
    { id: 'frame_diamond', name: 'Diamond Frame', price: 500, category: 'frame', rarity: 'legendary', icon: '💎', color: '#B9F2FF' },
    { id: 'frame_fire', name: 'Fire Frame', price: 300, category: 'frame', rarity: 'epic', icon: '🔥', color: '#FF6B6B' },
    { id: 'frame_ice', name: 'Ice Frame', price: 300, category: 'frame', rarity: 'epic', icon: '❄️', color: '#4ECDC4' },
    { id: 'frame_rainbow', name: 'Rainbow Frame', price: 600, category: 'frame', rarity: 'legendary', icon: '🌈', color: 'rainbow' }
  ],
  
  badges: [
    { id: 'badge_bookworm', name: 'Bookworm', price: 100, category: 'badge', icon: '📚', description: '100 books read' },
    { id: 'badge_speedreader', name: 'Speed Reader', price: 150, category: 'badge', icon: '⚡', description: '1000 pages in a week' },
    { id: 'badge_nightowl', name: 'Night Owl', price: 100, category: 'badge', icon: '🦉', description: 'Read after midnight' },
    { id: 'badge_streaker', name: 'Streaker', price: 200, category: 'badge', icon: '🔥', description: '30 day streak' },
    { id: 'badge_reviewer', name: 'Reviewer', price: 150, category: 'badge', icon: '✍️', description: '50 reviews written' },
    { id: 'badge_collector', name: 'Collector', price: 300, category: 'badge', icon: '🏆', description: 'Own 500 books' }
  ],
  
  powerUps: [
    { id: 'powerup_2x_xp', name: '2x XP Boost', price: 250, category: 'powerup', duration: 60, icon: '⚡', description: 'Double XP for 1 hour' },
    { id: 'powerup_2x_coins', name: '2x Coins Boost', price: 250, category: 'powerup', duration: 60, icon: '💰', description: 'Double coins for 1 hour' },
    { id: 'powerup_auto_timer', name: 'Auto-Track', price: 500, category: 'powerup', duration: 1440, icon: '⏰', description: 'Auto-track reading for 24h' },
    { id: 'powerup_focus', name: 'Focus Mode', price: 300, category: 'powerup', duration: 120, icon: '🎯', description: 'No distractions for 2h' }
  ],
  
  themes: [
    { id: 'theme_cyberpunk', name: 'Cyberpunk', price: 400, category: 'theme', icon: '🌆', colors: { primary: '#FF00FF', secondary: '#00FFFF' } },
    { id: 'theme_nature', name: 'Nature', price: 300, category: 'theme', icon: '🌿', colors: { primary: '#2ECC71', secondary: '#27AE60' } },
    { id: 'theme_galaxy', name: 'Galaxy', price: 500, category: 'theme', icon: '🌌', colors: { primary: '#667eea', secondary: '#764ba2' } },
    { id: 'theme_sunset_pro', name: 'Sunset Pro', price: 350, category: 'theme', icon: '🌅', colors: { primary: '#FF6B6B', secondary: '#FFE66D' } }
  ],
  
  bundles: [
    { id: 'bundle_starter', name: 'Starter Pack', price: 500, originalPrice: 800, category: 'bundle', icon: '🎁', items: ['frame_gold', 'badge_bookworm', 'powerup_2x_xp', 'theme_nature'], discount: 40 },
    { id: 'bundle_premium', name: 'Premium Pack', price: 1500, originalPrice: 2500, category: 'bundle', icon: '💎', items: ['frame_diamond', 'badge_streaker', 'badge_reviewer', 'hair_galaxy', 'theme_galaxy'], discount: 40 },
    { id: 'bundle_power', name: 'Power Pack', price: 800, originalPrice: 1100, category: 'bundle', icon: '⚡', items: ['powerup_2x_xp', 'powerup_2x_coins', 'powerup_auto_timer', 'powerup_focus'], discount: 27 }
  ]
};

// DAILY DEALS (rotiert täglich)
const getDailyDeals = () => {
  const today = new Date().getDate();
  const allItems = [...SHOP_ITEMS.avatarParts, ...SHOP_ITEMS.frames, ...SHOP_ITEMS.badges, ...SHOP_ITEMS.powerUps, ...SHOP_ITEMS.themes];
  const dealIndex = today % allItems.length;
  return [
    { ...allItems[dealIndex], isDiscounted: true, discountPrice: Math.floor(allItems[dealIndex].price * 0.7) },
    { ...allItems[(dealIndex + 1) % allItems.length], isDiscounted: true, discountPrice: Math.floor(allItems[(dealIndex + 1) % allItems.length].price * 0.8) }
  ];
};

export function ShopView({ user, userData, showToast }) {
  const [activeCategory, setActiveCategory] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [coins, setCoins] = useState(userData?.coins || 0);
  const [inventory, setInventory] = useState(userData?.inventory || []);
  const [wishlist, setWishlist] = useState(userData?.wishlist || []);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  
  useEffect(() => {
    loadUserData();
  }, [user.uid]);
  
  const loadUserData = async () => {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setCoins(data.coins || 0);
      setInventory(data.inventory || []);
      setWishlist(data.wishlist || []);
      setPurchaseHistory(data.purchaseHistory || []);
    }
  };
  
  const isOwned = (itemId) => inventory.includes(itemId);
  const isWishlisted = (itemId) => wishlist.includes(itemId);
  
  const toggleWishlist = async (itemId) => {
    const newWishlist = isWishlisted(itemId) 
      ? wishlist.filter(id => id !== itemId)
      : [...wishlist, itemId];
    
    setWishlist(newWishlist);
    await setDoc(doc(db, "users", user.uid), { wishlist: newWishlist }, { merge: true });
    showToast(isWishlisted(itemId) ? "❤️ Removed from wishlist" : "❤️ Added to wishlist");
  };
  
  const purchaseItem = async (item) => {
    if (isOwned(item.id)) {
      showToast("✅ You already own this!");
      return;
    }
    
    const price = item.isDiscounted ? item.discountPrice : item.price;
    if (coins < price) {
      showToast("❌ Not enough coins!");
      return;
    }
    
    try {
      const purchase = {
        itemId: item.id,
        itemName: item.name,
        price: price,
        timestamp: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", user.uid), {
        coins: increment(-price),
        inventory: arrayUnion(item.id),
        purchaseHistory: arrayUnion(purchase)
      }, { merge: true });
      
      setCoins(prev => prev - price);
      setInventory(prev => [...prev, item.id]);
      setPurchaseHistory(prev => [...prev, purchase]);
      
      if (item.category === 'bundle') {
        item.items.forEach(bundleItemId => {
          if (!inventory.includes(bundleItemId)) {
            setInventory(prev => [...prev, bundleItemId]);
          }
        });
      }
      
      showToast(`✅ Purchased ${item.name} for ${price} coins!`);
    } catch (error) {
      console.error("Purchase error:", error);
      showToast("❌ Purchase failed!");
    }
  };
  
  const getAllItems = () => {
    return [
      ...SHOP_ITEMS.avatarParts,
      ...SHOP_ITEMS.frames,
      ...SHOP_ITEMS.badges,
      ...SHOP_ITEMS.powerUps,
      ...SHOP_ITEMS.themes,
      ...SHOP_ITEMS.bundles
    ];
  };
  
  const getFilteredItems = () => {
    let items = [];
    
    if (activeCategory === 'featured') {
      items = [
        ...getDailyDeals(),
        ...SHOP_ITEMS.bundles,
        ...getAllItems().filter(item => item.rarity === 'legendary').slice(0, 5)
      ];
    } else if (activeCategory === 'wishlist') {
      items = getAllItems().filter(item => wishlist.includes(item.id));
    } else if (activeCategory === 'owned') {
      items = getAllItems().filter(item => inventory.includes(item.id));
    } else {
      items = getAllItems().filter(item => item.category === activeCategory);
    }
    
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (sortBy === 'priceAsc') items.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') items.sort((a, b) => b.price - a.price);
    if (sortBy === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
    
    return items;
  };
  
  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">🛒 Shop</h1>
          <p className="page-subtitle">Customize your reading experience</p>
        </div>
        <div className="cozy-card" style={{ padding: '12px 24px', background: 'var(--grad-main)', fontWeight: 'bold', fontSize: '20px' }}>
          💰 {coins}
        </div>
      </div>
      
      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: 48 }}
          />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input" style={{ width: 200 }}>
          <option value="popular">Most Popular</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
      
      {/* Categories */}
      <div className="tab-container">
        {[
          { id: 'featured', label: '⭐ Featured', icon: Star },
          { id: 'avatar', label: '🎨 Avatar', icon: Sparkles },
          { id: 'frame', label: '🖼️ Frames' },
          { id: 'badge', label: '🏆 Badges' },
          { id: 'powerup', label: '⚡ Power-Ups' },
          { id: 'theme', label: '🎨 Themes' },
          { id: 'bundle', label: '🎁 Bundles' },
          { id: 'wishlist', label: '❤️ Wishlist' },
          { id: 'owned', label: '✅ Owned' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`tab-button ${activeCategory === cat.id ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      
      {/* Items Grid */}
      <div className="desktop-grid-4">
        {getFilteredItems().map(item => (
          <ShopItemCard
            key={item.id}
            item={item}
            isOwned={isOwned(item.id)}
            isWishlisted={isWishlisted(item.id)}
            onPurchase={() => purchaseItem(item)}
            onToggleWishlist={() => toggleWishlist(item.id)}
            coins={coins}
          />
        ))}
      </div>
      
      {getFilteredItems().length === 0 && (
        <div className="cozy-card" style={{ padding: 60, textAlign: 'center' }}>
          <ShoppingCart size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No items found</h3>
          <p style={{ opacity: 0.7 }}>Try adjusting your filters or search</p>
        </div>
      )}
    </div>
  );
}

function ShopItemCard({ item, isOwned, isWishlisted, onPurchase, onToggleWishlist, coins }) {
  const price = item.isDiscounted ? item.discountPrice : item.price;
  const canAfford = coins >= price;
  const discount = item.isDiscounted ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : item.discount;
  
  return (
    <div className="cozy-card" style={{ padding: 20, position: 'relative' }}>
      {/* Wishlist Heart */}
      <button
        onClick={onToggleWishlist}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          opacity: isWishlisted ? 1 : 0.3,
          transition: 'all 0.3s'
        }}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>
      
      {/* Discount Badge */}
      {discount && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: '#FF6B6B',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          -{discount}%
        </div>
      )}
      
      {/* Rarity Badge */}
      {item.rarity && (
        <div style={{
          position: 'absolute',
          top: discount ? 44 : 12,
          left: 12,
          background: item.rarity === 'legendary' ? '#F59E0B' : item.rarity === 'epic' ? '#8B5CF6' : '#3B82F6',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 6,
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {item.rarity}
        </div>
      )}
      
      {/* Icon */}
      <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: 12, marginTop: 20 }}>
        {item.icon}
      </div>
      
      {/* Name */}
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
        {item.name}
      </h3>
      
      {/* Description */}
      {item.description && (
        <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: 12, textAlign: 'center', minHeight: 40 }}>
          {item.description}
        </p>
      )}
      
      {/* Bundle Items */}
      {item.category === 'bundle' && (
        <div style={{ marginBottom: 12, fontSize: '12px', opacity: 0.8, textAlign: 'center' }}>
          {item.items.length} items included
        </div>
      )}
      
      {/* Price */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        {item.isDiscounted && (
          <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 8, fontSize: '14px' }}>
            💰 {item.price}
          </span>
        )}
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent)' }}>
          💰 {price}
        </span>
      </div>
      
      {/* Purchase Button */}
      {isOwned ? (
        <button className="btn-main" style={{ width: '100%', background: 'var(--success)', cursor: 'default' }} disabled>
          ✅ Owned
        </button>
      ) : (
        <button
          onClick={onPurchase}
          className="btn-main"
          style={{ width: '100%', opacity: canAfford ? 1 : 0.5 }}
          disabled={!canAfford}
        >
          {canAfford ? (
            <><ShoppingCart size={16} /> Purchase</>
          ) : (
            <><Lock size={16} /> Not Enough Coins</>
          )}
        </button>
      )}
    </div>
  );
}

export default ShopView;