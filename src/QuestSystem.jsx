// 🎯 QUEST SYSTEM - PHASE 28
// Daily, Weekly & Monthly Quests

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { Target, Trophy, Check, Clock, Zap, BookOpen, Timer, Gift } from 'lucide-react';

const QUEST_TEMPLATES = {
  daily: [
    { id: 'd1', type: 'read_pages', goal: 10, xp: 50, coins: 20, desc: 'Read 10 pages' },
    { id: 'd2', type: 'read_minutes', goal: 15, xp: 50, coins: 20, desc: 'Read for 15 minutes' },
    { id: 'd3', type: 'add_books', goal: 1, xp: 30, coins: 10, desc: 'Add a new book' },
    { id: 'd4', type: 'write_review', goal: 1, xp: 100, coins: 50, desc: 'Write a book review' },
    { id: 'd5', type: 'use_timer', goal: 1, xp: 40, coins: 15, desc: 'Use the reading timer' }
  ],
  weekly: [
    { id: 'w1', type: 'read_pages', goal: 100, xp: 300, coins: 150, desc: 'Read 100 pages this week' },
    { id: 'w2', type: 'read_minutes', goal: 180, xp: 300, coins: 150, desc: 'Read for 3 hours total' },
    { id: 'w3', type: 'finish_books', goal: 1, xp: 500, coins: 250, desc: 'Finish a book' },
    { id: 'w4', type: 'write_reviews', goal: 3, xp: 400, coins: 200, desc: 'Write 3 reviews' }
  ],
  monthly: [
    { id: 'm1', type: 'read_pages', goal: 500, xp: 1500, coins: 1000, desc: 'Read 500 pages this month' },
    { id: 'm2', type: 'finish_books', goal: 3, xp: 2000, coins: 1500, desc: 'Finish 3 books' }
  ]
};

function generateDailyQuests() {
  const shuffled = [...QUEST_TEMPLATES.daily].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(t => ({ ...t, current: 0, completed: false, claimedAt: null }));
}

function generateWeeklyQuests() {
  const shuffled = [...QUEST_TEMPLATES.weekly].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(t => ({ ...t, current: 0, completed: false, claimedAt: null }));
}

function generateMonthlyQuests() {
  return QUEST_TEMPLATES.monthly.map(t => ({ ...t, current: 0, completed: false, claimedAt: null }));
}

function shouldResetQuests(lastReset, type) {
  if (!lastReset) return true;
  const now = new Date();
  const last = new Date(lastReset);
  
  if (type === 'daily') {
    return now.getDate() !== last.getDate() || now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
  }
  if (type === 'weekly') {
    const nowWeek = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    const lastWeek = Math.ceil((last - new Date(last.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    return nowWeek !== lastWeek || now.getFullYear() !== last.getFullYear();
  }
  if (type === 'monthly') {
    return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
  }
  return false;
}

export async function updateQuestProgress(userId, questType, amount = 1) {
  try {
    const questDoc = await getDoc(doc(db, "quests", userId));
    if (!questDoc.exists()) return;
    
    const data = questDoc.data();
    let updated = false;
    
    ['daily', 'weekly', 'monthly'].forEach(period => {
      if (data[period]) {
        data[period] = data[period].map(quest => {
          if (quest.type === questType && !quest.completed) {
            quest.current = Math.min(quest.current + amount, quest.goal);
            if (quest.current >= quest.goal) quest.completed = true;
            updated = true;
          }
          return quest;
        });
      }
    });
    
    if (updated) await setDoc(doc(db, "quests", userId), data);
  } catch (error) {
    console.error("Update quest error:", error);
  }
}

export function QuestView({ user, userData, showToast }) {
  const [quests, setQuests] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadQuests();
  }, [user]);
  
  const loadQuests = async () => {
    try {
      const questDoc = await getDoc(doc(db, "quests", user.uid));
      let questData = questDoc.exists() ? questDoc.data() : null;
      
      if (!questData) {
        questData = {
          daily: generateDailyQuests(),
          weekly: generateWeeklyQuests(),
          monthly: generateMonthlyQuests(),
          lastResetDaily: new Date().toISOString(),
          lastResetWeekly: new Date().toISOString(),
          lastResetMonthly: new Date().toISOString()
        };
        await setDoc(doc(db, "quests", user.uid), questData);
      } else {
        let needsUpdate = false;
        
        if (shouldResetQuests(questData.lastResetDaily, 'daily')) {
          questData.daily = generateDailyQuests();
          questData.lastResetDaily = new Date().toISOString();
          needsUpdate = true;
        }
        if (shouldResetQuests(questData.lastResetWeekly, 'weekly')) {
          questData.weekly = generateWeeklyQuests();
          questData.lastResetWeekly = new Date().toISOString();
          needsUpdate = true;
        }
        if (shouldResetQuests(questData.lastResetMonthly, 'monthly')) {
          questData.monthly = generateMonthlyQuests();
          questData.lastResetMonthly = new Date().toISOString();
          needsUpdate = true;
        }
        
        if (needsUpdate) await setDoc(doc(db, "quests", user.uid), questData);
      }
      
      setQuests(questData);
      setLoading(false);
    } catch (error) {
      console.error("Load quests error:", error);
      setLoading(false);
    }
  };
  
  const claimReward = async (period, questId) => {
    const quest = quests[period].find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimedAt) return;
    
    try {
      await setDoc(doc(db, "users", user.uid), {
        xp: increment(quest.xp),
        coins: increment(quest.coins)
      }, { merge: true });
      
      const updatedQuests = { ...quests };
      updatedQuests[period] = updatedQuests[period].map(q => q.id === questId ? { ...q, claimedAt: new Date().toISOString() } : q);
      
      await setDoc(doc(db, "quests", user.uid), updatedQuests);
      setQuests(updatedQuests);
      
      showToast(`🎁 Claimed: +${quest.xp} XP, +${quest.coins} coins!`);
    } catch (error) {
      console.error("Claim reward error:", error);
      showToast("❌ Failed to claim reward");
    }
  };
  
  const getTimeUntilReset = (period) => {
    const now = new Date();
    let resetTime;
    
    if (period === 'daily') {
      resetTime = new Date(now);
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      resetTime = new Date(now);
      const daysUntilMonday = (8 - now.getDay()) % 7;
      resetTime.setDate(resetTime.getDate() + daysUntilMonday);
      resetTime.setHours(0, 0, 0, 0);
    } else {
      resetTime = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    
    const diff = resetTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };
  
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 20 }}>Loading quests...</p>
      </div>
    );
  }
  
  const currentQuests = quests[activeTab] || [];
  const completedCount = currentQuests.filter(q => q.completed).length;
  const totalCount = currentQuests.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ padding: '0 20px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 8 }}>🎯 Quests</h1>
        <p style={{ opacity: 0.7 }}>Complete quests to earn XP & Coins!</p>
      </div>
      
      <div style={{ display: 'flex', gap: 10, padding: '0 20px 20px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('daily')} className={`btn-ghost ${activeTab === 'daily' ? 'active' : ''}`} style={{ flex: 1, minWidth: 100 }}>
          <Zap size={18} /> Daily
        </button>
        <button onClick={() => setActiveTab('weekly')} className={`btn-ghost ${activeTab === 'weekly' ? 'active' : ''}`} style={{ flex: 1, minWidth: 100 }}>
          <Target size={18} /> Weekly
        </button>
        <button onClick={() => setActiveTab('monthly')} className={`btn-ghost ${activeTab === 'monthly' ? 'active' : ''}`} style={{ flex: 1, minWidth: 100 }}>
          <Trophy size={18} /> Monthly
        </button>
      </div>
      
      <div className="cozy-card" style={{ margin: '0 20px 20px', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>Progress</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{completedCount}/{totalCount}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>Resets in</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent)' }}>
              <Clock size={16} style={{ display: 'inline', marginRight: 5 }} />
              {getTimeUntilReset(activeTab)}
            </div>
          </div>
        </div>
        
        <div className="progress-bar" style={{ height: 10, borderRadius: 10 }}>
          <div className="progress-fill shimmer" style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 10, transition: 'width 0.5s' }}></div>
        </div>
      </div>
      
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {currentQuests.map(quest => {
          const progress = Math.min((quest.current / quest.goal) * 100, 100);
          const isCompleted = quest.completed;
          const isClaimed = quest.claimedAt !== null;
          
          return (
            <div key={quest.id} className="cozy-card" style={{ padding: 20, opacity: isClaimed ? 0.6 : 1, border: isCompleted && !isClaimed ? '2px solid var(--accent)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 6 }}>{quest.desc}</h3>
                  <div style={{ fontSize: '14px', opacity: 0.7 }}>Progress: {quest.current}/{quest.goal}</div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Rewards</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>+{quest.xp} XP</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#F59E0B' }}>+{quest.coins} 💰</div>
                </div>
              </div>
              
              <div className="progress-bar" style={{ marginBottom: 12, height: 8, borderRadius: 8 }}>
                <div className={`progress-fill ${isCompleted ? 'shimmer' : ''}`} style={{ width: `${progress}%`, height: '100%', borderRadius: 8, transition: 'width 0.5s' }}></div>
              </div>
              
              {isClaimed ? (
                <div style={{ padding: '10px 20px', background: 'var(--success)', borderRadius: 8, textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                  ✅ Claimed!
                </div>
              ) : isCompleted ? (
                <button onClick={() => claimReward(activeTab, quest.id)} className="btn-main" style={{ width: '100%', background: 'var(--grad-main)', animation: 'pulse 2s infinite' }}>
                  <Gift size={18} /> Claim Reward
                </button>
              ) : (
                <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, textAlign: 'center', fontSize: '14px', opacity: 0.6 }}>
                  In Progress...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
