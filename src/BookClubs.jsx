// 📖 BOOK CLUBS SYSTEM
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Users, Plus, BookOpen, Calendar, MessageSquare, Vote, Crown, UserPlus, UserMinus } from 'lucide-react';
import { SimpleAvatar } from './AvatarBuilder';

export function BookClubsView({ user, userData, showToast }) {
  const [activeTab, setActiveTab] = useState('discover');
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  useEffect(() => {
    loadClubs();
  }, [user.uid]);
  
  const loadClubs = async () => {
    try {
      // Load all clubs
      const clubsQuery = query(collection(db, "bookClubs"), orderBy("memberCount", "desc"));
      const clubsSnapshot = await getDocs(clubsQuery);
      const allClubs = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter user's clubs
      const userClubs = allClubs.filter(club => club.members?.includes(user.uid));
      
      setClubs(allClubs);
      setMyClubs(userClubs);
    } catch (error) {
      console.error("Load clubs error:", error);
    }
  };
  
  const createClub = async (clubData) => {
    try {
      const newClub = {
        ...clubData,
        creatorId: user.uid,
        members: [user.uid],
        memberCount: 1,
        currentBook: null,
        readingSchedule: [],
        createdAt: new Date().toISOString(),
        posts: []
      };
      
      await addDoc(collection(db, "bookClubs"), newClub);
      showToast("✅ Book club created!");
      await loadClubs();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Create club error:", error);
      showToast("❌ Failed to create club");
    }
  };
  
  const joinClub = async (clubId) => {
    try {
      await updateDoc(doc(db, "bookClubs", clubId), {
        members: arrayUnion(user.uid),
        memberCount: (clubs.find(c => c.id === clubId)?.memberCount || 0) + 1
      });
      
      showToast("✅ Joined club!");
      await loadClubs();
    } catch (error) {
      console.error("Join club error:", error);
      showToast("❌ Failed to join");
    }
  };
  
  const leaveClub = async (clubId) => {
    try {
      await updateDoc(doc(db, "bookClubs", clubId), {
        members: arrayRemove(user.uid),
        memberCount: (clubs.find(c => c.id === clubId)?.memberCount || 1) - 1
      });
      
      showToast("✅ Left club");
      await loadClubs();
    } catch (error) {
      console.error("Leave club error:", error);
      showToast("❌ Failed to leave");
    }
  };
  
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className="page-title">📖 Book Clubs</h1>
            <p className="page-subtitle">Read together with friends</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-main">
            <Plus size={18} /> Create Club
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tab-container">
        <button onClick={() => setActiveTab('discover')} className={`tab-button ${activeTab === 'discover' ? 'active' : ''}`}>
          🔍 Discover
        </button>
        <button onClick={() => setActiveTab('my-clubs')} className={`tab-button ${activeTab === 'my-clubs' ? 'active' : ''}`}>
          📚 My Clubs ({myClubs.length})
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'discover' && (
        <div className="desktop-grid-3">
          {clubs.filter(club => !club.members?.includes(user.uid)).map(club => (
            <ClubCard
              key={club.id}
              club={club}
              onJoin={() => joinClub(club.id)}
              isMember={false}
            />
          ))}
        </div>
      )}
      
      {activeTab === 'my-clubs' && (
        <>
          {myClubs.length === 0 ? (
            <div className="cozy-card" style={{ padding: 60, textAlign: 'center' }}>
              <BookOpen size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No clubs yet</h3>
              <p style={{ opacity: 0.7 }}>Join or create a book club to start reading together!</p>
            </div>
          ) : (
            <div className="desktop-grid-3">
              {myClubs.map(club => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onLeave={() => leaveClub(club.id)}
                  onClick={() => setSelectedClub(club)}
                  isMember={true}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {showCreateModal && (
        <CreateClubModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createClub}
        />
      )}
      
      {selectedClub && (
        <ClubDetailModal
          club={selectedClub}
          currentUser={user}
          onClose={() => setSelectedClub(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function ClubCard({ club, onJoin, onLeave, onClick, isMember }) {
  return (
    <div className="cozy-card" style={{ padding: 20, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: 12 }}>
        {club.icon || '📚'}
      </div>
      
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
        {club.name}
      </h3>
      
      <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: 16, textAlign: 'center', minHeight: 40 }}>
        {club.description}
      </p>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: '13px', justifyContent: 'center' }}>
        <div><Users size={14} style={{ display: 'inline', marginRight: 4 }} />{club.memberCount || 0}</div>
        {club.currentBook && <div>📖 Reading</div>}
      </div>
      
      {isMember ? (
        <button onClick={(e) => { e.stopPropagation(); onLeave(); }} className="btn-ghost" style={{ width: '100%' }}>
          <UserMinus size={16} /> Leave
        </button>
      ) : (
        <button onClick={(e) => { e.stopPropagation(); onJoin(); }} className="btn-main" style={{ width: '100%' }}>
          <UserPlus size={16} /> Join
        </button>
      )}
    </div>
  );
}

function CreateClubModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📚');
  const [isPrivate, setIsPrivate] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ name, description, icon, isPrivate });
  };
  
  const icons = ['📚', '📖', '📕', '📗', '📘', '📙', '📔', '📓', '📒', '🎓', '✨', '🌟'];
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 24 }}>Create Book Club</h2>
        
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 8 }}>Club Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="e.g., Sci-Fi Lovers"
            required
            style={{ marginBottom: 16 }}
          />
          
          <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder="What's your club about?"
            rows={3}
            required
            style={{ marginBottom: 16 }}
          />
          
          <label style={{ display: 'block', marginBottom: 8 }}>Icon</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
            {icons.map(ic => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                style={{
                  fontSize: '32px',
                  padding: 8,
                  background: icon === ic ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {ic}
              </button>
            ))}
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private Club (invite only)
          </label>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-main" style={{ flex: 1 }}>
              Create Club
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClubDetailModal({ club, currentUser, onClose, showToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newPost, setNewPost] = useState('');
  
  const postMessage = async () => {
    if (!newPost.trim()) return;
    
    try {
      await updateDoc(doc(db, "bookClubs", club.id), {
        posts: arrayUnion({
          userId: currentUser.uid,
          text: newPost,
          createdAt: new Date().toISOString()
        })
      });
      
      setNewPost('');
      showToast("✅ Posted!");
    } catch (error) {
      console.error("Post error:", error);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, paddingBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: '48px' }}>{club.icon}</div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{club.name}</h2>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>{club.memberCount} members</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost">Close</button>
          </div>
          
          <div className="tab-container">
            <button onClick={() => setActiveTab('overview')} className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}>
              Overview
            </button>
            <button onClick={() => setActiveTab('discussion')} className={`tab-button ${activeTab === 'discussion' ? 'active' : ''}`}>
              Discussion
            </button>
            <button onClick={() => setActiveTab('members')} className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}>
              Members
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <p style={{ marginBottom: 20 }}>{club.description}</p>
            {club.currentBook && (
              <div className="cozy-card" style={{ padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 12 }}>📖 Current Book</h3>
                <div style={{ fontSize: '16px' }}>{club.currentBook.title}</div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'discussion' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="input"
                placeholder="Share your thoughts..."
                rows={3}
                style={{ marginBottom: 12 }}
              />
              <button onClick={postMessage} className="btn-main">
                <Send size={16} /> Post
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(club.posts || []).reverse().map((post, i) => (
                <div key={i} className="cozy-card" style={{ padding: 16 }}>
                  <div style={{ fontSize: '14px', marginBottom: 4 }}>{post.text}</div>
                  <div style={{ fontSize: '12px', opacity: 0.5 }}>
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'members' && (
          <div>
            <p style={{ marginBottom: 16 }}>{club.memberCount} members in this club</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookClubsView;
