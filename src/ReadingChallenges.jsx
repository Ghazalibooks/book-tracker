// ⚔️ READING CHALLENGES SYSTEM
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { Target, Trophy, Calendar, Users, Zap, Award, Clock, TrendingUp } from 'lucide-react';

// CHALLENGE TEMPLATES
const CHALLENGE_TEMPLATES = {
  // COMMUNITY CHALLENGES (everyone can join!)
  summer_reading: {
    id: 'summer_reading_2025',
    name: 'Summer Reading Marathon',
    description: 'Read 20 books this summer!',
    type: 'community',
    icon: '☀️',
    goal: { type: 'books_finished', count: 20 },
    reward: { xp: 5000, coins: 2500, badge: 'summer_reader' },
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    participants: 0
  },
  
  page_master: {
    id: 'page_master_jan',
    name: 'Page Master Challenge',
    description: 'Read 1000 pages in January!',
    type: 'community',
    icon: '📄',
    goal: { type: 'pages_read', count: 1000 },
    reward: { xp: 3000, coins: 1500, badge: 'page_master' },
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    participants: 0
  },
  
  speed_challenge: {
    id: 'speed_week_2025',
    name: 'Speed Reading Week',
    description: 'Read 5 books in 7 days!',
    type: 'community',
    icon: '⚡',
    goal: { type: 'books_finished', count: 5 },
    reward: { xp: 2000, coins: 1000, badge: 'speed_demon' },
    startDate: '2025-02-01',
    endDate: '2025-02-07',
    participants: 0
  },
  
  genre_explorer: {
    id: 'genre_explorer_2025',
    name: 'Genre Explorer',
    description: 'Read 5 different genres this month!',
    type: 'community',
    icon: '🗺️',
    goal: { type: 'genres_read', count: 5 },
    reward: { xp: 2500, coins: 1250, badge: 'genre_explorer' },
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    participants: 0
  }
};

// PERSONAL CHALLENGES (user creates their own!)
const PERSONAL_TEMPLATES = [
  {
    name: 'Custom Book Goal',
    description: 'Set your own book reading goal',
    type: 'books_finished',
    icon: '📚',
    options: [5, 10, 20, 50, 100]
  },
  {
    name: 'Custom Page Goal',
    description: 'Set your own page reading goal',
    type: 'pages_read',
    icon: '📄',
    options: [100, 500, 1000, 5000, 10000]
  },
  {
    name: 'Reading Streak',
    description: 'Read every day for X days',
    type: 'streak',
    icon: '🔥',
    options: [7, 14, 30, 60, 90]
  },
  {
    name: 'Reading Time',
    description: 'Read for X hours total',
    type: 'minutes_read',
    icon: '⏰',
    options: [10, 25, 50, 100, 200]
  }
];

export function ReadingChallengesView({ user, userData, showToast }) {
  const [activeTab, setActiveTab] = useState('community');
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadChallenges();
  }, [user.uid]);
  
  const loadChallenges = async () => {
    setLoading(true);
    try {
      // Load community challenges
      const communityList = Object.values(CHALLENGE_TEMPLATES);
      setChallenges(communityList);
      
      // Load user's active challenges
      const q = query(
        collection(db, "userChallenges"),
        where("userId", "==", user.uid),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      setMyChallenges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Load challenges error:", error);
    }
    setLoading(false);
  };
  
  const joinChallenge = async (challenge) => {
    try {
      await addDoc(collection(db, "userChallenges"), {
        userId: user.uid,
        challengeId: challenge.id,
        challengeName: challenge.name,
        type: challenge.type,
        goal: challenge.goal,
        reward: challenge.reward,
        progress: 0,
        status: 'active',
        joinedAt: new Date().toISOString(),
        completedAt: null
      });
      
      showToast(`✅ Joined ${challenge.name}!`);
      await loadChallenges();
    } catch (error) {
      console.error("Join challenge error:", error);
      showToast("❌ Failed to join challenge");
    }
  };
  
  const updateChallengeProgress = async (challengeId, progress) => {
    try {
      const challengeRef = doc(db, "userChallenges", challengeId);
      await updateDoc(challengeRef, {
        progress: progress
      });
    } catch (error) {
      console.error("Update progress error:", error);
    }
  };
  
  const completeChallenge = async (challenge) => {
    try {
      const challengeRef = doc(db, "userChallenges", challenge.id);
      await updateDoc(challengeRef, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      // Award rewards
      await updateDoc(doc(db, "users", user.uid), {
        xp: increment(challenge.reward.xp),
        coins: increment(challenge.reward.coins)
      });
      
      showToast(`🎉 Challenge completed! +${challenge.reward.xp} XP, +${challenge.reward.coins} coins!`);
      await loadChallenges();
    } catch (error) {
      console.error("Complete challenge error:", error);
    }
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚔️ Reading Challenges</h1>
        <p className="page-subtitle">Test your reading skills!</p>
      </div>
      
      {/* Stats */}
      <div className="desktop-grid-3" style={{ marginBottom: 30 }}>
        <div className="stat-card">
          <div className="stat-value">{myChallenges.filter(c => c.status === 'active').length}</div>
          <div className="stat-label">Active Challenges</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{myChallenges.filter(c => c.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {myChallenges.reduce((sum, c) => sum + (c.reward?.xp || 0), 0)}
          </div>
          <div className="stat-label">Total XP Earned</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tab-container">
        <button onClick={() => setActiveTab('community')} className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}>
          <Users size={18} /> Community
        </button>
        <button onClick={() => setActiveTab('active')} className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}>
          <Zap size={18} /> My Active
        </button>
        <button onClick={() => setActiveTab('completed')} className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}>
          <Trophy size={18} /> Completed
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'community' && (
        <>
          <button onClick={() => setShowCreateModal(true)} className="btn-main" style={{ marginBottom: 24 }}>
            <Target size={18} /> Create Personal Challenge
          </button>
          
          <div className="desktop-grid-2">
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={() => joinChallenge(challenge)}
                isJoined={myChallenges.some(c => c.challengeId === challenge.id && c.status === 'active')}
              />
            ))}
          </div>
        </>
      )}
      
      {activeTab === 'active' && (
        <div className="desktop-grid-2">
          {myChallenges.filter(c => c.status === 'active').map(challenge => (
            <ActiveChallengeCard
              key={challenge.id}
              challenge={challenge}
              userData={userData}
              onComplete={() => completeChallenge(challenge)}
            />
          ))}
          
          {myChallenges.filter(c => c.status === 'active').length === 0 && (
            <div className="cozy-card" style={{ padding: 60, textAlign: 'center', gridColumn: '1 / -1' }}>
              <Target size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No active challenges</h3>
              <p style={{ opacity: 0.7 }}>Join a community challenge or create your own!</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'completed' && (
        <div className="desktop-grid-2">
          {myChallenges.filter(c => c.status === 'completed').map(challenge => (
            <CompletedChallengeCard key={challenge.id} challenge={challenge} />
          ))}
          
          {myChallenges.filter(c => c.status === 'completed').length === 0 && (
            <div className="cozy-card" style={{ padding: 60, textAlign: 'center', gridColumn: '1 / -1' }}>
              <Trophy size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No completed challenges yet</h3>
              <p style={{ opacity: 0.7 }}>Complete your first challenge to earn rewards!</p>
            </div>
          )}
        </div>
      )}
      
      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (challenge) => {
            await joinChallenge(challenge);
            setShowCreateModal(false);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function ChallengeCard({ challenge, onJoin, isJoined }) {
  const isActive = new Date() >= new Date(challenge.startDate) && new Date() <= new Date(challenge.endDate);
  
  return (
    <div className="cozy-card" style={{ padding: 24 }}>
      <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: 16 }}>
        {challenge.icon}
      </div>
      
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
        {challenge.name}
      </h3>
      
      <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: 16, textAlign: 'center' }}>
        {challenge.description}
      </p>
      
      <div className="cozy-card" style={{ padding: 12, background: 'rgba(255,255,255,0.03)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '13px', opacity: 0.7 }}>Goal:</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
            {challenge.goal.count} {challenge.goal.type.replace('_', ' ')}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', opacity: 0.7 }}>Reward:</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
            ⭐ {challenge.reward.xp} XP • 💰 {challenge.reward.coins}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '12px', opacity: 0.6 }}>
        <Calendar size={14} />
        <span>
          {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
        </span>
      </div>
      
      {isJoined ? (
        <button className="btn-main" style={{ width: '100%', background: 'var(--success)' }} disabled>
          ✅ Joined
        </button>
      ) : !isActive ? (
        <button className="btn-ghost" style={{ width: '100%' }} disabled>
          ⏰ Not Started
        </button>
      ) : (
        <button onClick={onJoin} className="btn-main" style={{ width: '100%' }}>
          <Target size={18} /> Join Challenge
        </button>
      )}
    </div>
  );
}

function ActiveChallengeCard({ challenge, userData, onComplete }) {
  const getCurrentProgress = () => {
    switch (challenge.goal.type) {
      case 'books_finished':
        return userData.stats?.booksFinished || 0;
      case 'pages_read':
        return userData.stats?.pagesRead || 0;
      case 'minutes_read':
        return userData.stats?.minutesRead || 0;
      case 'streak':
        return userData.streak || 0;
      default:
        return 0;
    }
  };
  
  const progress = getCurrentProgress();
  const percentage = Math.min((progress / challenge.goal.count) * 100, 100);
  const isCompleted = progress >= challenge.goal.count;
  
  return (
    <div className="cozy-card" style={{ padding: 24, border: isCompleted ? '2px solid var(--success)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 4 }}>
            {challenge.challengeName}
          </h3>
          <div style={{ fontSize: '13px', opacity: 0.6 }}>
            {challenge.type === 'community' ? '👥 Community' : '⭐ Personal'}
          </div>
        </div>
        {isCompleted && (
          <div style={{ fontSize: '32px' }}>✅</div>
        )}
      </div>
      
      <div className="progress-bar" style={{ marginBottom: 12, height: 12 }}>
        <div className="progress-fill shimmer" style={{ width: `${percentage}%` }}></div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: 16 }}>
        <span>{progress} / {challenge.goal.count}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      
      <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: 16 }}>
        Reward: ⭐ {challenge.reward.xp} XP • 💰 {challenge.reward.coins}
      </div>
      
      {isCompleted && (
        <button onClick={onComplete} className="btn-main" style={{ width: '100%', background: 'var(--success)' }}>
          <Trophy size={18} /> Claim Reward
        </button>
      )}
    </div>
  );
}

function CompletedChallengeCard({ challenge }) {
  return (
    <div className="cozy-card" style={{ padding: 24, opacity: 0.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: '32px' }}>🏆</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
            {challenge.challengeName}
          </h3>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            Completed {new Date(challenge.completedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div style={{ fontSize: '13px', opacity: 0.7 }}>
        Earned: ⭐ {challenge.reward.xp} XP • 💰 {challenge.reward.coins}
      </div>
    </div>
  );
}

function CreateChallengeModal({ onClose, onCreate, showToast }) {
  const [template, setTemplate] = useState(PERSONAL_TEMPLATES[0]);
  const [goal, setGoal] = useState(template.options[0]);
  const [duration, setDuration] = useState(30);
  
  const handleCreate = () => {
    const challenge = {
      id: `personal_${Date.now()}`,
      name: `${template.name} - ${goal}`,
      description: `${template.description.replace('X', goal)}`,
      type: 'personal',
      icon: template.icon,
      goal: { type: template.type, count: goal },
      reward: {
        xp: goal * 10,
        coins: goal * 5
      },
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
    };
    
    onCreate(challenge);
  };
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 24 }}>
          Create Personal Challenge
        </h2>
        
        <label style={{ display: 'block', marginBottom: 12 }}>Challenge Type</label>
        <select
          value={PERSONAL_TEMPLATES.indexOf(template)}
          onChange={(e) => {
            const newTemplate = PERSONAL_TEMPLATES[e.target.value];
            setTemplate(newTemplate);
            setGoal(newTemplate.options[0]);
          }}
          className="input"
          style={{ marginBottom: 20 }}
        >
          {PERSONAL_TEMPLATES.map((t, i) => (
            <option key={i} value={i}>{t.name}</option>
          ))}
        </select>
        
        <label style={{ display: 'block', marginBottom: 12 }}>Goal</label>
        <select
          value={goal}
          onChange={(e) => setGoal(parseInt(e.target.value))}
          className="input"
          style={{ marginBottom: 20 }}
        >
          {template.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        
        <label style={{ display: 'block', marginBottom: 12 }}>Duration (days)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          className="input"
          min="1"
          max="365"
          style={{ marginBottom: 24 }}
        />
        
        <div className="cozy-card" style={{ padding: 16, background: 'rgba(255,255,255,0.05)', marginBottom: 24 }}>
          <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: 8 }}>Reward:</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            ⭐ {goal * 10} XP • 💰 {goal * 5} coins
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleCreate} className="btn-main" style={{ flex: 1 }}>
            Create Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReadingChallengesView;
