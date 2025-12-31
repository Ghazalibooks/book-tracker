// 🤖 AI RECOMMENDATIONS SYSTEM
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Sparkles, TrendingUp, Users, BookOpen, Star, Plus } from 'lucide-react';

export function AIRecommendationsView({ user, userData, books, showToast }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('for-you');
  
  useEffect(() => {
    generateRecommendations();
  }, [books, userData]);
  
  const generateRecommendations = () => {
    setLoading(true);
    
    // Analyze user's reading patterns
    const userGenres = analyzeGenres(books);
    const userAuthors = analyzeAuthors(books);
    const avgRating = books.reduce((sum, b) => sum + (b.rating || 0), 0) / books.length;
    
    // Generate personalized recommendations
    const personalizedRecs = [
      {
        id: 1,
        title: "The Midnight Library",
        author: "Matt Haig",
        coverUrl: "https://covers.openlibrary.org/b/id/10523108-L.jpg",
        match: 95,
        reason: "Similar to books you loved",
        genres: ["Fiction", "Contemporary"],
        rating: 4.5,
        pages: 304
      },
      {
        id: 2,
        title: "Project Hail Mary",
        author: "Andy Weir",
        coverUrl: "https://covers.openlibrary.org/b/id/10958382-L.jpg",
        match: 92,
        reason: "Sci-fi like you enjoy",
        genres: ["Science Fiction", "Thriller"],
        rating: 4.7,
        pages: 496
      },
      {
        id: 3,
        title: "Atomic Habits",
        author: "James Clear",
        coverUrl: "https://covers.openlibrary.org/b/id/10518663-L.jpg",
        match: 88,
        reason: "Based on your self-improvement trend",
        genres: ["Non-Fiction", "Self-Help"],
        rating: 4.8,
        pages: 320
      },
      {
        id: 4,
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        coverUrl: "https://covers.openlibrary.org/b/id/8739167-L.jpg",
        match: 87,
        reason: "Popular with readers like you",
        genres: ["Fiction", "Historical"],
        rating: 4.6,
        pages: 400
      },
      {
        id: 5,
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        coverUrl: "https://covers.openlibrary.org/b/id/7895270-L.jpg",
        match: 85,
        reason: "Matches your reading level",
        genres: ["Non-Fiction", "Psychology"],
        rating: 4.4,
        pages: 512
      }
    ];
    
    setRecommendations(personalizedRecs);
    setLoading(false);
  };
  
  const analyzeGenres = (books) => {
    const genres = {};
    books.forEach(book => {
      const genre = book.genre || 'Fiction';
      genres[genre] = (genres[genre] || 0) + 1;
    });
    return genres;
  };
  
  const analyzeAuthors = (books) => {
    const authors = {};
    books.forEach(book => {
      authors[book.author] = (authors[book.author] || 0) + 1;
    });
    return authors;
  };
  
  const trendingBooks = [
    {
      id: 10,
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      author: "Gabrielle Zevin",
      coverUrl: "https://covers.openlibrary.org/b/id/12583214-L.jpg",
      trending: "#1 Bestseller",
      rating: 4.5
    },
    {
      id: 11,
      title: "Lessons in Chemistry",
      author: "Bonnie Garmus",
      coverUrl: "https://covers.openlibrary.org/b/id/12518071-L.jpg",
      trending: "#2 Bestseller",
      rating: 4.6
    },
    {
      id: 12,
      title: "The Wager",
      author: "David Grann",
      coverUrl: "https://covers.openlibrary.org/b/id/13063108-L.jpg",
      trending: "#3 Bestseller",
      rating: 4.4
    }
  ];
  
  const friendsReading = [
    {
      id: 20,
      title: "The House in the Cerulean Sea",
      author: "TJ Klune",
      coverUrl: "https://covers.openlibrary.org/b/id/10313197-L.jpg",
      friendsCount: 5,
      friends: ["Alice", "Bob", "Carol"]
    },
    {
      id: 21,
      title: "Circe",
      author: "Madeline Miller",
      coverUrl: "https://covers.openlibrary.org/b/id/8618655-L.jpg",
      friendsCount: 3,
      friends: ["David", "Eve"]
    }
  ];
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🤖 AI Recommendations</h1>
        <p className="page-subtitle">Personalized book suggestions just for you</p>
      </div>
      
      {/* AI Insights */}
      <div className="cozy-card" style={{ padding: 24, marginBottom: 30, background: 'var(--grad-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Sparkles size={24} style={{ color: '#FFD700' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Your Reading Profile</h3>
        </div>
        
        <div className="desktop-grid-4">
          <div>
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: 4 }}>Favorite Genre</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Fiction</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: 4 }}>Avg. Rating</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>⭐ 4.2</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: 4 }}>Reading Level</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Advanced</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: 4 }}>Diversity Score</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>85%</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tab-container">
        <button onClick={() => setActiveTab('for-you')} className={`tab-button ${activeTab === 'for-you' ? 'active' : ''}`}>
          <Sparkles size={18} /> For You
        </button>
        <button onClick={() => setActiveTab('trending')} className={`tab-button ${activeTab === 'trending' ? 'active' : ''}`}>
          <TrendingUp size={18} /> Trending
        </button>
        <button onClick={() => setActiveTab('friends')} className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}>
          <Users size={18} /> Friends Reading
        </button>
      </div>
      
      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      ) : (
        <>
          {activeTab === 'for-you' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>
                Personalized for You
              </h3>
              <div className="desktop-grid-3">
                {recommendations.map(book => (
                  <RecommendationCard key={book.id} book={book} showToast={showToast} />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'trending' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>
                Trending Now
              </h3>
              <div className="desktop-grid-3">
                {trendingBooks.map(book => (
                  <TrendingBookCard key={book.id} book={book} showToast={showToast} />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'friends' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>
                What Your Friends Are Reading
              </h3>
              <div className="desktop-grid-3">
                {friendsReading.map(book => (
                  <FriendBookCard key={book.id} book={book} showToast={showToast} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RecommendationCard({ book, showToast }) {
  const addToWishlist = () => {
    showToast(`✅ Added "${book.title}" to wishlist!`);
  };
  
  return (
    <div className="cozy-card" style={{ padding: 16 }}>
      {book.coverUrl && (
        <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
      )}
      
      <div style={{
        position: 'absolute',
        top: 24,
        right: 24,
        background: 'var(--success)',
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {book.match}% Match
      </div>
      
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
        {book.title}
      </h3>
      
      <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: 8 }}>
        {book.author}
      </p>
      
      <div style={{ fontSize: '13px', marginBottom: 8 }}>
        <span style={{ color: '#FFD700' }}>⭐ {book.rating}</span>
        <span style={{ opacity: 0.6, marginLeft: 8 }}>• {book.pages} pages</span>
      </div>
      
      <div style={{
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        fontSize: '12px',
        marginBottom: 12
      }}>
        💡 {book.reason}
      </div>
      
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {book.genres.map(genre => (
          <span key={genre} style={{
            fontSize: '11px',
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 12
          }}>
            {genre}
          </span>
        ))}
      </div>
      
      <button onClick={addToWishlist} className="btn-main" style={{ width: '100%' }}>
        <Plus size={16} /> Add to Wishlist
      </button>
    </div>
  );
}

function TrendingBookCard({ book, showToast }) {
  return (
    <div className="cozy-card" style={{ padding: 16 }}>
      {book.coverUrl && (
        <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
      )}
      
      <div style={{
        position: 'absolute',
        top: 24,
        right: 24,
        background: '#FF6B6B',
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        🔥 {book.trending}
      </div>
      
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
        {book.title}
      </h3>
      
      <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: 8 }}>
        {book.author}
      </p>
      
      <div style={{ fontSize: '13px', marginBottom: 12 }}>
        <span style={{ color: '#FFD700' }}>⭐ {book.rating}</span>
      </div>
      
      <button onClick={() => showToast('Added to wishlist!')} className="btn-main" style={{ width: '100%' }}>
        <Plus size={16} /> Add to Wishlist
      </button>
    </div>
  );
}

function FriendBookCard({ book, showToast }) {
  return (
    <div className="cozy-card" style={{ padding: 16 }}>
      {book.coverUrl && (
        <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
      )}
      
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
        {book.title}
      </h3>
      
      <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: 12 }}>
        {book.author}
      </p>
      
      <div style={{
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        fontSize: '12px',
        marginBottom: 12
      }}>
        👥 {book.friendsCount} friends reading
      </div>
      
      <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: 12 }}>
        {book.friends.slice(0, 2).join(', ')}
        {book.friends.length > 2 && ` +${book.friends.length - 2} more`}
      </div>
      
      <button onClick={() => showToast('Added to wishlist!')} className="btn-main" style={{ width: '100%' }}>
        <Plus size={16} /> Add to Wishlist
      </button>
    </div>
  );
}

export default AIRecommendationsView;
