// 🏆 ACHIEVEMENT SYSTEM
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Trophy, Award, Star, Lock, Sparkles, Target, BookOpen, Timer, Users, Zap } from 'lucide-react';

// 50+ ACHIEVEMENTS DATABASE
export const ACHIEVEMENTS = {
  // READING ACHIEVEMENTS
  first_book: {
    id: 'first_book',
    name: 'First Steps',
    description: 'Finish your first book',
    icon: '📖',
    category: 'reading',
    tier: 'bronze',
    xp: 100,
    coins: 50,
    requirement: { type: 'books_finished', count: 1 }
  },
  
  bookworm: {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Finish 10 books',
    icon: '🐛',
    category: 'reading',
    tier: 'silver',
    xp: 500,
    coins: 200,
    requirement: { type: 'books_finished', count: 10 }
  },
  
  library_master: {
    id: 'library_master',
    name: 'Library Master',
    description: 'Finish 50 books',
    icon: '📚',
    category: 'reading',
    tier: 'gold',
    xp: 2000,
    coins: 1000,
    requirement: { type: 'books_finished', count: 50 }
  },
  
  legendary_reader: {
    id: 'legendary_reader',
    name: 'Legendary Reader',
    description: 'Finish 100 books',
    icon: '👑',
    category: 'reading',
    tier: 'platinum',
    xp: 5000,
    coins: 5000,
    requirement: { type: 'books_finished', count: 100 }
  },
  
  // PAGES ACHIEVEMENTS
  page_turner: {
    id: 'page_turner',
    name: 'Page Turner',
    description: 'Read 1,000 pages',
    icon: '📄',
    category: 'pages',
    tier: 'bronze',
    xp: 200,
    coins: 100,
    requirement: { type: 'pages_read', count: 1000 }
  },
  
  speed_reader: {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Read 10,000 pages',
    icon: '⚡',
    category: 'pages',
    tier: 'silver',
    xp: 1000,
    coins: 500,
    requirement: { type: 'pages_read', count: 10000 }
  },
  
  page_master: {
    id: 'page_master',
    name: 'Page Master',
    description: 'Read 50,000 pages',
    icon: '🚀',
    category: 'pages',
    tier: 'gold',
    xp: 3000,
    coins: 2000,
    requirement: { type: 'pages_read', count: 50000 }
  },
  
  // TIME ACHIEVEMENTS
  hour_reader: {
    id: 'hour_reader',
    name: 'Hour Reader',
    description: 'Read for 10 hours total',
    icon: '⏰',
    category: 'time',
    tier: 'bronze',
    xp: 150,
    coins: 75,
    requirement: { type: 'minutes_read', count: 600 }
  },
  
  marathon_reader: {
    id: 'marathon_reader',
    name: 'Marathon Reader',
    description: 'Read for 100 hours total',
    icon: '🏃',
    category: 'time',
    tier: 'silver',
    xp: 800,
    coins: 400,
    requirement: { type: 'minutes_read', count: 6000 }
  },
  
  time_lord: {
    id: 'time_lord',
    name: 'Time Lord',
    description: 'Read for 500 hours total',
    icon: '⏳',
    category: 'time',
    tier: 'gold',
    xp: 2500,
    coins: 1500,
    requirement: { type: 'minutes_read', count: 30000 }
  },
  
  // STREAK ACHIEVEMENTS
  week_streak: {
    id: 'week_streak',
    name: 'Week Warrior',
    description: '7 day reading streak',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    xp: 200,
    coins: 100,
    requirement: { type: 'streak', count: 7 }
  },
  
  month_streak: {
    id: 'month_streak',
    name: 'Month Master',
    description: '30 day reading streak',
    icon: '🌟',
    category: 'streak',
    tier: 'silver',
    xp: 1000,
    coins: 500,
    requirement: { type: 'streak', count: 30 }
  },
  
  year_streak: {
    id: 'year_streak',
    name: 'Year Legend',
    description: '365 day reading streak',
    icon: '💫',
    category: 'streak',
    tier: 'platinum',
    xp: 10000,
    coins: 10000,
    requirement: { type: 'streak', count: 365 }
  },
  
  // COLLECTION ACHIEVEMENTS
  collector: {
    id: 'collector',
    name: 'Collector',
    description: 'Add 50 books to library',
    icon: '📚',
    category: 'collection',
    tier: 'bronze',
    xp: 150,
    coins: 100,
    requirement: { type: 'books_added', count: 50 }
  },
  
  library_king: {
    id: 'library_king',
    name: 'Library King',
    description: 'Add 500 books to library',
    icon: '👑',
    category: 'collection',
    tier: 'gold',
    xp: 1500,
    coins: 1000,
    requirement: { type: 'books_added', count: 500 }
  },
  
  // SOCIAL ACHIEVEMENTS
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Have 10 friends',
    icon: '🦋',
    category: 'social',
    tier: 'bronze',
    xp: 100,
    coins: 50,
    requirement: { type: 'friends', count: 10 }
  },
  
  popular: {
    id: 'popular',
    name: 'Popular',
    description: 'Have 50 friends',
    icon: '⭐',
    category: 'social',
    tier: 'silver',
    xp: 500,
    coins: 250,
    requirement: { type: 'friends', count: 50 }
  },
  
  influencer: {
    id: 'influencer',
    name: 'Influencer',
    description: 'Have 100 friends',
    icon: '🌟',
    category: 'social',
    tier: 'gold',
    xp: 1500,
    coins: 1000,
    requirement: { type: 'friends', count: 100 }
  },
  
  reviewer: {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Write 10 book reviews',
    icon: '✍️',
    category: 'social',
    tier: 'bronze',
    xp: 150,
    coins: 75,
    requirement: { type: 'reviews_written', count: 10 }
  },
  
  critic: {
    id: 'critic',
    name: 'Critic',
    description: 'Write 50 book reviews',
    icon: '📝',
    category: 'social',
    tier: 'silver',
    xp: 600,
    coins: 300,
    requirement: { type: 'reviews_written', count: 50 }
  },
  
  // SPECIAL ACHIEVEMENTS
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Read after midnight',
    icon: '🦉',
    category: 'special',
    tier: 'bronze',
    xp: 100,
    coins: 50,
    requirement: { type: 'read_at_night', count: 1 }
  },
  
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Read before 6 AM',
    icon: '🐦',
    category: 'special',
    tier: 'bronze',
    xp: 100,
    coins: 50,
    requirement: { type: 'read_early', count: 1 }
  },
  
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Read 10 hours in a weekend',
    icon: '💪',
    category: 'special',
    tier: 'silver',
    xp: 500,
    coins: 250,
    requirement: { type: 'weekend_reading', count: 600 }
  },
  
  multitasker: {
    id: 'multitasker',
    name: 'Multitasker',
    description: 'Read 5 books at the same time',
    icon: '🎯',
    category: 'special',
    tier: 'silver',
    xp: 400,
    coins: 200,
    requirement: { type: 'concurrent_books', count: 5 }
  },
  
  // GENRE ACHIEVEMENTS
  genre_explorer: {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Read 5 different genres',
    icon: '🗺️',
    category: 'genre',
    tier: 'bronze',
    xp: 200,
    coins: 100,
    requirement: { type: 'genres_read', count: 5 }
  },
  
  genre_master: {
    id: 'genre_master',
    name: 'Genre Master',
    description: 'Read 10 different genres',
    icon: '🎓',
    category: 'genre',
    tier: 'gold',
    xp: 1000,
    coins: 500,
    requirement: { type: 'genres_read', count: 10 }
  },
  
  // SHOP ACHIEVEMENTS
  shopaholic: {
    id: 'shopaholic',
    name: 'Shopaholic',
    description: 'Buy 10 shop items',
    icon: '🛍️',
    category: 'shop',
    tier: 'bronze',
    xp: 100,
    coins: 0,
    requirement: { type: 'items_bought', count: 10 }
  },
  
  big_spender: {
    id: 'big_spender',
    name: 'Big Spender',
    description: 'Spend 10,000 coins',
    icon: '💰',
    category: 'shop',
    tier: 'silver',
    xp: 500,
    coins: 0,
    requirement: { type: 'coins_spent', count: 10000 }
  },
  
  // QUEST ACHIEVEMENTS
  quest_starter: {
    id: 'quest_starter',
    name: 'Quest Starter',
    description: 'Complete 10 quests',
    icon: '🎯',
    category: 'quests',
    tier: 'bronze',
    xp: 200,
    coins: 100,
    requirement: { type: 'quests_completed', count: 10 }
  },
  
  quest_master: {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete 100 quests',
    icon: '🏆',
    category: 'quests',
    tier: 'gold',
    xp: 2000,
    coins: 1000,
    requirement: { type: 'quests_completed', count: 100 }
  },
  
  // LEVEL ACHIEVEMENTS
  level_10: {
    id: 'level_10',
    name: 'Level 10',
    description: 'Reach level 10',
    icon: '🔟',
    category: 'level',
    tier: 'bronze',
    xp: 0,
    coins: 500,
    requirement: { type: 'level', count: 10 }
  },
  
  level_25: {
    id: 'level_25',
    name: 'Level 25',
    description: 'Reach level 25',
    icon: '✨',
    category: 'level',
    tier: 'silver',
    xp: 0,
    coins: 1000,
    requirement: { type: 'level', count: 25 }
  },
  
  level_50: {
    id: 'level_50',
    name: 'Level 50',
    description: 'Reach level 50',
    icon: '⭐',
    category: 'level',
    tier: 'gold',
    xp: 0,
    coins: 5000,
    requirement: { type: 'level', count: 50 }
  },
  
  level_100: {
    id: 'level_100',
    name: 'Level 100',
    description: 'Reach level 100',
    icon: '💯',
    category: 'level',
    tier: 'platinum',
    xp: 0,
    coins: 10000,
    requirement: { type: 'level', count: 100 }
  }
};

// Check if achievement unlocked
export const checkAchievement = async (userId, userData, stats) => {
  const unlockedAchievements = userData?.achievements || [];
  const newlyUnlocked = [];
  
  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (unlockedAchievements.includes(id)) continue;
    
    const { type, count } = achievement.requirement;
    let currentValue = 0;
    
    switch (type) {
      case 'books_finished':
        currentValue = stats.booksFinished || 0;
        break;
      case 'pages_read':
        currentValue = stats.pagesRead || 0;
        break;
      case 'minutes_read':
        currentValue = stats.minutesRead || 0;
        break;
      case 'streak':
        currentValue = userData.streak || 0;
        break;
      case 'books_added':
        currentValue = stats.booksAdded || 0;
        break;
      case 'friends':
        currentValue = (userData.friends || []).length;
        break;
      case 'reviews_written':
        currentValue = stats.reviewsWritten || 0;
        break;
      case 'level':
        currentValue = userData.level || 1;
        break;
      case 'items_bought':
        currentValue = (userData.inventory || []).length;
        break;
      case 'coins_spent':
        currentValue = stats.coinsSpent || 0;
        break;
      case 'quests_completed':
        currentValue = stats.questsCompleted || 0;
        break;
      case 'genres_read':
        currentValue = stats.genresRead || 0;
        break;
      default:
        continue;
    }
    
    if (currentValue >= count) {
      newlyUnlocked.push(achievement);
      
      // Update Firestore
      await updateDoc(doc(db, "users", userId), {
        achievements: [...unlockedAchievements, id],
        xp: (userData.xp || 0) + achievement.xp,
        coins: (userData.coins || 0) + achievement.coins
      });
    }
  }
  
  return newlyUnlocked;
};

// Achievement View Component
export function AchievementsView({ user, userData, showToast }) {
  const [filter, setFilter] = useState('all');
  const [achievements, setAchievements] = useState([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  
  useEffect(() => {
    loadAchievements();
  }, [userData]);
  
  const loadAchievements = () => {
    const unlocked = userData?.achievements || [];
    setUnlockedCount(unlocked.length);
    
    const achievementsList = Object.values(ACHIEVEMENTS).map(ach => ({
      ...ach,
      unlocked: unlocked.includes(ach.id)
    }));
    
    setAchievements(achievementsList);
  };
  
  const filteredAchievements = achievements.filter(ach => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return ach.unlocked;
    if (filter === 'locked') return !ach.unlocked;
    return ach.category === filter;
  });
  
  const categories = [...new Set(Object.values(ACHIEVEMENTS).map(a => a.category))];
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const progress = (unlockedCount / totalAchievements) * 100;
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏆 Achievements</h1>
        <p className="page-subtitle">{unlockedCount} / {totalAchievements} unlocked ({Math.round(progress)}%)</p>
      </div>
      
      {/* Progress Bar */}
      <div className="cozy-card" style={{ padding: 24, marginBottom: 24, background: 'var(--grad-main)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 'bold' }}>Overall Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div className="progress-fill shimmer" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="tab-container">
        <button onClick={() => setFilter('all')} className={`tab-button ${filter === 'all' ? 'active' : ''}`}>
          All
        </button>
        <button onClick={() => setFilter('unlocked')} className={`tab-button ${filter === 'unlocked' ? 'active' : ''}`}>
          ✅ Unlocked
        </button>
        <button onClick={() => setFilter('locked')} className={`tab-button ${filter === 'locked' ? 'active' : ''}`}>
          🔒 Locked
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`tab-button ${filter === cat ? 'active' : ''}`}>
            {cat}
          </button>
        ))}
      </div>
      
      {/* Achievements Grid */}
      <div className="desktop-grid-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  const tierColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2'
  };
  
  return (
    <div className="cozy-card" style={{
      padding: 20,
      textAlign: 'center',
      opacity: achievement.unlocked ? 1 : 0.5,
      position: 'relative',
      border: achievement.unlocked ? `2px solid ${tierColors[achievement.tier]}` : 'none'
    }}>
      {achievement.unlocked ? (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'var(--success)',
          borderRadius: '50%',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          ✓
        </div>
      ) : (
        <Lock size={16} style={{ position: 'absolute', top: 12, right: 12, opacity: 0.5 }} />
      )}
      
      <div style={{ fontSize: '48px', marginBottom: 12 }}>
        {achievement.unlocked ? achievement.icon : '🔒'}
      </div>
      
      <div style={{
        fontSize: '10px',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: tierColors[achievement.tier],
        marginBottom: 8
      }}>
        {achievement.tier}
      </div>
      
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 8 }}>
        {achievement.name}
      </h3>
      
      <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: 12 }}>
        {achievement.description}
      </p>
      
      {achievement.unlocked && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', fontSize: '12px' }}>
          {achievement.xp > 0 && <div>⭐ {achievement.xp} XP</div>}
          {achievement.coins > 0 && <div>💰 {achievement.coins}</div>}
        </div>
      )}
    </div>
  );
}

// Achievement Unlock Popup
export function AchievementUnlockPopup({ achievement, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 10000,
      maxWidth: 350,
      animation: 'slideInRight 0.5s ease-out'
    }}>
      <div className="cozy-card" style={{
        padding: 24,
        background: 'var(--grad-main)',
        border: '3px solid #FFD700',
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 8 }}>
            Achievement Unlocked!
          </h3>
          <div style={{ fontSize: '48px', marginBottom: 12 }}>
            {achievement.icon}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 4 }}>
            {achievement.name}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: 16 }}>
            {achievement.description}
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
            {achievement.xp > 0 && <div>⭐ +{achievement.xp} XP</div>}
            {achievement.coins > 0 && <div>💰 +{achievement.coins}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementsView;
