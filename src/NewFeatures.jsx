// 🆕 NEW FEATURES - Live Sessions, Tournament, Story Mode, Smart Search, Personality
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// ========================================
// 1. LIVE READING SESSIONS
// ========================================
export function LiveSessionsView({ user, userData, showToast }) {
  const [activeSessions, setActiveSessions] = useState([]);
  const [mySession, setMySession] = useState(null);
  const [creating, setCreating] = useState(false);
  
  useEffect(() => {
    // Listen to active sessions
    const q = query(collection(db, "liveSessions"), where("active", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);
  
  const createSession = async (bookTitle) => {
    setCreating(true);
    try {
      const sessionRef = await addDoc(collection(db, "liveSessions"), {
        hostId: user.uid,
        hostName: userData.displayName,
        bookTitle,
        participants: [user.uid],
        chat: [],
        active: true,
        createdAt: new Date().toISOString()
      });
      
      setMySession(sessionRef.id);
      showToast("📚 Live session started!");
    } catch (error) {
      showToast("❌ Failed to create session");
    }
    setCreating(false);
  };
  
  const joinSession = async (sessionId) => {
    try {
      await updateDoc(doc(db, "liveSessions", sessionId), {
        participants: arrayUnion(user.uid)
      });
      setMySession(sessionId);
      showToast("✅ Joined session!");
    } catch (error) {
      showToast("❌ Failed to join");
    }
  };
  
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 20 }}>
        📡 Live Reading Sessions
      </h2>
      
      {!mySession && (
        <button onClick={() => createSession("My Book")} className="btn-main" style={{ marginBottom: 20 }} disabled={creating}>
          {creating ? 'Creating...' : '+ Start Live Session'}
        </button>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeSessions.map(session => (
          <div key={session.id} className="cozy-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{session.bookTitle}</div>
                <div style={{ fontSize: '13px', opacity: 0.7 }}>
                  Host: {session.hostName} • {session.participants.length} reading
                </div>
              </div>
              {!mySession && (
                <button onClick={() => joinSession(session.id)} className="btn-main">
                  Join
                </button>
              )}
              {mySession === session.id && (
                <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ Active</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// 2. TOURNAMENT MODE
// ========================================
export function TournamentView({ user, userData, showToast }) {
  const tournaments = [
    {
      id: 1,
      name: 'January Reading Marathon',
      description: 'Read the most pages in January!',
      prize: '1000 coins + Premium Badge',
      participants: 156,
      endsAt: '2025-01-31',
      icon: '🏆'
    },
    {
      id: 2,
      name: 'Speed Reading Challenge',
      description: 'Finish 5 books the fastest!',
      prize: '500 coins',
      participants: 89,
      endsAt: '2025-02-15',
      icon: '⚡'
    }
  ];
  
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 20 }}>
        🏆 Tournaments
      </h2>
      
      <div className="desktop-grid-2">
        {tournaments.map(t => (
          <div key={t.id} className="cozy-card" style={{ padding: 24 }}>
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: 12 }}>{t.icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 8 }}>{t.name}</h3>
            <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: 12 }}>{t.description}</p>
            <div style={{ fontSize: '13px', marginBottom: 16 }}>
              <div>🎁 Prize: {t.prize}</div>
              <div>👥 {t.participants} participants</div>
              <div>⏰ Ends: {new Date(t.endsAt).toLocaleDateString()}</div>
            </div>
            <button onClick={() => showToast('✅ Joined tournament!')} className="btn-main" style={{ width: '100%' }}>
              Join Tournament
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// 3. STORY MODE (Instagram-style)
// ========================================
export function StoryModeView({ user, userData, showToast }) {
  const [stories, setStories] = useState([
    {
      id: 1,
      userId: 'user1',
      userName: 'Alice',
      avatar: { skin: 'medium' },
      type: 'achievement',
      content: 'Just unlocked Bookworm achievement! 🐛',
      timestamp: Date.now() - 3600000
    },
    {
      id: 2,
      userId: 'user2',
      userName: 'Bob',
      avatar: { skin: 'light' },
      type: 'book_finished',
      book: { title: 'Dune', author: 'Frank Herbert' },
      rating: 5,
      timestamp: Date.now() - 7200000
    }
  ]);
  
  const createStory = async (content) => {
    const newStory = {
      userId: user.uid,
      userName: userData.displayName,
      avatar: userData.avatar,
      type: 'text',
      content,
      timestamp: Date.now()
    };
    
    setStories([newStory, ...stories]);
    showToast("✅ Story posted!");
  };
  
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 20 }}>
        📸 Reading Stories
      </h2>
      
      {/* Story Creator */}
      <div className="cozy-card" style={{ padding: 20, marginBottom: 20 }}>
        <input 
          type="text" 
          placeholder="Share your reading moment..."
          className="input"
          style={{ marginBottom: 12 }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value) {
              createStory(e.target.value);
              e.target.value = '';
            }
          }}
        />
        <button className="btn-main">
          + Post Story
        </button>
      </div>
      
      {/* Stories Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {stories.map(story => (
          <div key={story.id} className="cozy-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {story.userName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{story.userName}</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>
                  {Math.floor((Date.now() - story.timestamp) / 60000)}m ago
                </div>
              </div>
            </div>
            
            {story.type === 'book_finished' && (
              <div>
                <div style={{ marginBottom: 8 }}>Finished reading:</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: 4 }}>
                  {story.book.title}
                </div>
                <div style={{ opacity: 0.7, marginBottom: 8 }}>{story.book.author}</div>
                <div>{'⭐'.repeat(story.rating)}</div>
              </div>
            )}
            
            {story.type === 'text' && (
              <div style={{ fontSize: '15px' }}>{story.content}</div>
            )}
            
            {story.type === 'achievement' && (
              <div style={{ fontSize: '15px' }}>🎉 {story.content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// 4. SMART SEARCH (AI-powered)
// ========================================
export function SmartSearchView({ books, showToast }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const smartSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    
    // Simulate AI search - in production: use actual AI/ML
    setTimeout(() => {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filtered);
      setSearching(false);
    }, 500);
  };
  
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 20 }}>
        🔍 Smart Search
      </h2>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && smartSearch()}
          placeholder="Try: 'sci-fi books I haven't read', 'books like Dune'..."
          className="input"
          style={{ flex: 1 }}
        />
        <button onClick={smartSearch} className="btn-main" disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 12 }}>
            Found {results.length} results
          </h3>
          <div className="desktop-grid-4">
            {results.map(book => (
              <div key={book.id} className="cozy-card" style={{ padding: 16 }}>
                {book.coverUrl && (
                  <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                )}
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 4 }}>{book.title}</h4>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>{book.author}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// 5. READING PERSONALITY ANALYSIS
// ========================================
export function PersonalityAnalysisView({ userData, books }) {
  // Analyze reading habits
  const totalBooks = books.length;
  const finishedBooks = books.filter(b => b.status === 'finished').length;
  const avgPages = books.reduce((sum, b) => sum + b.pages, 0) / totalBooks || 0;
  
  // Determine personality type
  let personalityType = 'Explorer';
  let description = 'You love discovering new books and genres!';
  
  if (finishedBooks > 50) {
    personalityType = 'Master Reader';
    description = 'You\'re a reading machine! Incredible dedication.';
  } else if (avgPages > 400) {
    personalityType = 'Epic Reader';
    description = 'You prefer long, immersive stories.';
  } else if (userData.streak > 30) {
    personalityType = 'Consistent Reader';
    description = 'Reading is part of your daily routine!';
  }
  
  const traits = [
    { name: 'Reading Speed', value: 75, color: '#4ECDC4' },
    { name: 'Consistency', value: Math.min((userData.streak / 30) * 100, 100), color: '#FF6B6B' },
    { name: 'Genre Diversity', value: 60, color: '#FFD93D' },
    { name: 'Completion Rate', value: (finishedBooks / totalBooks) * 100 || 0, color: '#A8DADC' }
  ];
  
  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 20 }}>
        🧠 Reading Personality
      </h2>
      
      <div className="cozy-card" style={{ padding: 40, textAlign: 'center', background: 'var(--grad-main)', marginBottom: 30 }}>
        <div style={{ fontSize: '64px', marginBottom: 16 }}>🎭</div>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 12 }}>{personalityType}</h3>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>{description}</p>
      </div>
      
      <div className="cozy-card" style={{ padding: 32 }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 20 }}>Your Traits</h3>
        
        {traits.map(trait => (
          <div key={trait.name} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{trait.name}</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(trait.value)}%</span>
            </div>
            <div className="progress-bar">
              <div style={{
                width: `${trait.value}%`,
                height: '100%',
                background: trait.color,
                borderRadius: 999,
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  LiveSessionsView,
  TournamentView,
  StoryModeView,
  SmartSearchView,
  PersonalityAnalysisView
};
