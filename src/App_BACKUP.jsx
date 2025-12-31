import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase'; 
import { 
  Library, Timer, BarChart2, Users, Sparkles, Plus, Search, X, Play, Square, 
  ChevronRight, ChevronLeft, Heart, MessageSquare, Send, Trophy, Edit2, Check, 
  ArrowLeft, Star, FileText, UserMinus, UserPlus, Repeat, Trash2, BookOpen, 
  AlertCircle, Settings, Download, LogOut, Target, Camera, Quote, Palmtree, 
  Award, Bookmark, Calendar, Share2, Palette, CloudRain, Flame, Upload, 
  Globe, ArrowUpDown, Sun, Bot, ShoppingBag, Shield, Music, User, Crown, 
  TrendingUp, Zap, Volume2, VolumeX, Coffee, Moon, Filter, SortAsc, Grid,
  List, MapPin, Clock, Image, Gift, Bell, Mail, UserCheck, Loader, Copy
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, 
  doc, updateDoc, getDocs, orderBy, arrayUnion, arrayRemove, writeBatch, setDoc, increment, getDoc
} from 'firebase/firestore';
import { AvatarBuilder, SimpleAvatar } from './AvatarBuilder';

// === CONFIGURATION ===

const LANGUAGES = {
  de: { label: "Deutsch", dir: "ltr" },
  en: { label: "English", dir: "ltr" },
  fr: { label: "Français", dir: "ltr" },
  it: { label: "Italiano", dir: "ltr" },
  tr: { label: "Türkçe", dir: "ltr" },
  jp: { label: "日本語", dir: "ltr" },
  ar: { label: "العربية", dir: "rtl" }
};

const DICTIONARY = {
  de: { library: "Bibliothek", stats: "Statistik", social: "Community", settings: "Einstellung", timer: "Timer", reading: "Lese ich", planned: "Geplant", finished: "Beendet", dropped: "Abgebrochen", pages: "Seiten", min: "Min", add: "Hinzufügen", save: "Speichern", daily: "Tagesziel", search: "Suchen...", empty: "Keine Bücher gefunden.", post: "Posten", spoiler: "Spoiler!", mood: "Laune", calendar: "Lesekalender", notes: "Notizen", quotes: "Zitate", lend: "Verleih", import: "Importieren", export: "Backup", theme: "Design", profile: "Profil", logout: "Abmelden", collections: "Sammlungen", certificate: "Urkunde", persona: "KI-Persönlichkeit", shop: "Shop", coins: "Coins", buy: "Kaufen", equipped: "Aktiv", equip: "Nutzen", gotoLib: "Zur Bibliothek", leaderboard: "Rangliste", streak: "Streak", level: "Level", xp: "XP", startReading: "Lesen starten", stopReading: "Pause", resume: "Weiter", finish: "Beenden", achievements: "Erfolge", challenges: "Challenges", friends: "Freunde", filter: "Filter", sort: "Sortieren", genre: "Genre", rating: "Bewertung", dateAdded: "Hinzugefügt", title: "Titel", author: "Autor", bio: "Bio", favorites: "Favoriten", readingGoal: "Leseziel", accept: "Akzeptieren", decline: "Ablehnen", sendRequest: "Anfrage senden", pending: "Ausstehend", myProfile: "Mein Profil", editProfile: "Profil bearbeiten", viewProfile: "Profil ansehen" },
  en: { library: "Library", stats: "Stats", social: "Social", settings: "Settings", timer: "Timer", reading: "Reading", planned: "Planned", finished: "Finished", dropped: "Dropped", pages: "Pages", min: "m", add: "Add", save: "Save", daily: "Daily Goal", search: "Search...", empty: "No books yet.", post: "Post", spoiler: "Spoiler!", mood: "Mood", calendar: "Calendar", notes: "Notes", quotes: "Quotes", lend: "Lending", import: "Import", export: "Backup", theme: "Theme", profile: "Profile", logout: "Logout", collections: "Collections", certificate: "Certificate", persona: "AI Persona", shop: "Shop", coins: "Coins", buy: "Buy", equipped: "Active", equip: "Equip", gotoLib: "Go to Library", leaderboard: "Leaderboard", streak: "Streak", level: "Level", xp: "XP", startReading: "Start Reading", stopReading: "Pause", resume: "Resume", finish: "Finish", achievements: "Achievements", challenges: "Challenges", friends: "Friends", filter: "Filter", sort: "Sort", genre: "Genre", rating: "Rating", dateAdded: "Date Added", title: "Title", author: "Author", bio: "Bio", favorites: "Favorites", readingGoal: "Reading Goal", accept: "Accept", decline: "Decline", sendRequest: "Send Request", pending: "Pending", myProfile: "My Profile", editProfile: "Edit Profile", viewProfile: "View Profile" },
};

const THEMES = {
  mystic: { primary: '#9D4EDD', secondary: '#F72585', bg: '#1A1A2E', card: '#25253D', grad: 'linear-gradient(135deg, #9D4EDD 0%, #F72585 100%)' },
  ocean:  { primary: '#3B82F6', secondary: '#10B981', bg: '#0F172A', card: '#1E293B', grad: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)' },
  forest: { primary: '#10B981', secondary: '#F59E0B', bg: '#052e16', card: '#064e3b', grad: 'linear-gradient(135deg, #10B981 0%, #F59E0B 100%)' },
  sunset: { primary: '#F97316', secondary: '#EF4444', bg: '#2a1205', card: '#431407', grad: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)' },
  midnight: { primary: '#8B5CF6', secondary: '#EC4899', bg: '#0C0A1D', card: '#1a1625', grad: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' },
  candy: { primary: '#F472B6', secondary: '#FBBF24', bg: '#1F1729', card: '#2D1F3D', grad: 'linear-gradient(135deg, #F472B6 0%, #FBBF24 100%)' }
};

const ACHIEVEMENTS = [
  { id: 'first_book', name: 'First Steps', desc: 'Add your first book', icon: '📚', xpReward: 50, requirement: 1, type: 'books_added' },
  { id: 'bookworm', name: 'Bookworm', desc: 'Add 10 books', icon: '🐛', xpReward: 200, requirement: 10, type: 'books_added' },
  { id: 'collector', name: 'Collector', desc: 'Add 50 books', icon: '📖', xpReward: 500, requirement: 50, type: 'books_added' },
  { id: 'library', name: 'Librarian', desc: 'Add 100 books', icon: '📚', xpReward: 1000, requirement: 100, type: 'books_added' },
  { id: 'first_finish', name: 'Finisher', desc: 'Finish your first book', icon: '🎯', xpReward: 100, requirement: 1, type: 'books_finished' },
  { id: 'speedreader', name: 'Speed Reader', desc: 'Finish 5 books', icon: '⚡', xpReward: 300, requirement: 5, type: 'books_finished' },
  { id: 'marathon', name: 'Marathon Reader', desc: 'Finish 20 books', icon: '🏃', xpReward: 800, requirement: 20, type: 'books_finished' },
  { id: 'session_1h', name: 'Focus Master', desc: 'Read for 1 hour straight', icon: '⏰', xpReward: 150, requirement: 3600, type: 'longest_session' },
  { id: 'session_3h', name: 'Reading Beast', desc: 'Read for 3 hours straight', icon: '🦁', xpReward: 400, requirement: 10800, type: 'longest_session' },
  { id: 'streak_7', name: 'Week Warrior', desc: '7 day streak', icon: '🔥', xpReward: 250, requirement: 7, type: 'streak' },
  { id: 'streak_30', name: 'Month Master', desc: '30 day streak', icon: '💪', xpReward: 1000, requirement: 30, type: 'streak' },
  { id: 'page_turner', name: 'Page Turner', desc: 'Read 100 pages', icon: '📄', xpReward: 200, requirement: 100, type: 'total_pages' },
  { id: 'bookaholic', name: 'Bookaholic', desc: 'Read 1000 pages', icon: '📚', xpReward: 800, requirement: 1000, type: 'total_pages' },
  { id: 'social_butterfly', name: 'Social Butterfly', desc: 'Add 5 friends', icon: '🦋', xpReward: 150, requirement: 5, type: 'friends' },
  { id: 'influencer', name: 'Influencer', desc: 'Get 50 likes on posts', icon: '💖', xpReward: 300, requirement: 50, type: 'total_likes' },
];

const SHOP_ITEMS = [
  { id: 'frame_gold', name: 'Golden Glow', type: 'frame', price: 100, style: { border: '3px solid #FFD700', boxShadow: '0 0 15px #FFD700' } },
  { id: 'frame_neon', name: 'Cyberpunk', type: 'frame', price: 200, style: { border: '3px solid #F72585', boxShadow: '0 0 10px #F72585, 0 0 20px #9D4EDD' } },
  { id: 'frame_nature', name: 'Druid', type: 'frame', price: 150, style: { border: '3px solid #10B981', boxShadow: '0 0 10px #10B981' } },
  { id: 'frame_royal', name: 'Royal Crown', type: 'frame', price: 300, style: { border: '3px solid #FFD700', boxShadow: '0 0 20px #FFD700, 0 0 40px #F59E0B' } },
  { id: 'frame_rainbow', name: 'Rainbow', type: 'frame', price: 350, style: { border: '3px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)' } },
  { id: 'frame_diamond', name: 'Diamond', type: 'frame', price: 500, style: { border: '3px solid #B9F2FF', boxShadow: '0 0 25px #B9F2FF, 0 0 50px #4DD0E1' } },
  { id: 'item_freeze', name: 'Streak Freeze', type: 'consumable', price: 500, icon: <Shield color="#3B82F6" />, desc: 'Protect your streak for 1 day' },
  { id: 'item_2x', name: '2x XP Boost', type: 'consumable', price: 300, icon: <Zap color="#F59E0B" />, desc: 'Double XP for 24 hours' },
  { id: 'item_coin', name: 'Coin Pack (500)', type: 'consumable', price: 0, icon: <Gift color="#FFD700" />, special: true, desc: 'Get 500 bonus coins' },
  { id: 'badge_pro', name: 'Pro Reader 💎', type: 'badge', price: 1000, icon: '💎', desc: 'Show off your dedication' },
  { id: 'badge_legend', name: 'Legend 👑', type: 'badge', price: 2000, icon: '👑', desc: 'Ultimate reading status' },
  { id: 'badge_speed', name: 'Speedster ⚡', type: 'badge', price: 800, icon: '⚡', desc: 'For the fast readers' },
  { id: 'banner_1', name: 'Starry Night', type: 'banner', price: 400, url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800' },
  { id: 'banner_2', name: 'Books & Coffee', type: 'banner', price: 400, url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800' },
  { id: 'banner_3', name: 'Library', type: 'banner', price: 400, url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800' },
];

const CHALLENGES = [
  { id: 'weekly_100', name: '100 Pages Challenge', desc: 'Read 100 pages this week', type: 'weekly', goal: 100, reward: 200, metric: 'pages' },
  { id: 'weekly_3books', name: 'Triple Crown', desc: 'Finish 3 books this week', type: 'weekly', goal: 3, reward: 300, metric: 'books' },
  { id: 'monthly_500', name: 'Page Master', desc: 'Read 500 pages this month', type: 'monthly', goal: 500, reward: 500, metric: 'pages' },
  { id: 'monthly_10books', name: 'Bookworm', desc: 'Finish 10 books this month', type: 'monthly', goal: 10, reward: 1000, metric: 'books' },
];

const AVATARS = ["Felix", "Aneka", "Jack", "Molly", "Bear", "Owl", "Cat", "Sky", "Ginger"];
const PERSONAS = { 
  owl: { name: "Bookyo (Owl)", prompt: "Du bist Bookyo, eine niedliche, belesene Eule. Benutze Eulen-Emojis 🦉." }, 
  wizard: { name: "Merlin (Wizard)", prompt: "Du bist Merlin, ein alter, weiser Zauberer. Sprich mystisch und benutze Magie-Emojis ✨🧙‍♂️." }, 
  robot: { name: "Unit 734 (Robot)", prompt: "Du bist Unit 734. Antworte extrem kurz, effizient und logisch. 🤖" }, 
  cat: { name: "Whiskers (Cat)", prompt: "Du bist Whiskers, eine schlaue Katze. Sei verspielt und benutze Katzen-Emojis 🐱." } 
};
const SOUNDS = { rain: "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3", fire: "https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3" };
const MOODS = ['😍', '🤯', '😭', '😴', '😡', '🤔', '😂'];
const DEFAULT_QUOTES = ["Ein Raum ohne Bücher ist wie ein Körper ohne Seele.", "Lesen ist ein grenzenloses Abenteuer.", "Bücher sind fliegende Teppiche.", "Lesen stärkt die Seele.", "Ein Buch ist ein Traum, den du in deinen Händen hältst."];

// === HELPER FUNCTIONS ===
const triggerConfetti = () => { if (window.confetti) window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ['#9D4EDD', '#F72585', '#FFD700'], ticks: 300 }); };
const getHighResCover = (url) => url ? url.replace('&edge=curl', '').replace('zoom=1', 'zoom=0') : null;
const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;
const xpForNextLevel = (level) => Math.pow(level, 2) * 100;

// === REUSABLE COMPONENTS ===
function Toast({ msg, onClose }) {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '2px solid var(--primary)', padding: '14px 28px', borderRadius: 30, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', gap: 10, animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      <div style={{ background: 'var(--grad-main)', borderRadius: '50%', padding: 6, display: 'flex' }}>
        <Check size={16} color="white" />
      </div>
      <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{msg}</span>
    </div>
  );
}

function DailyCheckIn({ onClose, onClaim }) {
  const quote = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.3s'}}>
      <div className="cozy-card" style={{maxWidth: 380, width: '100%', textAlign: 'center', padding: 40, border: '2px solid var(--primary)', animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative', overflow: 'visible'}}>
        <div style={{position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', background: 'var(--grad-main)', borderRadius: '50%', padding: 20, boxShadow: '0 10px 30px rgba(157, 78, 221, 0.5)'}}>
          <Sun size={50} color="white" />
        </div>
        <h2 style={{fontSize: '28px', marginTop: 30, marginBottom: 10, background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Welcome Back!</h2>
        <p style={{fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: 25, fontSize: '14px', lineHeight: 1.6}}>"{quote}"</p>
        <div style={{background: 'var(--bg-light)', padding: 20, borderRadius: 16, marginBottom: 25, border: '1px solid rgba(255,255,255,0.1)'}}>
            <div style={{fontSize: '36px', fontWeight: 'bold', background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 5}}>+10</div>
            <div style={{fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.5px'}}>BOOK COINS</div>
        </div>
        <button onClick={() => { onClaim(); onClose(); }} className="btn-main" style={{justifyContent: 'center', fontSize: '16px', padding: '16px'}}>
          <Sparkles size={20} /> Claim & Read
        </button>
      </div>
    </div>
  );
}

function CertificateModal({ book, onClose, lang }) {
  const t = DICTIONARY[lang] || DICTIONARY.en;
  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.3s'}} onClick={onClose}>
      <div className="cozy-card" style={{maxWidth: 450, width: '100%', padding: 50, border: '4px double var(--accent)', textAlign: 'center', background: 'var(--bg-dark)', animation: 'pulse 2s ease-in-out infinite'}} onClick={e => e.stopPropagation()}>
        <div style={{background: 'var(--grad-main)', borderRadius: '50%', width: 100, height: 100, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(157, 78, 221, 0.5)'}}>
          <Award size={60} color="white" />
        </div>
        <h2 style={{fontFamily: 'serif', fontSize: '36px', color: 'var(--accent)', marginBottom: 5, letterSpacing: '1px'}}>{t.certificate}</h2>
        <p style={{color: 'var(--text-muted)', marginBottom: 30, letterSpacing: '2px', fontSize: '11px'}}>OF COMPLETION</p>
        <div style={{fontSize: '22px', fontWeight: 'bold', marginBottom: 8, lineHeight: 1.3}}>{book.title}</div>
        <div style={{fontSize: '15px', color: 'var(--text-muted)', marginBottom: 30}}>by {book.author}</div>
        <div style={{display:'flex', justifyContent:'center', gap: 8, marginBottom: 30}}>{[1,2,3,4,5].map(s => <Star key={s} size={28} fill={s<=(book.rating||0)?"#FFD700":"none"} color="#FFD700" style={{filter: s<=(book.rating||0) ? 'drop-shadow(0 0 5px #FFD700)' : 'none'}}/>)}</div>
        <div style={{fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic'}}>Finished on {new Date().toLocaleDateString()}</div>
        <button onClick={onClose} className="btn-main" style={{marginTop: 30}}>Close</button>
      </div>
    </div>
  );
}

function AvatarWithFrame({ seed, frameId, size = 60 }) {
  const frameStyle = SHOP_ITEMS.find(i => i.id === frameId)?.style || {};
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', position: 'relative', transition: 'transform 0.2s', ...frameStyle }}>
      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="avatar" />
    </div>
  );
}

function LevelBadge({ xp, size = 'small' }) {
  const level = calculateLevel(xp || 0);
  const nextLevelXP = xpForNextLevel(level);
  const progress = ((xp || 0) % nextLevelXP) / nextLevelXP * 100;
  
  if (size === 'large') {
    return (
      <div style={{textAlign: 'center'}}>
        <div style={{position: 'relative', width: 120, height: 120, margin: '0 auto 15px'}}>
          <svg width="120" height="120" style={{transform: 'rotate(-90deg)', position: 'absolute'}}>
            <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r="54" stroke="url(#grad)" strokeWidth="8" fill="none" strokeDasharray={`${progress * 3.39} 339`} strokeLinecap="round" />
            <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--primary)" /><stop offset="100%" stopColor="var(--secondary)" /></linearGradient></defs>
          </svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Crown size={24} color="var(--accent)" />
            <div style={{fontSize: '28px', fontWeight: 'bold', marginTop: 5}}>{level}</div>
          </div>
        </div>
        <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>{xp || 0} / {nextLevelXP} XP</div>
      </div>
    );
  }
  
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-light)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)'}}>
      <Crown size={16} color="var(--accent)" />
      <span style={{fontSize: '14px', fontWeight: 'bold'}}>{level}</span>
    </div>
  );
}

function SkeletonLoader({ type = 'card' }) {
  if (type === 'card') {
    return <div className="cozy-card shimmer" style={{ height: 200, animation: 'shimmer 2s infinite' }}></div>;
  }
  if (type === 'text') {
    return <div style={{ background: 'var(--bg-light)', height: 20, borderRadius: 10, marginBottom: 10, animation: 'shimmer 2s infinite' }}></div>;
  }
  if (type === 'avatar') {
    return <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-light)', animation: 'shimmer 2s infinite' }}></div>;
  }
  return null;
}

function AchievementUnlockModal({ achievement, onClose }) {
  useEffect(() => {
    triggerConfetti();
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.3s' }}>
      <div className="cozy-card" style={{ maxWidth: 350, width: '100%', textAlign: 'center', padding: 40, border: '2px solid var(--accent)', animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
        <div style={{ fontSize: '80px', marginBottom: 15, animation: 'float 2s ease-in-out infinite' }}>{achievement.icon}</div>
        <h2 style={{ fontSize: '24px', marginBottom: 10, color: 'var(--accent)' }}>Achievement Unlocked!</h2>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 8 }}>{achievement.name}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '14px' }}>{achievement.desc}</p>
        <div style={{ background: 'var(--grad-main)', padding: 15, borderRadius: 12 }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>+{achievement.xpReward} XP</div>
        </div>
      </div>
    </div>
  );
}

// === VIEWS ===

// 1. LOGIN
function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, background: 'var(--bg-dark)' }}>
      <div style={{marginBottom: 40, textAlign: 'center', animation: 'fadeIn 0.6s'}}>
        <div style={{background: 'var(--grad-main)', borderRadius: '50%', width: 80, height: 80, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(157, 78, 221, 0.5)', animation: 'pulse 2s ease-in-out infinite'}}>
          <BookOpen size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: 8, background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bookyo</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Your magical reading companion</p>
      </div>
      
      <form onSubmit={handleAuth} style={{ width: '100%', maxWidth: 350, animation: 'slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <input className="cozy-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="cozy-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn-main" disabled={loading} style={{marginBottom: 15}}>
          {loading ? <><Loader className="spinner" size={18} /> Loading...</> : (isLogin ? 'Login' : 'Sign Up')}
        </button>
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="btn-ghost" style={{width: '100%'}}>
          {isLogin ? 'Create Account' : 'Back to Login'}
        </button>
      </form>
    </div>
  );
}

// 2. LIBRARY VIEW (ENHANCED)
function LibraryView({ user, apiKey, showToast, lang }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const t = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "books"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(bookList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  let filteredBooks = books.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'reading') return b.readingStatus === 'reading';
    if (filter === 'finished') return b.readingStatus === 'finished';
    if (filter === 'planned') return b.readingStatus === 'want_to_read';
    return true;
  });

  if (searchQuery) {
    filteredBooks = filteredBooks.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  filteredBooks.sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'author') return a.author.localeCompare(b.author);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'dateAdded') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    return 0;
  });

  const stats = {
    total: books.length,
    reading: books.filter(b => b.readingStatus === 'reading').length,
    finished: books.filter(b => b.readingStatus === 'finished').length,
    pages: books.reduce((acc, b) => acc + (b.currentPage || 0), 0)
  };

  return (
    <div className="fade-in" style={{ padding: '20px 20px 100px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 5 }}>{t.library}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{stats.total} books · {stats.reading} reading</p>
        </div>
        <div style={{display: 'flex', gap: 10}}>
          <button onClick={() => navigate('/shop')} className="btn-ghost" style={{width: 50, height: 50, borderRadius: '50%', padding: 0}}>
            <ShoppingBag size={20} />
          </button>
          <button onClick={() => navigate('/settings')} className="btn-ghost" style={{width: 50, height: 50, borderRadius: '50%', padding: 0}}>
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="cozy-card" style={{padding: 20, marginBottom: 20, background: 'var(--grad-main)'}}>
        <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
          <div><div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.reading}</div><div style={{fontSize: '11px', opacity: 0.9, marginTop: 3}}>{t.reading}</div></div>
          <div><div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.finished}</div><div style={{fontSize: '11px', opacity: 0.9, marginTop: 3}}>{t.finished}</div></div>
          <div><div style={{fontSize: '24px', fontWeight: 'bold'}}>{stats.pages}</div><div style={{fontSize: '11px', opacity: 0.9, marginTop: 3}}>Pages</div></div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input 
          className="cozy-input" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          placeholder={t.search} 
          style={{ margin: 0 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 15, overflowX: 'auto', paddingBottom: 5 }}>
        {['all', 'reading', 'finished', 'planned'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`btn-ghost ${filter === f ? 'active' : ''}`} style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '10px 16px' }}>
            {f === 'all' ? 'All' : t[f]}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <select className="cozy-input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ margin: 0, flex: 1, padding: '10px' }}>
          <option value="dateAdded">{t.dateAdded}</option>
          <option value="title">{t.title}</option>
          <option value="author">{t.author}</option>
          <option value="rating">{t.rating}</option>
        </select>
        <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="btn-ghost" style={{ width: 50, height: 50, padding: 0 }}>
          {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 15 }}>
          {[1,2,3,4,5,6].map(i => <SkeletonLoader key={i} />)}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 15 }}>
              {filteredBooks.map(book => (
                <div key={book.id} onClick={() => setSelectedBook(book)} className="cozy-card" style={{ padding: 0, cursor: 'pointer', overflow: 'hidden', transition: 'all 0.3s', position: 'relative' }}>
                  <div style={{position: 'relative', paddingTop: '150%', background: 'var(--bg-light)'}}>
                    <img src={getHighResCover(book.cover) || "https://via.placeholder.com/150"} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={book.title} />
                    {book.readingStatus === 'reading' && (
                      <div className="badge badge-reading" style={{position: 'absolute', top: 8, right: 8}}>{t.reading}</div>
                    )}
                    {book.readingStatus === 'finished' && (
                      <div style={{position: 'absolute', top: 8, right: 8, background: 'rgba(255,215,0,0.9)', padding: '4px 8px', borderRadius: 6}}>
                        <Check size={12} color="black" />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</div>
                    {book.totalPages && (
                      <div className="progress-track" style={{marginTop: 8}}>
                        <div className="progress-fill" style={{width: `${((book.currentPage || 0) / book.totalPages) * 100}%`}}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredBooks.map(book => (
                <div key={book.id} onClick={() => setSelectedBook(book)} className="cozy-card" style={{ padding: 15, cursor: 'pointer', display: 'flex', gap: 15 }}>
                  <img src={getHighResCover(book.cover) || "https://via.placeholder.com/80"} style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 8 }} alt={book.title} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: 5 }}>{book.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 8 }}>{book.author}</div>
                    {book.totalPages && (
                      <>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 5 }}>
                          {book.currentPage || 0} / {book.totalPages} pages
                        </div>
                        <div className="progress-track" style={{ height: 6 }}>
                          <div className="progress-fill" style={{ width: `${((book.currentPage || 0) / book.totalPages) * 100}%` }}></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {filteredBooks.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: 15 }} />
          <p>{t.empty}</p>
        </div>
      )}

      <button onClick={() => setShowAddModal(true)} className="btn-main" style={{ position: 'fixed', bottom: 90, right: 20, width: 60, height: 60, borderRadius: '50%', padding: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <Plus size={28} />
      </button>

      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} user={user} apiKey={apiKey} showToast={showToast} lang={lang} />}
      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} user={user} showToast={showToast} lang={lang} />}
    </div>
  );
}

// 3. ADD BOOK MODAL
function AddBookModal({ onClose, user, apiKey, showToast, lang }) {
  const [mode, setMode] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualBook, setManualBook] = useState({ title: '', author: '', totalPages: '', cover: '' });
  const [imageFile, setImageFile] = useState(null);
  const t = DICTIONARY[lang] || DICTIONARY.en;

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`);
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const addBook = async (book) => {
    try {
      await addDoc(collection(db, "books"), {
        ownerId: user.uid,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.[0] || 'Unknown',
        cover: getHighResCover(book.volumeInfo.imageLinks?.thumbnail),
        totalPages: book.volumeInfo.pageCount || 0,
        currentPage: 0,
        readingStatus: 'want_to_read',
        createdAt: serverTimestamp()
      });
      showToast("Book added!");
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const addManualBook = async () => {
    if (!manualBook.title || !manualBook.author) return;
    try {
      await addDoc(collection(db, "books"), {
        ownerId: user.uid,
        ...manualBook,
        totalPages: parseInt(manualBook.totalPages) || 0,
        currentPage: 0,
        readingStatus: 'want_to_read',
        createdAt: serverTimestamp()
      });
      showToast("Book added!");
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const scanCover = async () => {
    if (!imageFile) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Extract book title, author, and page count from this cover. Return ONLY valid JSON: {\"title\": \"...\", \"author\": \"...\", \"pages\": 123}" },
                { inline_data: { mime_type: imageFile.type, data: base64 } }
              ]
            }]
          })
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleanText = text.replace(/```json|```/g, '').trim();
        const bookData = JSON.parse(cleanText);
        setManualBook({ title: bookData.title || '', author: bookData.author || '', totalPages: bookData.pages || '', cover: '' });
        showToast("Scanned!");
      };
      reader.readAsDataURL(imageFile);
    } catch (err) {
      console.error(err);
      showToast("Scan failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', zIndex: 500, overflowY: 'auto', padding: 20, animation: 'fadeIn 0.3s' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <h2 style={{ fontSize: '24px' }}>{t.add}</h2>
          <button onClick={onClose} className="btn-ghost" style={{width: 40, height: 40, borderRadius: '50%', padding: 0}}><X /></button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 25 }}>
          {['search', 'manual', 'scan'].map(m => (
            <button key={m} onClick={() => setMode(m)} className={`btn-ghost ${mode === m ? 'active' : ''}`} style={{ flex: 1, fontSize: '13px' }}>
              {m === 'search' && <><Search size={16} /> Search</>}
              {m === 'manual' && <><Edit2 size={16} /> Manual</>}
              {m === 'scan' && <><Camera size={16} /> Scan</>}
            </button>
          ))}
        </div>

        {mode === 'search' && (
          <>
            <form onSubmit={searchBooks} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input className="cozy-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.search} style={{ margin: 0 }} />
              <button type="submit" className="btn-main" style={{ width: 60, padding: 0 }} disabled={loading}>
                {loading ? <Loader className="spinner" size={18} /> : <Search />}
              </button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map(book => (
                <div key={book.id} className="cozy-card" style={{ display: 'flex', gap: 15, padding: 15, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => addBook(book)}>
                  <img src={getHighResCover(book.volumeInfo.imageLinks?.thumbnail) || "https://via.placeholder.com/80"} style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 8 }} alt="" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 5, fontSize: '15px' }}>{book.volumeInfo.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 5 }}>{book.volumeInfo.authors?.[0]}</div>
                    {book.volumeInfo.pageCount && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{book.volumeInfo.pageCount} pages</div>}
                  </div>
                  <Plus color="var(--primary)" />
                </div>
              ))}
            </div>
          </>
        )}

        {mode === 'manual' && (
          <div>
            <input className="cozy-input" placeholder="Title" value={manualBook.title} onChange={e => setManualBook({ ...manualBook, title: e.target.value })} />
            <input className="cozy-input" placeholder="Author" value={manualBook.author} onChange={e => setManualBook({ ...manualBook, author: e.target.value })} />
            <input className="cozy-input" type="number" placeholder="Pages" value={manualBook.totalPages} onChange={e => setManualBook({ ...manualBook, totalPages: e.target.value })} />
            <input className="cozy-input" placeholder="Cover URL (optional)" value={manualBook.cover} onChange={e => setManualBook({ ...manualBook, cover: e.target.value })} />
            <button onClick={addManualBook} className="btn-main">{t.add}</button>
          </div>
        )}

        {mode === 'scan' && (
          <div style={{ textAlign: 'center' }}>
            <div className="cozy-card" style={{ padding: 40, marginBottom: 20 }}>
              <Camera size={48} color="var(--primary)" style={{ marginBottom: 15 }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Upload a book cover to scan</p>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ marginBottom: 15 }} />
              {imageFile && <button onClick={scanCover} className="btn-main" disabled={loading}>{loading ? 'Scanning...' : 'Scan'}</button>}
            </div>
            {(manualBook.title || manualBook.author) && (
              <div>
                <h3 style={{ marginBottom: 15 }}>Scanned Data:</h3>
                <input className="cozy-input" placeholder="Title" value={manualBook.title} onChange={e => setManualBook({ ...manualBook, title: e.target.value })} />
                <input className="cozy-input" placeholder="Author" value={manualBook.author} onChange={e => setManualBook({ ...manualBook, author: e.target.value })} />
                <input className="cozy-input" type="number" placeholder="Pages" value={manualBook.totalPages} onChange={e => setManualBook({ ...manualBook, totalPages: e.target.value })} />
                <button onClick={addManualBook} className="btn-main">{t.add}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 4. BOOK DETAIL MODAL
function BookDetailModal({ book, onClose, user, showToast, lang }) {
  const [page, setPage] = useState(book.currentPage || 0);
  const [status, setStatus] = useState(book.readingStatus || 'want_to_read');
  const [rating, setRating] = useState(book.rating || 0);
  const [notes, setNotes] = useState(book.notes || '');
  const [quotes, setQuotes] = useState(book.quotes || []);
  const [newQuote, setNewQuote] = useState('');
  const [collectionName, setCollectionName] = useState(book.collection || '');
  const [lentTo, setLentTo] = useState(book.lentTo || '');
  const [cover, setCover] = useState(book.cover || '');
  const [showCert, setShowCert] = useState(false);
  const t = DICTIONARY[lang] || DICTIONARY.en;

  const save = async (updates) => {
    try {
      await updateDoc(doc(db, "books", book.id), updates);
    } catch (err) {
      console.error(err);
    }
  };

  const changeCover = async () => {
    const newUrl = prompt("Cover URL:");
    if (newUrl) {
      setCover(newUrl);
      save({ cover: newUrl });
    }
  };

  const addQuote = () => {
    if (!newQuote.trim()) return;
    const updated = [...quotes, newQuote];
    setQuotes(updated);
    save({ quotes: updated });
    setNewQuote('');
    showToast("Quote added!");
  };

  const deleteQuote = (idx) => {
    const updated = quotes.filter((_, i) => i !== idx);
    setQuotes(updated);
    save({ quotes: updated });
  };

  const deleteBook = async () => {
    if (confirm("Delete this book?")) {
      await deleteDoc(doc(db, "books", book.id));
      showToast("Deleted!");
      onClose();
    }
  };

  const shareBook = () => {
    navigator.clipboard.writeText(`Reading "${book.title}" by ${book.author}! Page ${page}/${book.totalPages}.`);
    showToast("Copied to clipboard!");
  };

  const timeLeft = Math.round(((book.totalPages - page) * 1.5) / 60);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-dark)', zIndex: 300, overflowY: 'auto', padding: 20, animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <button onClick={onClose} className="btn-ghost" style={{width: 40, height: 40, borderRadius: '50%', padding: 0}}><ArrowLeft /></button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowCert(true)} className="btn-ghost" style={{width: 40, height: 40, borderRadius: '50%', padding: 0}}>
              <Award color="var(--accent)" />
            </button>
            <button onClick={shareBook} className="btn-ghost" style={{width: 40, height: 40, borderRadius: '50%', padding: 0}}>
              <Share2 color="var(--primary)" />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
          <div onClick={changeCover} style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <img src={cover || "https://via.placeholder.com/150"} style={{ width: 120, height: 180, objectFit: 'cover', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} alt="" />
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', padding: 6, borderRadius: 8 }}>
              <Edit2 size={14} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', marginBottom: 8, lineHeight: 1.3 }}>{book.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: 10 }}>{book.author}</p>
            <div style={{ fontSize: '13px', marginTop: 8, color: 'var(--accent)', fontWeight: 'bold' }}>
              {timeLeft > 0 ? `~${timeLeft}h left` : 'Finished! 🎉'}
            </div>
            <select className="cozy-input" style={{ padding: 10, fontSize: '14px', marginTop: 15 }} value={status} onChange={(e) => { setStatus(e.target.value); save({ readingStatus: e.target.value }); }}>
              <option value="want_to_read">{t.planned}</option>
              <option value="reading">{t.reading}</option>
              <option value="finished">{t.finished}</option>
              <option value="dropped">{t.dropped}</option>
            </select>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={26} fill={s <= rating ? "#FFD700" : "none"} color={s <= rating ? "#FFD700" : "#666"} onClick={() => { setRating(s); save({ rating: s }); }} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="cozy-card" style={{ marginBottom: 15 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} /> Reading Progress
          </h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input className="cozy-input" type="number" value={page} onChange={e => setPage(e.target.value)} placeholder="Current page" style={{ margin: 0, flex: 1 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/ {book.totalPages}</span>
            <button onClick={() => { save({ currentPage: parseInt(page), readingStatus: parseInt(page) >= book.totalPages ? 'finished' : 'reading' }); showToast("Progress saved!"); }} className="btn-main" style={{ width: 'auto', padding: '12px 20px' }}>
              {t.save}
            </button>
          </div>
          {book.totalPages && (
            <div className="progress-track" style={{ marginTop: 15 }}>
              <div className="progress-fill" style={{ width: `${(page / book.totalPages) * 100}%` }}></div>
            </div>
          )}
        </div>

        <div className="cozy-card" style={{ marginBottom: 15 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12 }}>{t.collections}</h3>
          <input className="cozy-input" value={collectionName} onChange={e => setCollectionName(e.target.value)} onBlur={() => save({ collection: collectionName })} placeholder="e.g. Fantasy, Classics..." style={{ margin: 0 }} />
        </div>

        <div className="cozy-card" style={{ marginBottom: 15 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12 }}>{t.lend}</h3>
          <input className="cozy-input" value={lentTo} onChange={e => setLentTo(e.target.value)} onBlur={() => save({ lentTo: lentTo })} placeholder="Lent to..." style={{ margin: 0 }} />
        </div>

        <div className="cozy-card" style={{ marginBottom: 15 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} /> {t.notes}
          </h3>
          <textarea className="cozy-input" value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => save({ notes })} placeholder="Your thoughts..." style={{ minHeight: 100, fontFamily: 'inherit', margin: 0 }} />
        </div>

        <div className="cozy-card" style={{ marginBottom: 15 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Quote size={18} /> {t.quotes}
          </h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
            <input className="cozy-input" value={newQuote} onChange={e => setNewQuote(e.target.value)} placeholder="Add a quote..." style={{ marginBottom: 0 }} />
            <button onClick={addQuote} className="btn-main" style={{ width: 'auto', padding: '12px' }}>
              <Plus size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quotes.map((q, i) => (
              <div key={i} style={{ background: 'var(--bg-light)', padding: 15, borderRadius: 12, fontSize: '14px', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between', alignItems: 'start', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ flex: 1, lineHeight: 1.5 }}>"{q}"</span>
                <Trash2 size={16} color="#EF4444" onClick={() => deleteQuote(i)} style={{ cursor: 'pointer', marginLeft: 10, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={deleteBook} className="btn-ghost" style={{ width: '100%', padding: 20, color: '#EF4444', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Trash2 size={18} /> Delete Book
        </button>

        <div style={{ height: 100 }}></div>
      </div>
      {showCert && <CertificateModal book={{ ...book, rating }} onClose={() => setShowCert(false)} lang={lang} />}
    </div>
  );
}

// 5. TIMER VIEW (FIXED - NO FREEZE!)
function TimerView({ user, showToast, lang }) {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pagesRead, setPagesRead] = useState('');
  const [soundRain, setSoundRain] = useState(false);
  const [soundFire, setSoundFire] = useState(false);
  const audioRain = useRef(null);
  const audioFire = useRef(null);
  const t = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "books"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (s) => {
      const b = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setBooks(b);
      if (b.length > 0 && !selectedBookId) setSelectedBookId(b[0].id);
    });
    return () => unsubscribe();
  }, [user, selectedBookId]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    // CRITICAL FIX: Correct audio refs
    if (!audioRain.current) {
      audioRain.current = new Audio(SOUNDS.rain);
      audioRain.current.loop = true;
    }
    if (!audioFire.current) {
      audioFire.current = new Audio(SOUNDS.fire);
      audioFire.current.loop = true;
    }

    if (isActive && soundRain) {
      audioRain.current.play().catch(e => console.log(e));
    } else {
      audioRain.current.pause();
    }

    if (isActive && soundFire) {
      audioFire.current.play().catch(e => console.log(e));
    } else {
      audioFire.current.pause();
    }

    return () => {
      if (audioRain.current) audioRain.current.pause();
      if (audioFire.current) audioFire.current.pause();
    };
  }, [soundRain, soundFire, isActive]);

  const saveSession = async () => {
    if (!selectedBookId || !user) return;
    await addDoc(collection(db, "sessions"), {
      userId: user.uid,
      bookId: selectedBookId,
      durationSeconds: seconds,
      pagesRead: parseInt(pagesRead) || 0,
      createdAt: serverTimestamp(),
      date: new Date().toISOString().split('T')[0]
    });
    const book = books.find(b => b.id === selectedBookId);
    const pRead = parseInt(pagesRead) || 0;
    if (book && pRead > 0) {
      const newPage = (book.currentPage || 0) + pRead;
      await updateDoc(doc(db, "books", selectedBookId), {
        currentPage: newPage,
        readingStatus: 'reading'
      });
      await setDoc(doc(db, "users", user.uid), { coins: increment(pRead), xp: increment(pRead * 10) }, { merge: true });
    }
    setSeconds(0);
    setPagesRead('');
    setShowSaveModal(false);
    triggerConfetti();
    showToast(`+${pRead} coins, +${pRead * 10} XP!`);
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selectedBook = books.find(b => b.id === selectedBookId);

  return (
    <div className="fade-in" style={{ padding: '60px 20px 120px 20px', textAlign: 'center', maxWidth: 500, margin: '0 auto', minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 style={{ marginBottom: 30, fontSize: '28px' }}>{t.timer}</h2>

      {books.length === 0 ? (
        <div className="cozy-card" style={{ padding: 40, textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: 15, opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t.empty}</p>
          <button onClick={() => navigate('/')} className="btn-main" style={{ width: 'auto', margin: '0 auto' }}>
            <Library size={18} /> {t.gotoLib}
          </button>
        </div>
      ) : (
        <>
          <div className="cozy-card" style={{ padding: 30, marginBottom: 25, background: isActive ? 'var(--grad-main)' : 'var(--bg-card)', transition: 'all 0.5s' }}>
            <div style={{ fontSize: '72px', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px', marginBottom: 20, textShadow: isActive ? '0 10px 30px rgba(0,0,0,0.3)' : 'none' }}>
              {formatTime(seconds)}
            </div>

            <select className="cozy-input" value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)} style={{ margin: '0 0 20px 0', textAlign: 'center', fontWeight: 'bold' }}>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>

            {selectedBook && (
              <div style={{ fontSize: '13px', color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)', marginBottom: 20 }}>
                by {selectedBook.author}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {!isActive ? (
                <button onClick={() => setIsActive(true)} className="btn-main" style={{ fontSize: '16px', padding: '16px 32px' }}>
                  <Play size={20} /> {seconds > 0 ? t.resume : t.startReading}
                </button>
              ) : (
                <button onClick={() => setIsActive(false)} className="btn-main" style={{ fontSize: '16px', padding: '16px 32px', background: 'rgba(255,255,255,0.2)' }}>
                  <Square size={20} /> {t.stopReading}
                </button>
              )}
              {seconds > 0 && !isActive && (
                <button onClick={() => setShowSaveModal(true)} className="btn-main" style={{ fontSize: '16px', padding: '16px 32px' }}>
                  <Check size={20} /> {t.finish}
                </button>
              )}
            </div>
          </div>

          <div className="cozy-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '15px', marginBottom: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Music size={18} /> Ambient Sounds
            </h3>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setSoundRain(!soundRain)} className={`btn-ghost ${soundRain ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }}>
                {soundRain ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <CloudRain size={18} /> Rain
              </button>
              <button onClick={() => setSoundFire(!soundFire)} className={`btn-ghost ${soundFire ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }}>
                {soundFire ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <Flame size={18} /> Fire
              </button>
            </div>
          </div>

          {showSaveModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.3s' }}>
              <div className="cozy-card" style={{ maxWidth: 400, width: '100%', padding: 30, animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <h3 style={{ fontSize: '20px', marginBottom: 20 }}>Session Complete! 🎉</h3>
                <div style={{ background: 'var(--bg-light)', padding: 15, borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: 5 }}>Time Read</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatTime(seconds)}</div>
                </div>
                <input className="cozy-input" type="number" value={pagesRead} onChange={e => setPagesRead(e.target.value)} placeholder="Pages read" style={{ marginBottom: 15, textAlign: 'center', fontSize: '18px' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowSaveModal(false)} className="btn-ghost" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button onClick={saveSession} className="btn-main" style={{ flex: 1 }}>
                    <Check size={18} /> {t.save}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 6. STATS VIEW (WITH HEATMAP!)
function StatsView({ user, lang, userData }) {
  const [sessions, setSessions] = useState([]);
  const [books, setBooks] = useState([]);
  const [view, setView] = useState('overview');
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const currentXP = userData?.xp || 0;
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = xpForNextLevel(currentLevel);
  const xpProgress = (currentXP % nextLevelXP) / nextLevelXP * 100;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "sessions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "books"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60;
  const totalPages = sessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0);
  const booksFinished = books.filter(b => b.readingStatus === 'finished').length;
  const streak = 7; // Mock data - calculate from sessions

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const activityData = last7Days.map(date => {
    const daySessions = sessions.filter(s => s.date === date);
    const minutes = daySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60;
    const pages = daySessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0);
    return { date, minutes, pages };
  });

  // Year in Pixels Heatmap
  const getYearDays = () => {
    const days = [];
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysDiff = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startOfYear);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = sessions.filter(s => s.date === dateStr);
      const pages = dayData.reduce((acc, s) => acc + (s.pagesRead || 0), 0);
      days.push({ date: dateStr, pages, intensity: pages > 0 ? Math.min(pages / 20, 1) : 0 });
    }
    return days;
  };

  const yearDays = getYearDays();

  return (
    <div className="fade-in" style={{ padding: '20px 20px 100px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 25 }}>{t.stats}</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['overview', 'heatmap'].map(v => (
          <button key={v} onClick={() => setView(v)} className={`btn-ghost ${view === v ? 'active' : ''}`} style={{ flex: 1 }}>
            {v === 'overview' && <><BarChart2 size={16} /> Overview</>}
            {v === 'heatmap' && <><Calendar size={16} /> Year in Pixels</>}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <>
          <div className="cozy-card" style={{ padding: 30, marginBottom: 20, background: 'var(--grad-main)', textAlign: 'center' }}>
            <LevelBadge xp={currentXP} size="large" />
            <div className="progress-track" style={{ marginTop: 15, background: 'rgba(255,255,255,0.2)' }}>
              <div className="progress-fill" style={{ width: `${xpProgress}%`, background: 'rgba(255,255,255,0.9)' }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 15, marginBottom: 20 }}>
            <div className="cozy-card" style={{ padding: 20, textAlign: 'center' }}>
              <Flame size={28} color="var(--secondary)" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 5 }}>{streak}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Day {t.streak}</div>
            </div>
            <div className="cozy-card" style={{ padding: 20, textAlign: 'center' }}>
              <Trophy size={28} color="var(--accent)" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 5 }}>{booksFinished}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.finished}</div>
            </div>
            <div className="cozy-card" style={{ padding: 20, textAlign: 'center' }}>
              <Timer size={28} color="var(--primary)" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 5 }}>{Math.round(totalMinutes)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Minutes</div>
            </div>
            <div className="cozy-card" style={{ padding: 20, textAlign: 'center' }}>
              <FileText size={28} color="var(--success)" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 5 }}>{totalPages}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pages</div>
            </div>
          </div>

          <div className="cozy-card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: '16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={18} /> Activity (Last 7 Days)
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 150, gap: 8 }}>
              {activityData.map((day, i) => {
                const maxPages = Math.max(...activityData.map(d => d.pages), 1);
                const height = (day.pages / maxPages) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: '100%', background: day.pages > 0 ? 'var(--grad-main)' : 'var(--bg-light)', height: `${height}%`, borderRadius: '8px 8px 0 0', minHeight: 4, transition: 'all 0.3s' }}></div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cozy-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '16px', marginBottom: 15 }}>Recent Sessions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.slice(0, 5).map(s => {
                const book = books.find(b => b.id === s.bookId);
                return (
                  <div key={s.id} style={{ background: 'var(--bg-light)', padding: 12, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 3 }}>{book?.title || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {Math.round(s.durationSeconds / 60)} min · {s.pagesRead || 0} pages
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(s.date).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {view === 'heatmap' && (
        <div className="cozy-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={20} /> {new Date().getFullYear()} Reading Year
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12px, 1fr))', gap: 3 }}>
            {yearDays.map((day, i) => {
              const bgColor = day.pages === 0 ? 'rgba(255,255,255,0.05)' : 
                              day.intensity < 0.25 ? 'rgba(157, 78, 221, 0.3)' :
                              day.intensity < 0.5 ? 'rgba(157, 78, 221, 0.5)' :
                              day.intensity < 0.75 ? 'rgba(157, 78, 221, 0.7)' :
                              'rgba(157, 78, 221, 1)';
              return (
                <div 
                  key={i} 
                  title={`${day.date}: ${day.pages} pages`}
                  style={{ 
                    width: 12, 
                    height: 12, 
                    background: bgColor,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.3)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, fontSize: '12px', color: 'var(--text-muted)', justifyContent: 'center' }}>
            <span>Less</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0.05, 0.25, 0.5, 0.75, 1].map(intensity => (
                <div key={intensity} style={{ width: 12, height: 12, background: `rgba(157, 78, 221, ${intensity})`, borderRadius: 2 }} />
              ))}
            </div>
            <span>More</span>
          </div>
          <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Total: {totalPages} pages read this year
          </div>
        </div>
      )}
    </div>
  );
}

// 7. SOCIAL VIEW (WITH FRIENDS SYSTEM!)
function SocialView({ user, showToast, lang, userData }) {
  const [view, setView] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const t = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setLeaderboard(users.slice(0, 10));
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "friendRequests"), where("toUserId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFriendRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !userData?.friends) return;
    const fetchFriends = async () => {
      const friendsData = await Promise.all(
        userData.friends.map(async (friendId) => {
          const friendDoc = await getDoc(doc(db, "users", friendId));
          return { id: friendId, ...friendDoc.data() };
        })
      );
      setFriends(friendsData);
    };
    fetchFriends();
  }, [user, userData]);

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() || !user) return;
    try {
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        userAvatar: user.email,
        text: newPostText,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp()
      });
      setNewPostText('');
      showToast("Posted!");
    } catch (err) {
      console.error(err);
    }
  };

  const likePost = async (postId, currentLikes, likedBy) => {
    if (!user) return;
    const hasLiked = likedBy?.includes(user.uid);
    try {
      await updateDoc(doc(db, "posts", postId), { 
        likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
        likedBy: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const searchUsers = async () => {
    if (!searchUser.trim()) return;
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const results = usersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid && (u.email?.includes(searchUser) || u.displayName?.includes(searchUser)));
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    }
  };

  const sendFriendRequest = async (toUserId) => {
    try {
      await addDoc(collection(db, "friendRequests"), {
        fromUserId: user.uid,
        fromUserName: user.displayName || user.email,
        toUserId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      showToast("Friend request sent!");
    } catch (err) {
      console.error(err);
    }
  };

  const acceptFriendRequest = async (requestId, fromUserId) => {
    try {
      await deleteDoc(doc(db, "friendRequests", requestId));
      await setDoc(doc(db, "users", user.uid), { friends: arrayUnion(fromUserId) }, { merge: true });
      await setDoc(doc(db, "users", fromUserId), { friends: arrayUnion(user.uid) }, { merge: true });
      showToast("Friend request accepted!");
    } catch (err) {
      console.error(err);
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "friendRequests", requestId));
      showToast("Request declined");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px 20px 100px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 25 }}>{t.social}</h1>

      {friendRequests.length > 0 && (
        <div className="cozy-card" style={{ padding: 15, marginBottom: 20, background: 'var(--grad-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Bell size={18} />
            <span style={{ fontWeight: 'bold' }}>{friendRequests.length} Friend Request{friendRequests.length > 1 ? 's' : ''}</span>
          </div>
          {friendRequests.map(req => (
            <div key={req.id} style={{ background: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{req.fromUserName}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => acceptFriendRequest(req.id, req.fromUserId)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  <Check size={14} /> {t.accept}
                </button>
                <button onClick={() => declineFriendRequest(req.id)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  <X size={14} /> {t.decline}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 25 }}>
        <button onClick={() => setView('feed')} className={`btn-ghost ${view === 'feed' ? 'active' : ''}`} style={{ flex: 1 }}>
          <MessageSquare size={18} /> Feed
        </button>
        <button onClick={() => setView('friends')} className={`btn-ghost ${view === 'friends' ? 'active' : ''}`} style={{ flex: 1 }}>
          <Users size={18} /> {t.friends}
        </button>
        <button onClick={() => setView('leaderboard')} className={`btn-ghost ${view === 'leaderboard' ? 'active' : ''}`} style={{ flex: 1 }}>
          <Trophy size={18} /> Top
        </button>
      </div>

      {view === 'feed' && (
        <>
          <form onSubmit={createPost} className="cozy-card" style={{ padding: 20, marginBottom: 20 }}>
            <textarea className="cozy-input" value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Share your reading thoughts..." style={{ margin: '0 0 15px 0', minHeight: 80 }} />
            <button type="submit" className="btn-main" style={{ width: 'auto' }}>
              <Send size={18} /> {t.post}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {posts.map(post => (
              <div key={post.id} className="cozy-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <AvatarWithFrame seed={post.userAvatar} size={40} frameId={post.userFrame} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{post.userName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {post.createdAt?.toDate().toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: 15 }}>{post.text}</p>
                <button onClick={() => likePost(post.id, post.likes || 0, post.likedBy || [])} className="btn-ghost" style={{ width: 'auto', padding: '8px 16px' }}>
                  <Heart size={16} fill={post.likedBy?.includes(user?.uid) ? "var(--secondary)" : "none"} color={post.likedBy?.includes(user?.uid) ? "var(--secondary)" : "currentColor"} />
                  {post.likes || 0}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'friends' && (
        <>
          <div className="cozy-card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: '16px', marginBottom: 15 }}>Find Friends</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <input className="cozy-input" value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="Search by email or name..." style={{ margin: 0 }} />
              <button onClick={searchUsers} className="btn-main" style={{ width: 'auto', padding: '12px 20px' }}>
                <Search size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {searchResults.map(u => (
                <div key={u.id} style={{ background: 'var(--bg-light)', padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AvatarWithFrame seed={u.email} size={40} frameId={u.equippedFrame} />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{u.displayName || u.email}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Level {calculateLevel(u.xp || 0)}</div>
                    </div>
                  </div>
                  <button onClick={() => sendFriendRequest(u.id)} className="btn-ghost" style={{ width: 'auto', padding: '8px 16px' }}>
                    <UserPlus size={16} /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Your Friends ({friends.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {friends.map(friend => (
              <div key={friend.id} className="cozy-card" style={{ padding: 15, textAlign: 'center' }}>
                <AvatarWithFrame seed={friend.email} size={60} frameId={friend.equippedFrame} />
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: 10, marginBottom: 3 }}>{friend.displayName || friend.email?.split('@')[0]}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Level {calculateLevel(friend.xp || 0)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {leaderboard.map((u, i) => (
            <div key={u.id} className="cozy-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15, background: i === 0 ? 'var(--grad-main)' : i === 1 ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' : i === 2 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' : 'var(--bg-card)' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', minWidth: 30 }}>#{i + 1}</div>
              <AvatarWithFrame seed={u.email || u.id} frameId={u.equippedFrame} size={50} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: 3 }}>{u.displayName || u.email}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Level {calculateLevel(u.xp || 0)} · {u.xp || 0} XP</div>
              </div>
              {i < 3 && <Crown size={24} color={i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32"} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 8. PROFILE VIEW (NEW!)
function ProfileView({ user, userData, showToast, lang }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [favoriteBooks, setFavoriteBooks] = useState(userData?.favoriteBooks || []);
  const t = DICTIONARY[lang] || DICTIONARY.en;

  const saveProfile = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        bio,
        favoriteBooks
      }, { merge: true });
      showToast("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const bannerUrl = userData?.equippedBanner || SHOP_ITEMS.find(i => i.id === 'banner_1')?.url;

  return (
    <div className="fade-in" style={{ padding: '0 0 100px 0', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ position: 'relative', height: 200, background: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--bg-dark))' }}></div>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: '50%', padding: 0 }}>
          <ArrowLeft />
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ marginTop: -40, marginBottom: 20, display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          <AvatarWithFrame seed={user.email} frameId={userData?.equippedFrame} size={100} />
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input className="cozy-input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name..." style={{ margin: 0, marginBottom: 10 }} />
            ) : (
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 5 }}>{userData?.displayName || user.email}</h1>
            )}
            <LevelBadge xp={userData?.xp || 0} />
            {userData?.badges?.map(badge => (
              <span key={badge} style={{ marginLeft: 8 }}>{SHOP_ITEMS.find(i => i.id === badge)?.icon}</span>
            ))}
          </div>
          <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} className="btn-main" style={{ width: 'auto', padding: '12px 20px' }}>
            {isEditing ? <><Check size={18} /> {t.save}</> : <><Edit2 size={18} /> {t.editProfile}</>}
          </button>
        </div>

        <div className="cozy-card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: '16px', marginBottom: 15 }}>{t.bio}</h3>
          {isEditing ? (
            <textarea className="cozy-input" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." style={{ margin: 0, minHeight: 80 }} />
          ) : (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{bio || "No bio yet. Click edit to add one!"}</p>
          )}
        </div>

        <div className="cozy-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userData?.friends?.length || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.friends}</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userData?.xp || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.xp}</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userData?.coins || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.coins}</div>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: 15 }}>{t.achievements}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, marginBottom: 20 }}>
          {ACHIEVEMENTS.slice(0, 6).map(ach => {
            const unlocked = userData?.unlockedAchievements?.includes(ach.id);
            return (
              <div key={ach.id} className="cozy-card" style={{ padding: 15, textAlign: 'center', opacity: unlocked ? 1 : 0.3 }}>
                <div style={{ fontSize: '32px', marginBottom: 5 }}>{ach.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{ach.name}</div>
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate('/achievements')} className="btn-ghost" style={{ width: '100%' }}>
          View All Achievements
        </button>
      </div>
    </div>
  );
}

// 9. ACHIEVEMENTS VIEW (NEW!)
function AchievementsView({ user, userData, showToast, lang }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const t = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "books"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "sessions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const stats = {
    books_added: books.length,
    books_finished: books.filter(b => b.readingStatus === 'finished').length,
    total_pages: sessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0),
    longest_session: Math.max(...sessions.map(s => s.durationSeconds || 0)),
    friends: userData?.friends?.length || 0,
    total_likes: 0, // Would need to calculate from posts
    streak: 7 // Mock
  };

  const checkAchievement = (ach) => {
    const value = stats[ach.type] || 0;
    return value >= ach.requirement;
  };

  const unlockedAchievements = ACHIEVEMENTS.filter(ach => checkAchievement(ach));
  const lockedAchievements = ACHIEVEMENTS.filter(ach => !checkAchievement(ach));

  return (
    <div className="fade-in" style={{ padding: '20px 20px 100px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>{t.achievements}</h1>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}>
          <X />
        </button>
      </div>

      <div className="cozy-card" style={{ padding: 20, marginBottom: 25, background: 'var(--grad-main)', textAlign: 'center' }}>
        <Trophy size={48} style={{ marginBottom: 10 }} />
        <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: 5 }}>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>Achievements Unlocked</div>
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Check size={20} color="var(--success)" /> Unlocked
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15, marginBottom: 30 }}>
        {unlockedAchievements.map(ach => (
          <div key={ach.id} className="cozy-card" style={{ padding: 20, background: 'var(--grad-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div style={{ fontSize: '48px' }}>{ach.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 3 }}>{ach.name}</div>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: 8 }}>{ach.desc}</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>+{ach.xpReward} XP</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Target size={20} color="var(--text-muted)" /> Locked
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15 }}>
        {lockedAchievements.map(ach => {
          const currentValue = stats[ach.type] || 0;
          const progress = (currentValue / ach.requirement) * 100;
          return (
            <div key={ach.id} className="cozy-card" style={{ padding: 20, opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{ fontSize: '48px', filter: 'grayscale(1)' }}>{ach.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 3 }}>{ach.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 8 }}>{ach.desc}</div>
                  <div style={{ fontSize: '12px', marginBottom: 5 }}>{currentValue} / {ach.requirement}</div>
                  <div className="progress-track" style={{ height: 6 }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 10. CHALLENGES VIEW (NEW!)
function ChallengesView({ user, userData, showToast, lang }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [books, setBooks] = useState([]);
  const t = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "sessions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "books"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  const getMonthStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  };

  const calculateProgress = (challenge) => {
    let current = 0;
    if (challenge.type === 'weekly') {
      const weekStart = getWeekStart();
      const weekSessions = sessions.filter(s => s.date >= weekStart);
      current = challenge.metric === 'pages' 
        ? weekSessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0)
        : books.filter(b => b.readingStatus === 'finished' && b.finishedDate >= weekStart).length;
    } else {
      const monthStart = getMonthStart();
      const monthSessions = sessions.filter(s => s.date >= monthStart);
      current = challenge.metric === 'pages'
        ? monthSessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0)
        : books.filter(b => b.readingStatus === 'finished' && b.finishedDate >= monthStart).length;
    }
    return { current, progress: (current / challenge.goal) * 100 };
  };

  return (
    <div className="fade-in" style={{ padding: '20px 20px 100px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>{t.challenges}</h1>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}>
          <X />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {CHALLENGES.map(challenge => {
          const { current, progress } = calculateProgress(challenge);
          const isComplete = current >= challenge.goal;
          return (
            <div key={challenge.id} className="cozy-card" style={{ padding: 20, background: isComplete ? 'var(--grad-main)' : 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                <Target size={40} color={isComplete ? "white" : "var(--primary)"} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{challenge.name}</h3>
                    {isComplete && <Check size={20} color="white" />}
                  </div>
                  <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: 8 }}>{challenge.desc}</p>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {current} / {challenge.goal} {challenge.metric}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Trophy size={24} color={isComplete ? "#FFD700" : "var(--text-muted)"} />
                  <div style={{ fontSize: '12px', marginTop: 5, fontWeight: 'bold' }}>
                    {challenge.reward} {t.coins}
                  </div>
                </div>
              </div>
              <div className="progress-track" style={{ background: isComplete ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }}>
                <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%`, background: isComplete ? 'rgba(255,255,255,0.9)' : 'var(--grad-main)' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 11. SHOP VIEW (EXPANDED!)
function ShopView({ user, userData, showToast, lang }) {
  const navigate = useNavigate();
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const coins = userData?.coins || 0;
  const inventory = userData?.inventory || [];
  const equippedFrame = userData?.equippedFrame || null;
  const equippedBanner = userData?.equippedBanner || null;

  const buyItem = async (item) => {
    if (item.special) {
      showToast("This item requires real payment!");
      return;
    }
    if (coins < item.price) {
      showToast("Not enough coins!");
      return;
    }
    if (inventory.includes(item.id)) {
      showToast("Already owned!");
      return;
    }
    try {
      await setDoc(doc(db, "users", user.uid), {
        coins: increment(-item.price),
        inventory: arrayUnion(item.id)
      }, { merge: true });
      triggerConfetti();
      showToast(`${item.name} purchased!`);
    } catch (err) {
      console.error(err);
    }
  };

  const equipFrame = async (frameId) => {
    try {
      await setDoc(doc(db, "users", user.uid), { equippedFrame: frameId }, { merge: true });
      showToast("Frame equipped!");
    } catch (err) {
      console.error(err);
    }
  };

  const equipBanner = async (bannerUrl) => {
    try {
      await setDoc(doc(db, "users", user.uid), { equippedBanner: bannerUrl }, { merge: true });
      showToast("Banner equipped!");
    } catch (err) {
      console.error(err);
    }
  };

  const equipBadge = async (badgeId) => {
    try {
      await setDoc(doc(db, "users", user.uid), { badges: arrayUnion(badgeId) }, { merge: true });
      showToast("Badge equipped!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px 20px 100px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>{t.shop}</h1>
        <button onClick={() => navigate('/')} className="btn-ghost" style={{width: 40, height: 40, borderRadius: '50%', padding: 0}}>
          <X />
        </button>
      </div>

      <div className="cozy-card" style={{ padding: 20, marginBottom: 25, background: 'var(--grad-main)', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', marginBottom: 8, opacity: 0.9 }}>Your Balance</div>
        <div style={{ fontSize: '42px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: '32px' }}>💰</span>
          {coins}
        </div>
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Avatar Frames</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 15, marginBottom: 30 }}>
        {SHOP_ITEMS.filter(i => i.type === 'frame').map(item => {
          const owned = inventory.includes(item.id);
          const equipped = equippedFrame === item.id;
          return (
            <div key={item.id} className="cozy-card" style={{ padding: 20, textAlign: 'center' }}>
              <AvatarWithFrame seed={user.email} frameId={item.id} size={80} />
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 15 }}>
                {owned ? (equipped ? t.equipped : 'Owned') : `${item.price} ${t.coins}`}
              </div>
              {!owned && (
                <button onClick={() => buyItem(item)} className="btn-main" style={{ width: '100%', fontSize: '13px', padding: '10px' }}>
                  {t.buy}
                </button>
              )}
              {owned && !equipped && (
                <button onClick={() => equipFrame(item.id)} className="btn-ghost" style={{ width: '100%', fontSize: '13px', padding: '10px' }}>
                  {t.equip}
                </button>
              )}
              {equipped && (
                <div style={{ background: 'var(--success)', color: 'white', padding: '10px', borderRadius: 12, fontSize: '13px', fontWeight: 'bold' }}>
                  ✓ {t.equipped}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Profile Banners</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 15, marginBottom: 30 }}>
        {SHOP_ITEMS.filter(i => i.type === 'banner').map(item => {
          const owned = inventory.includes(item.id);
          const equipped = equippedBanner === item.url;
          return (
            <div key={item.id} className="cozy-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 100, background: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div style={{ padding: 15 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 5 }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 10 }}>
                  {owned ? (equipped ? t.equipped : 'Owned') : `${item.price} ${t.coins}`}
                </div>
                {!owned && (
                  <button onClick={() => buyItem(item)} className="btn-main" style={{ width: '100%', fontSize: '13px', padding: '10px' }}>
                    {t.buy}
                  </button>
                )}
                {owned && !equipped && (
                  <button onClick={() => equipBanner(item.url)} className="btn-ghost" style={{ width: '100%', fontSize: '13px', padding: '10px' }}>
                    {t.equip}
                  </button>
                )}
                {equipped && (
                  <div style={{ background: 'var(--success)', color: 'white', padding: '10px', borderRadius: 12, fontSize: '13px', fontWeight: 'bold' }}>
                    ✓ {t.equipped}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: 15 }}>Badges & Power-Ups</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SHOP_ITEMS.filter(i => i.type === 'badge' || i.type === 'consumable').map(item => {
          const owned = inventory.includes(item.id);
          return (
            <div key={item.id} className="cozy-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15 }}>
              <div style={{ background: 'var(--bg-light)', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                {item.icon || item.type === 'badge' ? item.icon : '🎁'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 5 }}>{item.desc}</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {item.price} {t.coins}
                </div>
              </div>
              {!owned ? (
                <button onClick={() => buyItem(item)} className="btn-main" style={{ width: 'auto', padding: '12px 20px' }}>
                  {t.buy}
                </button>
              ) : (
                <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '13px' }}>Owned ✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 12. SETTINGS VIEW
function SettingsView({ user, showToast, currentTheme, setTheme, lang, setLang, persona, setPersona, userData }) {
  const navigate = useNavigate();
  const [showExport, setShowExport] = useState(false);
  const t = DICTIONARY[lang] || DICTIONARY.en;

  const handleLogout = async () => {
    if (confirm("Logout?")) {
      await signOut(auth);
      showToast("Logged out");
    }
  };

  const exportData = async () => {
    const books = await getDocs(query(collection(db, "books"), where("ownerId", "==", user.uid)));
    const data = { books: books.docs.map(d => d.data()) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookyo-backup.json';
    a.click();
    showToast("Exported!");
  };

  return (
    <div className="fade-in" style={{ padding: '20px 20px 100px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>{t.settings}</h1>
        <button onClick={() => navigate('/')} className="btn-ghost" style={{width: 40, height: 40, borderRadius: '50%', padding: 0}}>
          <X />
        </button>
      </div>

      <div className="cozy-card" style={{ padding: 25, marginBottom: 20, textAlign: 'center' }}>
        <AvatarWithFrame seed={user.email} frameId={userData?.equippedFrame} size={100} />
        <h2 style={{ fontSize: '20px', marginTop: 15, marginBottom: 5 }}>{user.displayName || user.email}</h2>
        <LevelBadge xp={userData?.xp || 0} />
        <button onClick={() => navigate('/profile')} className="btn-main" style={{ marginTop: 15, width: 'auto', padding: '10px 20px' }}>
          <User size={16} /> {t.viewProfile}
        </button>
      </div>

      <div className="cozy-card" style={{ padding: 20, marginBottom: 15 }}>
        <h3 style={{ fontSize: '16px', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Palette size={18} /> {t.theme}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {Object.keys(THEMES).map(themeKey => (
            <button key={themeKey} onClick={() => { setTheme(themeKey); localStorage.setItem('bookyo_theme', themeKey); showToast("Theme changed!"); }} className={`btn-ghost ${currentTheme === themeKey ? 'active' : ''}`} style={{ padding: '12px', textTransform: 'capitalize' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: THEMES[themeKey].grad, marginRight: 8 }}></div>
              {themeKey}
            </button>
          ))}
        </div>
      </div>

      <div className="cozy-card" style={{ padding: 20, marginBottom: 15 }}>
        <h3 style={{ fontSize: '16px', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={18} /> Language
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {Object.keys(LANGUAGES).map(langKey => (
            <button key={langKey} onClick={() => { setLang(langKey); localStorage.setItem('bookyo_lang', langKey); showToast("Language changed!"); }} className={`btn-ghost ${lang === langKey ? 'active' : ''}`} style={{ padding: '12px' }}>
              {LANGUAGES[langKey].label}
            </button>
          ))}
        </div>
      </div>

      <div className="cozy-card" style={{ padding: 20, marginBottom: 15 }}>
        <h3 style={{ fontSize: '16px', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={18} /> {t.persona}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.keys(PERSONAS).map(personaKey => (
            <button key={personaKey} onClick={() => { setPersona(personaKey); localStorage.setItem('bookyo_persona', personaKey); showToast("Persona changed!"); }} className={`btn-ghost ${persona === personaKey ? 'active' : ''}`} style={{ padding: '12px', textAlign: 'left' }}>
              {PERSONAS[personaKey].name}
            </button>
          ))}
        </div>
      </div>

      <div className="cozy-card" style={{ padding: 20, marginBottom: 15 }}>
        <h3 style={{ fontSize: '16px', marginBottom: 15 }}>Data</h3>
        <button onClick={exportData} className="btn-ghost" style={{ width: '100%', marginBottom: 10 }}>
          <Download size={18} /> {t.export}
        </button>
      </div>

      <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', padding: 20, color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <LogOut size={18} /> {t.logout}
      </button>
    </div>
  );
}

// 13. MAGIC VIEW (AI CHAT)
function MagicView({ messages, setMessages, apiKey, user, showToast, persona }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const suggestions = ["Recommend a book", "What should I read next?", "Tell me a reading quote"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e, suggestionText = null) => {
    e.preventDefault();
    const text = suggestionText || input;
    if (!text.trim()) return;

    const userMsg = { text, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const promptPrefix = PERSONAS[persona]?.prompt || PERSONAS.owl.prompt;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${promptPrefix}\n\nUser: ${text}\n\nIf recommending a book, respond with JSON: {"recommendation": "your response", "book": {"title": "...", "author": "..."}}` }]
          }]
        })
      });
      const data = await res.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't respond.";
      
      let bookRecommendation = null;
      try {
        const cleanText = botText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        if (parsed.book) {
          bookRecommendation = parsed.book;
          setMessages(prev => [...prev, { text: parsed.recommendation, isUser: false, bookRecommendation }]);
        } else {
          setMessages(prev => [...prev, { text: botText, isUser: false }]);
        }
      } catch {
        setMessages(prev => [...prev, { text: botText, isUser: false }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { text: "Error connecting to AI.", isUser: false }]);
    }
    setIsLoading(false);
  };

  const addRecommendedBook = async (title, author) => {
    try {
      await addDoc(collection(db, "books"), {
        ownerId: user.uid,
        title,
        author,
        totalPages: 0,
        currentPage: 0,
        readingStatus: 'want_to_read',
        createdAt: serverTimestamp()
      });
      showToast("Book added!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-dark)' }}>
      <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: 'var(--grad-main)', borderRadius: '50%', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: 3 }}>Bookyo AI</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{PERSONAS[persona]?.name}</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} className={msg.isUser ? 'bubble-user' : 'bubble-bot'} style={{ animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {msg.text}
            {msg.bookRecommendation && (
              <div style={{ marginTop: 12, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: 3 }}>{msg.bookRecommendation.title}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{msg.bookRecommendation.author}</div>
                </div>
                <button onClick={() => addRecommendedBook(msg.bookRecommendation.title, msg.bookRecommendation.author)} className="btn-main" style={{ width: 'auto', padding: '8px 12px', fontSize: '11px' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bubble-bot" style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s ease-in-out infinite' }}></div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s ease-in-out infinite 0.2s' }}></div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s ease-in-out infinite 0.4s' }}></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '0 15px', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10 }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={(e) => sendMessage(e, s)} className="btn-ghost" style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 14px' }}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ padding: '10px 15px 100px 15px', background: 'var(--bg-card)', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <input className="cozy-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Bookyo..." style={{ margin: 0, borderRadius: 30 }} />
        <button type="submit" className="btn-main" style={{ width: 54, height: 54, borderRadius: '50%', padding: 0 }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

// 14. NAVBAR (UPDATED)
function NavBar({ lang }) {
  const loc = useLocation();
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const isActive = (p) => loc.pathname === p;
  
  return (
    <nav className="bookyo-nav">
      <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <Library size={24} />
        <span>{t.library}</span>
      </Link>
      <Link to="/timer" className={`nav-item ${isActive('/timer') ? 'active' : ''}`}>
        <Timer size={24} />
        <span>{t.timer}</span>
      </Link>
      <Link to="/stats" className={`nav-item ${isActive('/stats') ? 'active' : ''}`}>
        <BarChart2 size={24} />
        <span>{t.stats}</span>
      </Link>
      <Link to="/social" className={`nav-item ${isActive('/social') ? 'active' : ''}`}>
        <Users size={24} />
        <span>{t.social}</span>
      </Link>
      <Link to="/ai" className={`nav-item ${isActive('/ai') ? 'active' : ''}`}>
        <Sparkles size={24} />
        <span>AI</span>
      </Link>
    </nav>
  );
}

// 15. MAIN APP COMPONENT
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('bookyo_theme') || 'mystic');
  const [lang, setLang] = useState(localStorage.getItem('bookyo_lang') || 'de');
  const [persona, setPersona] = useState(localStorage.getItem('bookyo_persona') || 'owl');
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [achievementUnlock, setAchievementUnlock] = useState(null);

  const showToast = (msg) => setToastMsg(msg);

  useEffect(() => {
    const t = THEMES[theme];
    if (t) {
      const root = document.documentElement.style;
      root.setProperty('--primary', t.primary);
      root.setProperty('--secondary', t.secondary);
      root.setProperty('--bg-dark', t.bg);
      root.setProperty('--bg-card', t.card);
      root.setProperty('--grad-main', t.grad);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = LANGUAGES[lang].dir;
  }, [lang]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) {
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = localStorage.getItem('last_login');
        if (lastLogin !== today) setShowDailyModal(true);

        onSnapshot(doc(db, "users", u.uid), (doc) => {
          const data = doc.data();
          setUserData(data || {});
          
          if (!doc.exists()) {
            setDoc(doc.ref, {
              email: u.email,
              coins: 0,
              xp: 0,
              inventory: [],
              equippedFrame: null,
              friends: [],
              unlockedAchievements: [],
              createdAt: serverTimestamp()
            });
          }
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const claimDailyBonus = async () => {
    localStorage.setItem('last_login', new Date().toISOString().split('T')[0]);
    if (user) await setDoc(doc(db, "users", user.uid), { coins: increment(10) }, { merge: true });
    triggerConfetti();
    showToast("Daily Bonus claimed! +10 Coins");
  };

  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('bookyo_chat');
    return saved ? JSON.parse(saved) : [{ text: "Hi! I'm Bookyo, your magical reading companion! 🦉✨", isUser: false }];
  });

  const API_KEY = "AIzaSyBpGZoIH-xysannoyEH_XusKCCFTDGgfBE";

  useEffect(() => {
    localStorage.setItem('bookyo_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ background: 'var(--grad-main)', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'pulse 1.5s ease-in-out infinite' }}>
          <BookOpen size={40} color="white" />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bookyo
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LibraryView user={user} apiKey={API_KEY} showToast={showToast} lang={lang} />} />
        <Route path="/shop" element={<ShopView user={user} userData={userData || {}} showToast={showToast} lang={lang} />} />
        <Route path="/settings" element={<SettingsView user={user} showToast={showToast} currentTheme={theme} setTheme={setTheme} lang={lang} setLang={setLang} persona={persona} setPersona={setPersona} userData={userData} />} />
        <Route path="/timer" element={<TimerView user={user} showToast={showToast} lang={lang} />} />
        <Route path="/stats" element={<StatsView user={user} lang={lang} userData={userData} />} />
        <Route path="/social" element={<SocialView user={user} showToast={showToast} lang={lang} userData={userData} />} />
        <Route path="/ai" element={<MagicView messages={chatMessages} setMessages={setChatMessages} apiKey={API_KEY} user={user} showToast={showToast} persona={persona} />} />
        <Route path="/profile" element={<ProfileView user={user} userData={userData} showToast={showToast} lang={lang} />} />
        <Route path="/achievements" element={<AchievementsView user={user} userData={userData} showToast={showToast} lang={lang} />} />
        <Route path="/challenges" element={<ChallengesView user={user} userData={userData} showToast={showToast} lang={lang} />} />
      </Routes>
      <NavBar lang={lang} />
      <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />
      {showDailyModal && <DailyCheckIn onClose={() => setShowDailyModal(false)} onClaim={claimDailyBonus} />}
      {achievementUnlock && <AchievementUnlockModal achievement={achievementUnlock} onClose={() => setAchievementUnlock(null)} />}
    </BrowserRouter>
  );
}
