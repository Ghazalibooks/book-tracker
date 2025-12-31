// 👑 PREMIUM SYSTEM - CORE
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Crown, Star, Sparkles, Lock, Check, Zap } from 'lucide-react';

// PREMIUM TIERS
export const PREMIUM_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      maxBooks: 50,
      maxFriends: 10,
      themes: 6,
      avatarItems: 'basic',
      analytics: 'basic',
      ads: true,
      cloudSync: true,
      support: 'community'
    }
  },
  
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 2.99,
    priceYearly: 29.99,
    features: {
      maxBooks: 'unlimited',
      maxFriends: 100,
      themes: 'all',
      avatarItems: 'all',
      analytics: 'advanced',
      ads: false,
      cloudSync: true,
      support: 'priority',
      exclusiveContent: true,
      monthlyCoins: 500,
      premiumBadge: true,
      earlyAccess: true
    }
  }
};

// Check if user has premium
export const isPremium = (userData) => {
  if (!userData?.premium) return false;
  
  // Check if subscription is active
  if (userData.premium.status === 'active') {
    // Check if not expired
    if (userData.premium.expiresAt) {
      return new Date(userData.premium.expiresAt) > new Date();
    }
    return true;
  }
  
  return false;
};

// Check if feature is available
export const hasFeature = (userData, featureName) => {
  const tier = isPremium(userData) ? 'premium' : 'free';
  const features = PREMIUM_TIERS[tier].features;
  
  if (featureName === 'books') {
    return features.maxBooks === 'unlimited' || (userData?.books?.length || 0) < features.maxBooks;
  }
  
  if (featureName === 'friends') {
    return features.maxFriends === 'unlimited' || (userData?.friends?.length || 0) < features.maxFriends;
  }
  
  return features[featureName] === true || features[featureName] === 'all';
};

// Premium Badge Component
export function PremiumBadge({ size = 'sm' }) {
  const sizes = {
    xs: { icon: 12, padding: '2px 6px', fontSize: '10px' },
    sm: { icon: 14, padding: '4px 8px', fontSize: '11px' },
    md: { icon: 16, padding: '6px 12px', fontSize: '12px' },
    lg: { icon: 20, padding: '8px 16px', fontSize: '14px' }
  };
  
  const style = sizes[size];
  
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: style.padding,
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      borderRadius: 12,
      fontSize: style.fontSize,
      fontWeight: 'bold',
      color: '#000'
    }}>
      <Crown size={style.icon} />
      <span>PREMIUM</span>
    </div>
  );
}

// Feature Lock Component
export function FeatureLock({ featureName, onUpgrade }) {
  return (
    <div className="cozy-card" style={{
      padding: 60,
      textAlign: 'center',
      background: 'var(--grad-main)'
    }}>
      <div style={{ fontSize: '64px', marginBottom: 20 }}>🔒</div>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 12 }}>
        Premium Feature
      </h3>
      <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: 24 }}>
        Upgrade to Premium to unlock {featureName}
      </p>
      <button onClick={onUpgrade} className="btn-main" style={{ fontSize: '18px', padding: '12px 32px' }}>
        <Crown size={20} /> Upgrade to Premium
      </button>
    </div>
  );
}

// Premium Features List
export function PremiumFeaturesList() {
  const features = [
    { icon: '📚', text: 'Unlimited Books', free: '50 books', premium: true },
    { icon: '👥', text: 'More Friends', free: '10 friends', premium: '100 friends' },
    { icon: '🎨', text: 'All Themes', free: '6 themes', premium: 'Unlimited' },
    { icon: '👤', text: 'All Avatar Items', free: 'Basic', premium: 'All items' },
    { icon: '📊', text: 'Advanced Analytics', free: 'Basic stats', premium: 'Full analytics' },
    { icon: '🚫', text: 'Ad-Free Experience', free: 'With ads', premium: true },
    { icon: '💰', text: 'Monthly Coins', free: '0', premium: '500 coins' },
    { icon: '👑', text: 'Premium Badge', free: false, premium: true },
    { icon: '🎯', text: 'Early Access', free: false, premium: true },
    { icon: '💬', text: 'Priority Support', free: 'Community', premium: 'Priority' }
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {features.map((feature, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 8
        }}>
          <div style={{ fontSize: '24px' }}>{feature.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', marginBottom: 4 }}>{feature.text}</div>
            <div style={{ fontSize: '12px', opacity: 0.6, display: 'flex', gap: 16 }}>
              <span>Free: {typeof feature.free === 'boolean' ? (feature.free ? '✅' : '❌') : feature.free}</span>
              <span style={{ color: '#FFD700' }}>
                Premium: {typeof feature.premium === 'boolean' ? (feature.premium ? '✅' : '❌') : feature.premium}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Premium Status Component
export function PremiumStatus({ userData }) {
  const premium = isPremium(userData);
  const tier = premium ? PREMIUM_TIERS.premium : PREMIUM_TIERS.free;
  
  return (
    <div className="cozy-card" style={{
      padding: 24,
      background: premium ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'var(--bg-card)',
      color: premium ? '#000' : 'inherit'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ fontSize: '48px' }}>
          {premium ? '👑' : '🆓'}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 4 }}>
            {tier.name}
          </h3>
          {premium && userData?.premium?.expiresAt && (
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              Active until {new Date(userData.premium.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: '13px' }}>
        <div>
          <div style={{ opacity: 0.7, marginBottom: 2 }}>Books</div>
          <div style={{ fontWeight: 'bold' }}>
            {tier.features.maxBooks === 'unlimited' ? '∞' : tier.features.maxBooks}
          </div>
        </div>
        <div>
          <div style={{ opacity: 0.7, marginBottom: 2 }}>Friends</div>
          <div style={{ fontWeight: 'bold' }}>
            {tier.features.maxFriends === 'unlimited' ? '∞' : tier.features.maxFriends}
          </div>
        </div>
        <div>
          <div style={{ opacity: 0.7, marginBottom: 2 }}>Themes</div>
          <div style={{ fontWeight: 'bold' }}>
            {tier.features.themes === 'all' ? 'All' : tier.features.themes}
          </div>
        </div>
        <div>
          <div style={{ opacity: 0.7, marginBottom: 2 }}>Support</div>
          <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {tier.features.support}
          </div>
        </div>
      </div>
    </div>
  );
}

export default { isPremium, hasFeature, PremiumBadge, FeatureLock, PremiumFeaturesList, PremiumStatus };
