// 📝 READING JOURNAL SYSTEM
import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { BookOpen, Plus, Search, Tag, Calendar, Heart, Trash2, Edit2 } from 'lucide-react';

export function ReadingJournalView({ user, books, showToast }) {
  const [entries, setEntries] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  useEffect(() => {
    loadJournalEntries();
  }, [books]);
  
  const loadJournalEntries = () => {
    const allEntries = [];
    
    books.forEach(book => {
      if (book.notes) {
        book.notes.forEach(note => {
          allEntries.push({
            ...note,
            bookId: book.id,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookCover: book.coverUrl
          });
        });
      }
    });
    
    // Sort by date
    allEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setEntries(allEntries);
  };
  
  const filteredEntries = entries.filter(entry => {
    if (selectedBook && entry.bookId !== selectedBook.id) return false;
    if (filterType !== 'all' && entry.type !== filterType) return false;
    if (searchQuery && !entry.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className="page-title">📝 Reading Journal</h1>
            <p className="page-subtitle">{entries.length} entries across {books.length} books</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-main">
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <select
            value={selectedBook?.id || ''}
            onChange={(e) => setSelectedBook(books.find(b => b.id === e.target.value) || null)}
            className="input"
            style={{ maxWidth: 200 }}
          >
            <option value="">All Books</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>{book.title}</option>
            ))}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input"
            style={{ maxWidth: 150 }}
          >
            <option value="all">All Types</option>
            <option value="note">📝 Notes</option>
            <option value="quote">💬 Quotes</option>
            <option value="highlight">✨ Highlights</option>
            <option value="thought">💭 Thoughts</option>
          </select>
          
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ flex: 1, minWidth: 200 }}
          />
        </div>
      </div>
      
      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className="cozy-card" style={{ padding: 60, textAlign: 'center' }}>
          <BookOpen size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No entries yet</h3>
          <p style={{ opacity: 0.7 }}>Start journaling your reading experience!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredEntries.map((entry, index) => (
            <JournalEntry key={index} entry={entry} showToast={showToast} />
          ))}
        </div>
      )}
      
      {showAddModal && (
        <AddJournalEntryModal
          books={books}
          user={user}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            loadJournalEntries();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function JournalEntry({ entry, showToast }) {
  const typeIcons = {
    note: '📝',
    quote: '💬',
    highlight: '✨',
    thought: '💭'
  };
  
  const typeColors = {
    note: '#4ECDC4',
    quote: '#FFD93D',
    highlight: '#FF6B6B',
    thought: '#A8DADC'
  };
  
  return (
    <div className="cozy-card" style={{ padding: 20, borderLeft: `4px solid ${typeColors[entry.type]}` }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        {entry.bookCover && (
          <img src={entry.bookCover} alt="" style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 6 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '20px' }}>{typeIcons[entry.type]}</span>
            <span style={{ fontSize: '12px', padding: '4px 8px', background: typeColors[entry.type], color: 'black', borderRadius: 12, fontWeight: 'bold' }}>
              {entry.type}
            </span>
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
            {entry.bookTitle}
          </h4>
          <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: 8 }}>
            {entry.bookAuthor}
          </div>
        </div>
      </div>
      
      <div style={{
        padding: 16,
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 8,
        marginBottom: 12,
        fontSize: '15px',
        lineHeight: 1.6,
        fontStyle: entry.type === 'quote' ? 'italic' : 'normal'
      }}>
        {entry.type === 'quote' && '"'}
        {entry.text}
        {entry.type === 'quote' && '"'}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', opacity: 0.6 }}>
        <div>
          <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
          {new Date(entry.createdAt).toLocaleDateString()}
          {entry.page && <span style={{ marginLeft: 8 }}>• Page {entry.page}</span>}
        </div>
        {entry.mood && (
          <div>
            Mood: {entry.mood}
          </div>
        )}
      </div>
    </div>
  );
}

function AddJournalEntryModal({ books, user, onClose, onSave, showToast }) {
  const [selectedBook, setSelectedBook] = useState(books[0]);
  const [entryType, setEntryType] = useState('note');
  const [text, setText] = useState('');
  const [page, setPage] = useState('');
  const [mood, setMood] = useState('');
  
  const handleSave = async () => {
    if (!text.trim() || !selectedBook) return;
    
    try {
      const entry = {
        type: entryType,
        text,
        page: parseInt(page) || null,
        mood,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, "books", selectedBook.id), {
        notes: arrayUnion(entry)
      });
      
      showToast("✅ Journal entry added!");
      onSave();
    } catch (error) {
      console.error("Add entry error:", error);
      showToast("❌ Failed to add entry");
    }
  };
  
  const moods = ['😊', '😐', '😢', '🤔', '😍', '😱', '🤯', '😴'];
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 24 }}>New Journal Entry</h2>
        
        <label style={{ display: 'block', marginBottom: 8 }}>Book</label>
        <select
          value={selectedBook?.id}
          onChange={(e) => setSelectedBook(books.find(b => b.id === e.target.value))}
          className="input"
          style={{ marginBottom: 16 }}
        >
          {books.map(book => (
            <option key={book.id} value={book.id}>{book.title}</option>
          ))}
        </select>
        
        <label style={{ display: 'block', marginBottom: 8 }}>Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {['note', 'quote', 'highlight', 'thought'].map(type => (
            <button
              key={type}
              onClick={() => setEntryType(type)}
              className={`btn-ghost ${entryType === type ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {type}
            </button>
          ))}
        </div>
        
        <label style={{ display: 'block', marginBottom: 8 }}>
          {entryType === 'quote' ? 'Quote' : entryType === 'highlight' ? 'Highlight' : 'Your Thoughts'}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input"
          rows={6}
          placeholder={
            entryType === 'quote' ? 'Enter the quote...' :
            entryType === 'highlight' ? 'What stood out to you?' :
            'Write your thoughts...'
          }
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>Page (optional)</label>
            <input
              type="number"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="input"
              placeholder="Page number"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>Mood (optional)</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {moods.map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  style={{
                    fontSize: '24px',
                    background: mood === m ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 8,
                    padding: 8,
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn-main" style={{ flex: 1 }}>
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReadingJournalView;
