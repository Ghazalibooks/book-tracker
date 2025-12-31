// 🎮 LEADERBOARDS SYSTEM
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import { Trophy, TrendingUp, Users, Globe, Calendar, Award, Crown, Medal } from 'lucide-react';
import { SimpleAvatar } from './AvatarBuilder';

export function LeaderboardsView({ user, userData, showToast }) {
  const [activeTab, setActiveTab] = useState('global');
  const [activeCategory, setActiveCategory] = useState('pages');
  const [timePeriod, setTimePeriod] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState(null);
  
  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, activeCategory, timePeriod]);
  
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      if (activeTab === 'global') {
        await loadGlobalLeaderboard();
      } else {
        await loadFriendsLeaderboard();
      }
    } catch (error) {
      console.error("Load leaderboard error:", error);
      showToast("❌ Failed to load leaderboard");
    }
    setLoading(false);
  };
  
  const loadGlobalLeaderboard = async () => {
    let orderField = 'stats.pagesRead';
    
    switch (activeCategory) {
      case 'pages':
        orderField = 'stats.pagesRead';
        break;
      case 'books':
        orderField = 'stats.booksFinished';
        break;
      case 'level':
        orderField = 'level';
        break;
      case 'streak':
        orderField = 'streak';
        break;
      case 'coins':
        orderField = 'coins';
        break;
      case 'xp':
        orderField = 'xp';
        break;
    }
    
    // Get top 100 users
    const q = query(
      collection(db, "users"),
      orderBy(orderField, "desc"),
      limit(100)
    );
    
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data()
    }));
    
    setLeaderboard(users);
    
    // Find current user's rank
    const currentUserRank = users.findIndex(u => u.id === user.uid) + 1;
    setUserRank(currentUserRank || null);
  };
  
  const loadFriendsLeaderboard = async () => {
    const friendIds = userData?.friends || [];
    
    if (friendIds.length === 0) {
      setLeaderboard([]);
      return;
    }
    
    // Get friends data
    const friendsData = [];
    for (const friendId of friendIds) {
      const q = query(collection(db, "users"), where("__name__", "==", friendId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        friendsData.push({ id: friendId, ...snapshot.docs[0].data() });
      }
    }
    
    // Add current user
    friendsData.push({ id: user.uid, ...userData });
    
    // Sort based on category
    const sorted = friendsData.sort((a, b) => {
      switch (activeCategory) {
        case 'pages':
          return (b.stats?.pagesRead || 0) - (a.stats?.pagesRead || 0);
        case 'books':
          return (b.stats?.booksFinished || 0) - (a.stats?.booksFinished || 0);
        case 'level':
          return (b.level || 0) - (a.level || 0);
        case 'streak':
          return (b.streak || 0) - (a.streak || 0);
        case 'coins':
          return (b.coins || 0) - (a.coins || 0);
        case 'xp':
          return (b.xp || 0) - (a.xp || 0);
        default:
          return 0;
      }
    }).map((user, index) => ({ ...user, rank: index + 1 }));
    
    setLeaderboard(sorted);
    
    const currentUserRank = sorted.findIndex(u => u.id === user.uid) + 1;
    setUserRank(currentUserRank);
  };
  
  const getValue = (userData, category) => {
    switch (category) {
      case 'pages':
        return userData.stats?.pagesRead || 0;
      case 'books':
        return userData.stats?.booksFinished || 0;
      case 'level':
        return userData.level || 1;
      case 'streak':
        return userData.streak || 0;
      case 'coins':
        return userData.coins || 0;
      case 'xp':
        return userData.xp || 0;
      default:
        return 0;
    }
  };
  
  const getLabel = (category) => {
    const labels = {
      pages: 'Pages Read',
      books: 'Books Finished',
      level: 'Level',
      streak: 'Day Streak',
      coins: 'Coins',
      xp: 'XP'
    };
    return labels[category] || category;
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboards</h1>
        <p className="page-subtitle">Compete with readers worldwide!</p>
      </div>
      
      {/* User Rank Card */}
      {userRank && (
        <div className="cozy-card" style={{ padding: 24, marginBottom: 24, background: 'var(--grad-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              #{userRank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 4 }}>Your Rank</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {activeTab === 'global' ? 'Global' : 'Friends'} • {getLabel(activeCategory)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                {getValue(userData, activeCategory).toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {getLabel(activeCategory)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="tab-container">
        <button onClick={() => setActiveTab('global')} className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}>
          <Globe size={18} /> Global
        </button>
        <button onClick={() => setActiveTab('friends')} className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}>
          <Users size={18} /> Friends
        </button>
      </div>
      
      {/* Category Selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {['pages', 'books', 'level', 'streak', 'coins', 'xp'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn-ghost ${activeCategory === cat ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {getLabel(cat)}
          </button>
        ))}
      </div>
      
      {/* Leaderboard */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="cozy-card" style={{ padding: 60, textAlign: 'center' }}>
          <Users size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No data yet</h3>
          <p style={{ opacity: 0.7 }}>
            {activeTab === 'friends' ? 'Add some friends to see their rankings!' : 'Start reading to get on the leaderboard!'}
          </p>
        </div>
      ) : (
        <div>
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
              alignItems: 'flex-end',
              marginBottom: 40,
              padding: 20
            }}>
              {/* 2nd Place */}
              <PodiumCard user={leaderboard[1]} rank={2} category={activeCategory} getValue={getValue} />
              
              {/* 1st Place */}
              <PodiumCard user={leaderboard[0]} rank={1} category={activeCategory} getValue={getValue} />
              
              {/* 3rd Place */}
              <PodiumCard user={leaderboard[2]} rank={3} category={activeCategory} getValue={getValue} />
            </div>
          )}
          
          {/* Rest of Leaderboard */}
          <div className="cozy-card" style={{ padding: 0, overflow: 'hidden' }}>
            {leaderboard.slice(3).map((userData, index) => (
              <LeaderboardRow
                key={userData.id}
                user={userData}
                rank={index + 4}
                category={activeCategory}
                getValue={getValue}
                isCurrentUser={userData.id === user.uid}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PodiumCard({ user, rank, category, getValue }) {
  const heights = { 1: 200, 2: 160, 3: 140 };
  const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
  const icons = { 1: '👑', 2: '🥈', 3: '🥉' };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      order: rank === 1 ? 0 : rank === 2 ? -1 : 1
    }}>
      <SimpleAvatar config={user.avatar} size={rank === 1 ? 80 : 64} />
      <div style={{ fontSize: '32px', margin: '8px 0' }}>{icons[rank]}</div>
      <div style={{ fontWeight: 'bold', fontSize: rank === 1 ? '18px' : '16px', marginBottom: 4, textAlign: 'center' }}>
        {user.displayName}
      </div>
      <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: 8 }}>
        Level {user.level || 1}
      </div>
      <div className="cozy-card" style={{
        padding: 16,
        background: colors[rank],
        color: 'white',
        width: 140,
        textAlign: 'center',
        height: heights[rank],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 4 }}>
          {getValue(user, category).toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          #{rank}
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ user, rank, category, getValue, isCurrentUser }) {
  return (
    <div style={{
      padding: 16,
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: isCurrentUser ? 'var(--accent)' : 'transparent',
      transition: 'all 0.3s'
    }}>
      {/* Rank */}
      <div style={{
        width: 40,
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        opacity: 0.7
      }}>
        #{rank}
      </div>
      
      {/* Avatar */}
      <SimpleAvatar config={user.avatar} size={48} />
      
      {/* User Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: 2 }}>
          {user.displayName}
          {isCurrentUser && <span style={{ marginLeft: 8, fontSize: '12px', opacity: 0.7 }}>(You)</span>}
        </div>
        <div style={{ fontSize: '13px', opacity: 0.6 }}>
          Level {user.level || 1} • {user.xp || 0} XP
        </div>
      </div>
      
      {/* Value */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {getValue(user, category).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardsView;
