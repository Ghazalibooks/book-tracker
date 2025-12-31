// 🔌 API INTEGRATIONS - Goodreads, Spotify, Open Library, Email
import { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

// ========================================
// GOODREADS INTEGRATION
// ========================================
export const GoodreadsAPI = {
  // Connect Goodreads account
  connect: async (userId) => {
    // In production: OAuth flow with Goodreads
    // For now: Demo mode
    const apiKey = 'DEMO_KEY';
    const userId_goodreads = 'user_' + Math.random().toString(36).substr(2, 9);
    
    await updateDoc(doc(db, "users", userId), {
      integrations: {
        goodreads: {
          connected: true,
          userId: userId_goodreads,
          apiKey: apiKey,
          connectedAt: new Date().toISOString()
        }
      }
    });
    
    return { success: true };
  },
  
  // Import books from Goodreads
  importBooks: async () => {
    // Demo data - in production: fetch from Goodreads API
    return [
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', pages: 310, status: 'reading', rating: 5 },
      { title: '1984', author: 'George Orwell', pages: 328, status: 'finished', rating: 5 },
      { title: 'Dune', author: 'Frank Herbert', pages: 688, status: 'wishlist', rating: 0 }
    ];
  },
  
  // Export to Goodreads
  exportBook: async (book) => {
    // In production: POST to Goodreads API
    console.log('Exporting to Goodreads:', book);
    return { success: true };
  },
  
  // Sync reading progress
  syncProgress: async (book) => {
    // In production: Update Goodreads shelf
    console.log('Syncing progress:', book);
    return { success: true };
  }
};

// ========================================
// SPOTIFY INTEGRATION
// ========================================
export const SpotifyAPI = {
  clientId: 'YOUR_SPOTIFY_CLIENT_ID',
  redirectUri: 'http://localhost:3000/callback',
  
  // Connect Spotify
  connect: () => {
    const scopes = 'user-read-currently-playing user-modify-playback-state user-read-playback-state';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SpotifyAPI.clientId}&response_type=token&redirect_uri=${encodeURIComponent(SpotifyAPI.redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    
    // Open Spotify OAuth
    window.open(authUrl, 'Spotify Login', 'width=500,height=700');
  },
  
  // Get current playing track
  getCurrentTrack: async (accessToken) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      console.error('Spotify API error:', error);
      return null;
    }
  },
  
  // Search playlists
  searchPlaylists: async (accessToken, query) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );
      const data = await response.json();
      return data.playlists?.items || [];
    } catch (error) {
      console.error('Spotify search error:', error);
      return [];
    }
  },
  
  // Play playlist
  playPlaylist: async (accessToken, playlistUri) => {
    try {
      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context_uri: playlistUri })
      });
      return { success: true };
    } catch (error) {
      console.error('Spotify play error:', error);
      return { success: false };
    }
  }
};

// ========================================
// OPEN LIBRARY ENHANCED
// ========================================
export const OpenLibraryAPI = {
  // Enhanced book search
  searchBooks: async (query) => {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await response.json();
      
      return data.docs.map(book => ({
        title: book.title,
        author: book.author_name?.[0] || 'Unknown',
        pages: book.number_of_pages_median || 0,
        coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
        isbn: book.isbn?.[0],
        publishYear: book.first_publish_year,
        subjects: book.subject?.slice(0, 5) || []
      }));
    } catch (error) {
      console.error('Open Library error:', error);
      return [];
    }
  },
  
  // Get book details
  getBookDetails: async (isbn) => {
    try {
      const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      const data = await response.json();
      
      return {
        title: data.title,
        description: data.description?.value || data.description,
        publishDate: data.publish_date,
        publishers: data.publishers,
        subjects: data.subjects
      };
    } catch (error) {
      console.error('Open Library details error:', error);
      return null;
    }
  },
  
  // Get author info
  getAuthorInfo: async (authorKey) => {
    try {
      const response = await fetch(`https://openlibrary.org${authorKey}.json`);
      const data = await response.json();
      
      return {
        name: data.name,
        bio: data.bio?.value || data.bio,
        birthDate: data.birth_date,
        photoUrl: data.photos?.[0] ? `https://covers.openlibrary.org/a/id/${data.photos[0]}-L.jpg` : null
      };
    } catch (error) {
      console.error('Open Library author error:', error);
      return null;
    }
  }
};

// ========================================
// EMAIL NOTIFICATIONS
// ========================================
export const EmailAPI = {
  // Send email via SendGrid/Mailgun
  sendEmail: async (to, subject, html) => {
    // In production: Use SendGrid or Mailgun API
    // For now: Log to console
    console.log('Sending email:', { to, subject, html });
    return { success: true };
  },
  
  // Send reading reminder
  sendReadingReminder: async (userEmail, userName) => {
    const html = `
      <h2>📚 Time to Read!</h2>
      <p>Hi ${userName},</p>
      <p>Don't forget to continue your reading journey today! 🌟</p>
      <p>Your daily reading goal is waiting for you.</p>
      <p><a href="https://bookyo.app">Start Reading</a></p>
    `;
    
    return await EmailAPI.sendEmail(userEmail, '📚 Reading Reminder', html);
  },
  
  // Send achievement notification
  sendAchievementEmail: async (userEmail, userName, achievement) => {
    const html = `
      <h2>🎉 Achievement Unlocked!</h2>
      <p>Hi ${userName},</p>
      <p>Congratulations! You've unlocked: <strong>${achievement.name}</strong></p>
      <p>${achievement.description}</p>
      <p>Reward: ⭐ ${achievement.xp} XP, 💰 ${achievement.coins} coins</p>
      <p><a href="https://bookyo.app/achievements">View All Achievements</a></p>
    `;
    
    return await EmailAPI.sendEmail(userEmail, '🎉 Achievement Unlocked!', html);
  },
  
  // Send weekly summary
  sendWeeklySummary: async (userEmail, userName, stats) => {
    const html = `
      <h2>📊 Your Weekly Reading Summary</h2>
      <p>Hi ${userName},</p>
      <p>Here's your reading activity for this week:</p>
      <ul>
        <li>📖 Books finished: ${stats.booksFinished}</li>
        <li>📄 Pages read: ${stats.pagesRead}</li>
        <li>⏱️ Minutes read: ${stats.minutesRead}</li>
        <li>🔥 Current streak: ${stats.streak} days</li>
      </ul>
      <p>Keep up the great work! 🌟</p>
      <p><a href="https://bookyo.app">Continue Reading</a></p>
    `;
    
    return await EmailAPI.sendEmail(userEmail, '📊 Your Weekly Reading Summary', html);
  }
};

// ========================================
// INTEGRATIONS VIEW
// ========================================
export function IntegrationsView({ user, userData, showToast }) {
  const [connectingGoodreads, setConnectingGoodreads] = useState(false);
  const [importingBooks, setImportingBooks] = useState(false);
  
  const handleConnectGoodreads = async () => {
    setConnectingGoodreads(true);
    try {
      await GoodreadsAPI.connect(user.uid);
      showToast("✅ Connected to Goodreads!");
      window.location.reload();
    } catch (error) {
      showToast("❌ Failed to connect to Goodreads");
    }
    setConnectingGoodreads(false);
  };
  
  const handleImportBooks = async () => {
    setImportingBooks(true);
    try {
      const books = await GoodreadsAPI.importBooks();
      showToast(`✅ Imported ${books.length} books from Goodreads!`);
    } catch (error) {
      showToast("❌ Failed to import books");
    }
    setImportingBooks(false);
  };
  
  const handleConnectSpotify = () => {
    SpotifyAPI.connect();
  };
  
  const goodreadsConnected = userData?.integrations?.goodreads?.connected;
  const spotifyConnected = userData?.integrations?.spotify?.connected;
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔌 Integrations</h1>
        <p className="page-subtitle">Connect your favorite services</p>
      </div>
      
      {/* Goodreads */}
      <div className="cozy-card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ fontSize: '48px' }}>📚</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 4 }}>Goodreads</h3>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Import your books and sync your reading progress
            </p>
          </div>
          {goodreadsConnected ? (
            <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ Connected</div>
          ) : (
            <button onClick={handleConnectGoodreads} className="btn-main" disabled={connectingGoodreads}>
              {connectingGoodreads ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
        
        {goodreadsConnected && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleImportBooks} className="btn-ghost" disabled={importingBooks}>
              {importingBooks ? 'Importing...' : 'Import Books'}
            </button>
            <button className="btn-ghost">Export Books</button>
            <button className="btn-ghost">Sync Progress</button>
          </div>
        )}
      </div>
      
      {/* Spotify */}
      <div className="cozy-card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: '48px' }}>🎵</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 4 }}>Spotify</h3>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Play your favorite playlists while reading
            </p>
          </div>
          {spotifyConnected ? (
            <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ Connected</div>
          ) : (
            <button onClick={handleConnectSpotify} className="btn-main">
              Connect
            </button>
          )}
        </div>
      </div>
      
      {/* Email Notifications */}
      <div className="cozy-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ fontSize: '48px' }}>📧</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 4 }}>Email Notifications</h3>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Get updates about your reading progress
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span>Daily reading reminders</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span>Weekly summary</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span>Achievement notifications</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default { GoodreadsAPI, SpotifyAPI, OpenLibraryAPI, EmailAPI, IntegrationsView };
