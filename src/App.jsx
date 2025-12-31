import { DebugPanel } from './DebugSystem';
import { ExtensionSync } from './ExtensionSync';
// PHASE 30 IMPORTS
import { PremiumView } from './PremiumView';
import { IntegrationsView } from './APIIntegrations';
import { LiveSessionsView, TournamentView, StoryModeView, SmartSearchView, PersonalityAnalysisView } from './NewFeatures';
import { Crown, Zap, Radio, Camera, Brain } from 'lucide-react';
import { AchievementsView } from './AchievementSystem';
import { LeaderboardsView } from './Leaderboards';
import { ReadingChallengesView } from './ReadingChallenges';
import { DirectMessagingView } from './DirectMessaging';
import { BookClubsView } from './BookClubs';
import { AdvancedStatisticsView } from './AdvancedStatistics';
import { AIRecommendationsView } from './AIRecommendations';
import { ReadingJournalView } from './ReadingJournal';
import { ThemeCreatorView } from './ThemeCreator';
import { ProfileCustomizationView } from './ProfileCustomization';
import { MusicLibraryPlusView } from './MusicLibraryPlus';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import {
  Library, Timer, BarChart2, Settings, Plus, Search, X, Play, Square,
  Check, Trophy, Edit2, Trash2, Star, Target, User, LogOut, BookOpen,
  ShoppingCart, Users, Music, Gift
} from 'lucide-react';
import { AvatarBuilder, SimpleAvatar } from './AvatarBuilder';
import { QuestView, updateQuestProgress } from './QuestSystem';
import { ShopView } from './ShopSystem';
import { SocialView } from './SocialFeatures';
import { MusicPlayer, MusicPlayerCompact } from './MusicPlayer';
import { ExtendedSettingsView } from './ExtendedSettings';
import { SocialSharingModal, ReferralView, QuickShareButton } from './SocialSharing';
import { OnboardingFlow } from './OnboardingFlow';
import {
  collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, updateDoc,
  increment, deleteDoc
} from 'firebase/firestore';

// TRANSLATIONS
const TRANSLATIONS = {
  en: {
    library: 'Library', timer: 'Timer', stats: 'Stats', quests: 'Quests', shop: 'Shop',
    social: 'Social', music: 'Music', settings: 'Settings', referral: 'Referral',
    myLibrary: 'My Library', books: 'books', all: 'All', reading: 'Reading', finished: 'Finished',
    wishlist: 'Wishlist', addBook: 'Add Book', readingTimer: 'Reading Timer', selectBook: 'Select a book',
    startReading: 'Start Reading', stopReading: 'Stop Reading', statistics: 'Statistics',
    level: 'Level', pagesRead: 'Pages Read', booksFinished: 'Books Finished', currentlyReading: 'Currently Reading',
    coins: 'Coins', streak: 'Streak', days: 'days', customize: 'Customize Avatar', email: 'Email',
    displayName: 'Display Name', theme: 'Theme', language: 'Language', logout: 'Logout',
    save: 'Save', delete: 'Delete', cancel: 'Cancel', author: 'Author', pages: 'Pages',
    currentPage: 'Current Page', rating: 'Rating', review: 'Review', finish: 'Finish Book',
    search: 'Search', manual: 'Manual', searchBooks: 'Search books...', bookTitle: 'Book Title',
    optional: 'optional', numberOfPages: 'Number of pages', noBooksYet: 'No books yet',
    clickToAdd: 'Click the + button to add your first book!', share: 'Share'
  },
  de: {
    library: 'Bibliothek', timer: 'Timer', stats: 'Statistiken', quests: 'Quests', shop: 'Shop',
    social: 'Social', music: 'Musik', settings: 'Einstellungen', referral: 'Empfehlen',
    myLibrary: 'Meine Bibliothek', books: 'Bücher', all: 'Alle', reading: 'Lese ich', finished: 'Fertig',
    wishlist: 'Wunschliste', addBook: 'Buch hinzufügen', readingTimer: 'Lese-Timer', selectBook: 'Buch auswählen',
    startReading: 'Lesen starten', stopReading: 'Lesen beenden', statistics: 'Statistiken',
    level: 'Level', pagesRead: 'Seiten gelesen', booksFinished: 'Bücher beendet', currentlyReading: 'Lese ich gerade',
    coins: 'Münzen', streak: 'Serie', days: 'Tage', customize: 'Avatar anpassen', email: 'E-Mail',
    displayName: 'Anzeigename', theme: 'Design', language: 'Sprache', logout: 'Abmelden',
    save: 'Speichern', delete: 'Löschen', cancel: 'Abbrechen', author: 'Autor', pages: 'Seiten',
    currentPage: 'Aktuelle Seite', rating: 'Bewertung', review: 'Rezension', finish: 'Buch beenden',
    search: 'Suchen', manual: 'Manuell', searchBooks: 'Bücher suchen...', bookTitle: 'Buchtitel',
    optional: 'optional', numberOfPages: 'Seitenzahl', noBooksYet: 'Noch keine Bücher',
    clickToAdd: 'Klicke auf + um dein erstes Buch hinzuzufügen!', share: 'Teilen'
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [books, setBooks] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'mystic');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setTheme(data.theme || 'mystic');
            setLang(data.lang || 'en');
            
            if (!data.onboardingCompleted) {
              setShowOnboarding(true);
            }
          } else {
            setShowOnboarding(true);
            const newUserData = {
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email.split('@')[0],
              createdAt: new Date().toISOString(),
              xp: 0,
              level: 1,
              coins: 0,
              streak: 0,
              theme: 'mystic',
              lang: 'en',
              avatar: {
                skin: 'light', hairStyle: 'short', hairColor: 'black',
                eyeShape: 'round', eyeColor: 'brown', glasses: 'none',
                hat: 'none', clothing: 'tshirt', background: 'library'
              },
              inventory: [],
              wishlist: [],
              friends: [],
              achievements: [],
              customThemes: [],
              profileFrame: 'none',
              profileBackground: 'none',
              customTitle: null,
              privacy: {
                profileVisibility: 'public',
                readingActivity: true,
                showStatistics: true,
                allowMessages: true
              },
              notifications: {
                email: true,
                push: true,
                friendActivity: true,
                achievements: true,
                reminders: true
              },
              goals: {
                daily: 30,
                weekly: 200,
                monthly: 1000,
                yearlyBooks: 12
              },
              accessibility: {
                fontSize: 'normal',
                highContrast: false,
                reduceMotion: false,
                dyslexicFont: false
              },
              stats: {
                booksFinished: 0,
                pagesRead: 0,
                minutesRead: 0,
                reviewsWritten: 0,
                questsCompleted: 0,
                genresRead: 0,
                coinsSpent: 0
              },
              onboardingCompleted: false
            };
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          }
          await loadBooks(currentUser.uid);
        } catch (error) {
          console.error("User data error:", error);
          showToast("❌ Error loading data");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const loadBooks = async (userId) => {
    try {
      const q = query(collection(db, "books"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      setBooks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Load books error:", error);
    }
  };

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3000);
  };
  
  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    const userDoc = await getDoc(doc(db, "users", user.uid));
    setUserData(userDoc.data());
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthView showToast={showToast} />;
  }
  
  if (showOnboarding) {
    return <OnboardingFlow user={user} userData={userData} onComplete={handleOnboardingComplete} showToast={showToast} />;
  }

  const t = TRANSLATIONS[lang];

  return (
    <BrowserRouter>
      {user && <ExtensionSync user={user} />}
      <div className="desktop-container">
        <Sidebar user={user} userData={userData} t={t} />
        <div className="desktop-main">
          <Routes>
            <Route path="/" element={<LibraryView books={books} loadBooks={loadBooks} user={user} userData={userData} showToast={showToast} t={t} />} />
            <Route path="/timer" element={<TimerView books={books} user={user} userData={userData} loadBooks={loadBooks} showToast={showToast} t={t} />} />
            <Route path="/stats" element={<StatsView userData={userData} books={books} t={t} />} />
            <Route path="/quests" element={<QuestView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/shop" element={<ShopView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/social" element={<SocialView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/music" element={<MusicView />} />
            <Route path="/referral" element={<ReferralView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/settings" element={<ExtendedSettingsView user={user} userData={userData} showToast={showToast} />} />
            
            {/* PHASE 29 ROUTES */}
            <Route path="/achievements" element={<AchievementsView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/leaderboards" element={<LeaderboardsView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/challenges" element={<ReadingChallengesView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/messages" element={<DirectMessagingView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/book-clubs" element={<BookClubsView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/advanced-stats" element={<AdvancedStatisticsView user={user} userData={userData} books={books} showToast={showToast} />} />
            <Route path="/ai-recommendations" element={<AIRecommendationsView user={user} userData={userData} books={books} showToast={showToast} />} />
            <Route path="/journal" element={<ReadingJournalView user={user} books={books} showToast={showToast} />} />
            <Route path="/theme-creator" element={<ThemeCreatorView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/profile-custom" element={<ProfileCustomizationView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/music-plus" element={<MusicLibraryPlusView isReading={false} />} />
            
            {/* PHASE 30 ROUTES */}
            <Route path="/premium" element={<PremiumView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/integrations" element={<IntegrationsView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/live-sessions" element={<LiveSessionsView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/tournaments" element={<TournamentView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/stories" element={<StoryModeView user={user} userData={userData} showToast={showToast} />} />
            <Route path="/smart-search" element={<SmartSearchView books={books} showToast={showToast} />} />
            <Route path="/personality" element={<PersonalityAnalysisView userData={userData} books={books} />} />
          </Routes>
        </div>
      </div>
      <Toast msg={toastMsg} />
      <DebugPanel />
    </BrowserRouter>
  );
}

function Sidebar({ user, userData, t }) {
  const location = useLocation();
  
  return (
    <div className="desktop-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">📚</div>
        <div className="sidebar-title">Bookyo</div>
      </div>
      
      <div className="sidebar-user">
        <SimpleAvatar config={userData?.avatar} size={50} />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{userData?.displayName}</div>
          <div className="sidebar-user-level">{t.level} {userData?.level || 1}</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {/* PHASE 28 CORE */}
        <Link to="/" className={`sidebar-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Library size={20} /> {t.library}
        </Link>
        <Link to="/timer" className={`sidebar-nav-item ${location.pathname === '/timer' ? 'active' : ''}`}>
          <Timer size={20} /> {t.timer}
        </Link>
        <Link to="/stats" className={`sidebar-nav-item ${location.pathname === '/stats' ? 'active' : ''}`}>
          <BarChart2 size={20} /> {t.stats}
        </Link>
        <Link to="/quests" className={`sidebar-nav-item ${location.pathname === '/quests' ? 'active' : ''}`}>
          <Target size={20} /> {t.quests}
        </Link>
        <Link to="/shop" className={`sidebar-nav-item ${location.pathname === '/shop' ? 'active' : ''}`}>
          <ShoppingCart size={20} /> {t.shop}
        </Link>
        <Link to="/social" className={`sidebar-nav-item ${location.pathname === '/social' ? 'active' : ''}`}>
          <Users size={20} /> {t.social}
        </Link>
        <Link to="/music" className={`sidebar-nav-item ${location.pathname === '/music' ? 'active' : ''}`}>
          <Music size={20} /> {t.music}
        </Link>
        
        {/* PHASE 29 FEATURES */}
        <Link to="/achievements" className={`sidebar-nav-item ${location.pathname === '/achievements' ? 'active' : ''}`}>
          <Trophy size={20} /> Achievements
        </Link>
        <Link to="/leaderboards" className={`sidebar-nav-item ${location.pathname === '/leaderboards' ? 'active' : ''}`}>
          <BarChart2 size={20} /> Leaderboards
        </Link>
        <Link to="/challenges" className={`sidebar-nav-item ${location.pathname === '/challenges' ? 'active' : ''}`}>
          <Target size={20} /> Challenges
        </Link>
        <Link to="/messages" className={`sidebar-nav-item ${location.pathname === '/messages' ? 'active' : ''}`}>
          <Users size={20} /> Messages
        </Link>
        <Link to="/book-clubs" className={`sidebar-nav-item ${location.pathname === '/book-clubs' ? 'active' : ''}`}>
          <BookOpen size={20} /> Book Clubs
        </Link>
        <Link to="/advanced-stats" className={`sidebar-nav-item ${location.pathname === '/advanced-stats' ? 'active' : ''}`}>
          <BarChart2 size={20} /> Analytics
        </Link>
        <Link to="/ai-recommendations" className={`sidebar-nav-item ${location.pathname === '/ai-recommendations' ? 'active' : ''}`}>
          <Star size={20} /> AI Recs
        </Link>
        <Link to="/journal" className={`sidebar-nav-item ${location.pathname === '/journal' ? 'active' : ''}`}>
          <Edit2 size={20} /> Journal
        </Link>
        <Link to="/theme-creator" className={`sidebar-nav-item ${location.pathname === '/theme-creator' ? 'active' : ''}`}>
          <Star size={20} /> Themes
        </Link>
        <Link to="/profile-custom" className={`sidebar-nav-item ${location.pathname === '/profile-custom' ? 'active' : ''}`}>
          <User size={20} /> Profile
        </Link>
        <Link to="/music-plus" className={`sidebar-nav-item ${location.pathname === '/music-plus' ? 'active' : ''}`}>
          <Music size={20} /> Music+
        </Link>
        
        {/* PHASE 30 NEW */}
        <Link to="/premium" className={`sidebar-nav-item ${location.pathname === '/premium' ? 'active' : ''}`}>
          <Crown size={20} /> Premium
        </Link>
        <Link to="/integrations" className={`sidebar-nav-item ${location.pathname === '/integrations' ? 'active' : ''}`}>
          <Zap size={20} /> Integrations
        </Link>
        <Link to="/live-sessions" className={`sidebar-nav-item ${location.pathname === '/live-sessions' ? 'active' : ''}`}>
          <Radio size={20} /> Live Sessions
        </Link>
        <Link to="/tournaments" className={`sidebar-nav-item ${location.pathname === '/tournaments' ? 'active' : ''}`}>
          <Trophy size={20} /> Tournaments
        </Link>
        <Link to="/stories" className={`sidebar-nav-item ${location.pathname === '/stories' ? 'active' : ''}`}>
          <Camera size={20} /> Stories
        </Link>
        <Link to="/smart-search" className={`sidebar-nav-item ${location.pathname === '/smart-search' ? 'active' : ''}`}>
          <Search size={20} /> Smart Search
        </Link>
        <Link to="/personality" className={`sidebar-nav-item ${location.pathname === '/personality' ? 'active' : ''}`}>
          <Brain size={20} /> Personality
        </Link>
        
        {/* BOTTOM */}
        <Link to="/referral" className={`sidebar-nav-item ${location.pathname === '/referral' ? 'active' : ''}`}>
          <Gift size={20} /> {t.referral}
        </Link>
        <Link to="/settings" className={`sidebar-nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={20} /> {t.settings}
        </Link>
      </nav>
      
      <div className="sidebar-stats">
        <div className="stat-row">
          <span>💰 {t.coins}</span>
          <strong>{userData?.coins || 0}</strong>
        </div>
        <div className="stat-row">
          <span>⭐ XP</span>
          <strong>{userData?.xp || 0}</strong>
        </div>
        <div className="stat-row">
          <span>🔥 {t.streak}</span>
          <strong>{userData?.streak || 0} {t.days}</strong>
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <MusicPlayerCompact isReading={false} />
      </div>
    </div>
  );
}

function LibraryView({ books, loadBooks, user, userData, showToast, t }) {
  const [filter, setFilter] = useState('all');
  const [showAddBook, setShowAddBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const filteredBooks = books.filter(book => filter === 'all' || book.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.myLibrary}</h1>
        <p className="page-subtitle">{books.length} {t.books}</p>
      </div>

      <div className="tab-container">
        {['all', 'reading', 'finished', 'wishlist'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`tab-button ${filter === f ? 'active' : ''}`}>
            {t[f]}
          </button>
        ))}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="cozy-card" style={{ padding: 60, textAlign: 'center' }}>
          <BookOpen size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '20px', marginBottom: 10 }}>{t.noBooksYet}</h3>
          <p style={{ opacity: 0.7, marginBottom: 20 }}>{t.clickToAdd}</p>
          <button onClick={() => setShowAddBook(true)} className="btn-main">
            <Plus size={18} /> {t.addBook}
          </button>
        </div>
      ) : (
        <div className="desktop-grid-5">
          {filteredBooks.map(book => (
            <div key={book.id} onClick={() => setSelectedBook(book)} className="book-card">
              {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="book-cover" />}
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</h3>
              <p style={{ fontSize: '13px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</p>
              {book.pages > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(book.currentPage / book.pages) * 100}%` }}></div>
                  </div>
                  <p style={{ fontSize: '12px', marginTop: 6, opacity: 0.6 }}>{book.currentPage}/{book.pages} {t.pages}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setShowAddBook(true)} className="fab">
        <Plus size={24} />
      </button>

      {showAddBook && <AddBookModal onClose={() => setShowAddBook(false)} user={user} loadBooks={loadBooks} showToast={showToast} t={t} />}
      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} user={user} userData={userData} loadBooks={loadBooks} showToast={showToast} t={t} />}
    </div>
  );
}

function TimerView({ books, user, userData, loadBooks, showToast, t }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerInterval = useRef(null);
  
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = async () => {
    if (!selectedBook) return;
    setTimerRunning(true);
    setTimerSeconds(0);
    await updateQuestProgress(user.uid, 'use_timer', 1);
    timerInterval.current = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
  };

  const stopTimer = async () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    setTimerRunning(false);
    
    const minutesRead = Math.floor(timerSeconds / 60);
    const pagesRead = Math.max(1, Math.floor(minutesRead / 2));
    
    if (selectedBook && minutesRead > 0) {
      try {
        const newCurrentPage = Math.min(selectedBook.currentPage + pagesRead, selectedBook.pages);
        await updateDoc(doc(db, "books", selectedBook.id), { currentPage: newCurrentPage });
        
        const xpGain = minutesRead * 10 + pagesRead * 5;
        const coinsGain = Math.floor(minutesRead / 5) + pagesRead;
        
        await setDoc(doc(db, "users", user.uid), {
          xp: increment(xpGain),
          coins: increment(coinsGain)
        }, { merge: true });

        await updateQuestProgress(user.uid, 'read_pages', pagesRead);
        await updateQuestProgress(user.uid, 'read_minutes', minutesRead);
        
        showToast(`📖 +${pagesRead} ${t.pages}, +${xpGain} XP, +${coinsGain} ${t.coins}!`);
        await loadBooks(user.uid);
      } catch (error) {
        console.error("Timer save error:", error);
        showToast("❌ Failed to save progress");
      }
    }
    setTimerSeconds(0);
  };

  const readingBooks = books.filter(b => b.status === 'reading');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.readingTimer}</h1>
        <p className="page-subtitle">Track your reading sessions</p>
      </div>

      <div className="desktop-grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="cozy-card" style={{ padding: 50, textAlign: 'center', background: 'var(--grad-main)', marginBottom: 30 }}>
            <div style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: 30, fontFamily: 'monospace' }}>
              {formatTime(timerSeconds)}
            </div>
            
            {timerRunning && selectedBook && (
              <div style={{ marginBottom: 30 }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedBook.title}</p>
                <p style={{ opacity: 0.9 }}>{selectedBook.author}</p>
              </div>
            )}

            {!timerRunning && (
              <select
                value={selectedBook?.id || ''}
                onChange={(e) => setSelectedBook(readingBooks.find(b => b.id === e.target.value))}
                className="input"
                style={{ marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}
              >
                <option value="">{t.selectBook}</option>
                {readingBooks.map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            )}

            <button 
              onClick={timerRunning ? stopTimer : startTimer} 
              className="btn-main" 
              style={{ fontSize: '18px', padding: '16px 40px', background: 'rgba(255,255,255,0.25)' }}
              disabled={!timerRunning && !selectedBook}
            >
              {timerRunning ? <><Square size={20} /> {t.stopReading}</> : <><Play size={20} /> {t.startReading}</>}
            </button>
          </div>
        </div>
        
        <MusicPlayer isReading={timerRunning} />
      </div>
    </div>
  );
}

function StatsView({ userData, books, t }) {
  const totalPages = books.reduce((sum, book) => sum + book.currentPage, 0);
  const finishedBooks = books.filter(b => b.status === 'finished').length;
  const readingBooks = books.filter(b => b.status === 'reading').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.statistics}</h1>
        <p className="page-subtitle">Your reading journey</p>
      </div>

      <div className="cozy-card" style={{ padding: 40, textAlign: 'center', background: 'var(--grad-main)', marginBottom: 30 }}>
        <div style={{ fontSize: '64px', marginBottom: 12 }}>⭐</div>
        <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: 8 }}>{t.level} {userData?.level || 1}</div>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>{userData?.xp || 0} XP</div>
        <div className="progress-bar" style={{ marginTop: 20, height: 10 }}>
          <div className="progress-fill shimmer" style={{ width: `${((userData?.xp || 0) % 100)}%` }}></div>
        </div>
      </div>

      <div className="desktop-grid-4">
        <div className="stat-card">
          <div className="stat-value">{totalPages}</div>
          <div className="stat-label">{t.pagesRead}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{finishedBooks}</div>
          <div className="stat-label">{t.booksFinished}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{readingBooks}</div>
          <div className="stat-label">{t.currentlyReading}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{userData?.coins || 0}</div>
          <div className="stat-label">💰 {t.coins}</div>
        </div>
      </div>
    </div>
  );
}

function MusicView() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎵 Music Player</h1>
        <p className="page-subtitle">Enhance your reading experience</p>
      </div>
      <MusicPlayer isReading={false} />
    </div>
  );
}

function AuthView({ showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("✅ Login successful!");
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        showToast("✅ Account created!");
      }
    } catch (error) {
      showToast("❌ " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--grad-main)', padding: 40 }}>
      <div className="cozy-card" style={{ maxWidth: 450, width: '100%', padding: 50 }}>
        <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>📚 Bookyo</h1>
        <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: 40, fontSize: '16px' }}>Your Reading Journey Starts Here</p>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" style={{ marginBottom: 16 }} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" style={{ marginBottom: 16 }} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" style={{ marginBottom: 24 }} required />
          <button type="submit" className="btn-main" style={{ width: '100%', marginBottom: 16 }} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : (isLogin ? 'Login' : 'Sign Up')}
          </button>
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn-ghost" style={{ width: '100%' }}>
            {isLogin ? 'Create Account' : 'Already have an account?'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddBookModal({ onClose, user, loadBooks, showToast, t }) {
  const [manualMode, setManualMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualPages, setManualPages] = useState('');

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`
      );
      const data = await response.json();
      setSearchResults(data.items || []);
      if (!data.items || data.items.length === 0) {
        showToast("📚 No books found. Try different search terms!");
      }
    } catch (error) {
      showToast("❌ Search failed");
    }
    setSearching(false);
  };

  const addBook = async (bookData) => {
    try {
      await addDoc(collection(db, "books"), {
        userId: user.uid,
        ...bookData,
        currentPage: 0,
        status: "reading",
        rating: 0,
        review: "",
        addedAt: new Date().toISOString()
      });
      await updateQuestProgress(user.uid, 'add_books', 1);
      await loadBooks(user.uid);
      showToast("✅ Book added!");
      onClose();
    } catch (error) {
      console.error("Add book error:", error);
      showToast("❌ Failed to add book");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{t.addBook}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}>
            <X />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button onClick={() => setManualMode(false)} className={`btn-ghost ${!manualMode ? 'active' : ''}`} style={{ flex: 1 }}>
            <Search size={18} /> {t.search}
          </button>
          <button onClick={() => setManualMode(true)} className={`btn-ghost ${manualMode ? 'active' : ''}`} style={{ flex: 1 }}>
            <Edit2 size={18} /> {t.manual}
          </button>
        </div>

        {!manualMode ? (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input 
                type="text" 
                placeholder={t.searchBooks} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && searchBooks()} 
                className="input" 
                style={{ flex: 1 }} 
              />
              <button onClick={searchBooks} className="btn-main" disabled={searching}>
                {searching ? <div className="spinner" style={{ width: 18, height: 18 }}></div> : <Search size={18} />}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
              {searchResults.map(item => (
                <div key={item.id} className="cozy-card" style={{ padding: 16, display: 'flex', gap: 16, cursor: 'pointer' }} onClick={() => addBook({
                  title: item.volumeInfo.title,
                  author: item.volumeInfo.authors?.[0] || 'Unknown',
                  pages: item.volumeInfo.pageCount || 0,
                  coverUrl: item.volumeInfo.imageLinks?.thumbnail || ''
                })}>
                  {item.volumeInfo.imageLinks?.thumbnail && <img src={item.volumeInfo.imageLinks.thumbnail} alt="" style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 6 }} />}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 4 }}>{item.volumeInfo.title}</h3>
                    <p style={{ fontSize: '14px', opacity: 0.7 }}>{item.volumeInfo.authors?.join(', ')}</p>
                    {item.volumeInfo.pageCount && <p style={{ fontSize: '13px', opacity: 0.6, marginTop: 4 }}>{item.volumeInfo.pageCount} {t.pages}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <input type="text" placeholder={t.bookTitle} value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className="input" style={{ marginBottom: 16 }} />
            <input type="text" placeholder={`${t.author} (${t.optional})`} value={manualAuthor} onChange={(e) => setManualAuthor(e.target.value)} className="input" style={{ marginBottom: 16 }} />
            <input type="number" placeholder={`${t.numberOfPages} (${t.optional})`} value={manualPages} onChange={(e) => setManualPages(e.target.value)} className="input" style={{ marginBottom: 24 }} />
            <button onClick={() => manualTitle && addBook({ title: manualTitle, author: manualAuthor || 'Unknown', pages: parseInt(manualPages) || 0, coverUrl: '' })} className="btn-main" style={{ width: '100%' }}>
              <Plus size={18} /> {t.addBook}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function BookDetailModal({ book, onClose, user, userData, loadBooks, showToast, t }) {
  const [currentPage, setCurrentPage] = useState(book.currentPage);
  const [rating, setRating] = useState(book.rating);
  const [review, setReview] = useState(book.review);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "books", book.id), { currentPage, rating, review });
      if (review && !book.review) await updateQuestProgress(user.uid, 'write_review', 1);
      await loadBooks(user.uid);
      showToast("✅ Book updated!");
      onClose();
    } catch (error) {
      showToast("❌ Failed to save");
    }
  };

  const handleFinish = async () => {
    try {
      await updateDoc(doc(db, "books", book.id), { 
        status: 'finished', 
        currentPage: book.pages,
        finishedAt: new Date().toISOString()
      });
      await updateQuestProgress(user.uid, 'finish_books', 1);
      await loadBooks(user.uid);
      showToast("🎉 Book finished!");
      onClose();
    } catch (error) {
      showToast("❌ Failed to finish book");
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this book?')) return;
    try {
      await deleteDoc(doc(db, "books", book.id));
      await loadBooks(user.uid);
      showToast("✅ Book deleted!");
      onClose();
    } catch (error) {
      showToast("❌ Failed to delete");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{book.title}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <QuickShareButton 
              shareType="bookFinished" 
              shareData={book} 
              user={user} 
              userData={userData} 
              showToast={showToast}
            >
              {t.share}
            </QuickShareButton>
            <button onClick={onClose} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}>
              <X />
            </button>
          </div>
        </div>

        {book.coverUrl && <img src={book.coverUrl} alt={book.title} style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 12, marginBottom: 24 }} />}

        <div className="cozy-card" style={{ padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: '16px', marginBottom: 12 }}><strong>{t.author}:</strong> {book.author}</p>
          <p style={{ fontSize: '16px', marginBottom: 20 }}><strong>{t.pages}:</strong> {book.pages}</p>

          <label style={{ display: 'block', fontSize: '14px', marginBottom: 8, opacity: 0.7 }}>{t.currentPage}</label>
          <input type="number" value={currentPage} onChange={(e) => setCurrentPage(Math.min(parseInt(e.target.value) || 0, book.pages))} className="input" style={{ marginBottom: 16 }} max={book.pages} />

          <label style={{ display: 'block', fontSize: '14px', marginBottom: 8, opacity: 0.7 }}>{t.rating}</label>
          <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', padding: 0 }}>
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: '14px', marginBottom: 8, opacity: 0.7 }}>{t.review}</label>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} className="input" placeholder="Write your thoughts..." />
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button onClick={handleSave} className="btn-main" style={{ flex: 1 }}>
            <Check size={18} /> {t.save}
          </button>
          {book.status !== 'finished' && (
            <button onClick={handleFinish} className="btn-main" style={{ flex: 1, background: 'var(--success)' }}>
              <Trophy size={18} /> {t.finish}
            </button>
          )}
        </div>

        <button onClick={handleDelete} className="btn-ghost" style={{ width: '100%', color: '#FF6B6B' }}>
          <Trash2 size={18} /> {t.delete}
        </button>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

export default App;