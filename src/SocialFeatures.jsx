// 👥 SOCIAL FEATURES SYSTEM
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Users, UserPlus, UserMinus, Heart, MessageSquare, Send, Search, TrendingUp, BookOpen, Timer, Trophy, Share2 } from 'lucide-react';
import { SimpleAvatar } from './AvatarBuilder';

export function SocialView({ user, userData, showToast }) {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadSocialData();
  }, [user.uid]);
  
  const loadSocialData = async () => {
    setLoading(true);
    try {
      // Load friends
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const friendIds = userDoc.data()?.friends || [];
      
      if (friendIds.length > 0) {
        const friendsData = await Promise.all(
          friendIds.map(async (friendId) => {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            return { id: friendId, ...friendDoc.data() };
          })
        );
        setFriends(friendsData);
      }
      
      // Load activity feed
      await loadActivityFeed();
      
      // Load friend suggestions
      await loadSuggestions();
    } catch (error) {
      console.error("Load social data error:", error);
    }
    setLoading(false);
  };
  
  const loadActivityFeed = async () => {
    try {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      
      const postsWithUsers = await Promise.all(
        querySnapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          const userDoc = await getDoc(doc(db, "users", postData.userId));
          return {
            id: postDoc.id,
            ...postData,
            user: userDoc.data()
          };
        })
      );
      
      setPosts(postsWithUsers);
    } catch (error) {
      console.error("Load feed error:", error);
    }
  };
  
  const loadSuggestions = async () => {
    try {
      const q = query(collection(db, "users"), limit(10));
      const querySnapshot = await getDocs(q);
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const friendIds = userDoc.data()?.friends || [];
      
      const suggestionsData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid && !friendIds.includes(u.id))
        .slice(0, 5);
      
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error("Load suggestions error:", error);
    }
  };
  
  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => 
          u.id !== user.uid &&
          (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      
      setSearchResults(results);
    } catch (error) {
      console.error("Search users error:", error);
    }
  };
  
  const followUser = async (targetUserId) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        friends: arrayUnion(targetUserId)
      }, { merge: true });
      
      // Create notification for followed user
      await addDoc(collection(db, "notifications"), {
        userId: targetUserId,
        type: 'follow',
        fromUserId: user.uid,
        fromUserName: userData.displayName,
        createdAt: new Date().toISOString(),
        read: false
      });
      
      showToast("✅ Now following!");
      await loadSocialData();
    } catch (error) {
      console.error("Follow error:", error);
      showToast("❌ Failed to follow");
    }
  };
  
  const unfollowUser = async (targetUserId) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        friends: arrayRemove(targetUserId)
      }, { merge: true });
      
      showToast("✅ Unfollowed");
      await loadSocialData();
    } catch (error) {
      console.error("Unfollow error:", error);
      showToast("❌ Failed to unfollow");
    }
  };
  
  const likePost = async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      const likes = postDoc.data()?.likes || [];
      
      if (likes.includes(user.uid)) {
        await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(user.uid) });
      }
      
      await loadActivityFeed();
    } catch (error) {
      console.error("Like error:", error);
    }
  };
  
  const createPost = async (content, type, bookData) => {
    try {
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        content: content,
        type: type,
        bookData: bookData,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      });
      
      showToast("✅ Posted!");
      await loadActivityFeed();
    } catch (error) {
      console.error("Post error:", error);
      showToast("❌ Failed to post");
    }
  };
  
  const isFriend = (userId) => friends.some(f => f.id === userId);
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Social</h1>
        <p className="page-subtitle">Connect with fellow readers</p>
      </div>
      
      {/* Tabs */}
      <div className="tab-container">
        {[
          { id: 'feed', label: '📰 Feed', icon: TrendingUp },
          { id: 'friends', label: '👥 Friends', icon: Users },
          { id: 'discover', label: '🔍 Discover', icon: Search }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      {activeTab === 'feed' && (
        <ActivityFeed
          posts={posts}
          currentUser={user}
          onLike={likePost}
          onComment={(postId, comment) => console.log("Comment:", postId, comment)}
        />
      )}
      
      {activeTab === 'friends' && (
        <FriendsList
          friends={friends}
          onUnfollow={unfollowUser}
          showToast={showToast}
        />
      )}
      
      {activeTab === 'discover' && (
        <DiscoverUsers
          suggestions={suggestions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onSearch={searchUsers}
          onFollow={followUser}
          isFriend={isFriend}
        />
      )}
    </div>
  );
}

function ActivityFeed({ posts, currentUser, onLike, onComment }) {
  const [commentInputs, setCommentInputs] = useState({});
  
  if (posts.length === 0) {
    return (
      <div className="cozy-card" style={{ padding: 60, textAlign: 'center' }}>
        <Users size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
        <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No activity yet</h3>
        <p style={{ opacity: 0.7 }}>Follow some friends to see their reading activity!</p>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {posts.map(post => (
        <div key={post.id} className="cozy-card" style={{ padding: 24 }}>
          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <SimpleAvatar config={post.user?.avatar} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>{post.user?.displayName}</div>
              <div style={{ fontSize: '13px', opacity: 0.6 }}>
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
            {post.type && (
              <div style={{
                padding: '4px 12px',
                background: 'var(--accent)',
                borderRadius: 8,
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {post.type === 'finished' && '🏆 Finished'}
                {post.type === 'review' && '✍️ Review'}
                {post.type === 'milestone' && '⭐ Milestone'}
                {post.type === 'reading' && '📖 Reading'}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div style={{ marginBottom: 16, fontSize: '15px', lineHeight: 1.6 }}>
            {post.content}
          </div>
          
          {/* Book Info */}
          {post.bookData && (
            <div className="cozy-card" style={{
              padding: 16,
              background: 'rgba(255,255,255,0.03)',
              display: 'flex',
              gap: 12,
              marginBottom: 16
            }}>
              {post.bookData.coverUrl && (
                <img
                  src={post.bookData.coverUrl}
                  alt={post.bookData.title}
                  style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 6 }}
                />
              )}
              <div>
                <div style={{ fontWeight: '600', marginBottom: 4 }}>{post.bookData.title}</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>{post.bookData.author}</div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div style={{ display: 'flex', gap: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => onLike(post.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '14px',
                opacity: post.likes?.includes(currentUser.uid) ? 1 : 0.6,
                transition: 'all 0.3s'
              }}
            >
              <Heart size={18} fill={post.likes?.includes(currentUser.uid) ? 'currentColor' : 'none'} />
              {post.likes?.length || 0}
            </button>
            
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '14px',
                opacity: 0.6
              }}
            >
              <MessageSquare size={18} />
              {post.comments?.length || 0}
            </button>
            
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '14px',
                opacity: 0.6,
                marginLeft: 'auto'
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FriendsList({ friends, onUnfollow, showToast }) {
  if (friends.length === 0) {
    return (
      <div className="cozy-card" style={{ padding: 60, textAlign: 'center' }}>
        <Users size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
        <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No friends yet</h3>
        <p style={{ opacity: 0.7 }}>Discover and follow other readers!</p>
      </div>
    );
  }
  
  return (
    <div className="desktop-grid-3">
      {friends.map(friend => (
        <div key={friend.id} className="cozy-card" style={{ padding: 20, textAlign: 'center' }}>
          <SimpleAvatar config={friend.avatar} size={80} />
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>
            {friend.displayName}
          </h3>
          <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: 16 }}>
            Level {friend.level || 1} • {friend.xp || 0} XP
          </p>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, fontSize: '13px', justifyContent: 'center' }}>
            <div>📚 {friend.booksRead || 0}</div>
            <div>🔥 {friend.streak || 0}</div>
          </div>
          
          <button
            onClick={() => onUnfollow(friend.id)}
            className="btn-ghost"
            style={{ width: '100%' }}
          >
            <UserMinus size={16} /> Unfollow
          </button>
        </div>
      ))}
    </div>
  );
}

function DiscoverUsers({ suggestions, searchQuery, setSearchQuery, searchResults, onSearch, onFollow, isFriend }) {
  const displayUsers = searchQuery ? searchResults : suggestions;
  
  return (
    <div>
      {/* Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="input"
          style={{ flex: 1 }}
        />
        <button onClick={onSearch} className="btn-main">
          <Search size={18} />
        </button>
      </div>
      
      {/* Users */}
      {displayUsers.length === 0 ? (
        <div className="cozy-card" style={{ padding: 60, textAlign: 'center' }}>
          <Search size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '20px', marginBottom: 10 }}>No users found</h3>
          <p style={{ opacity: 0.7 }}>Try a different search</p>
        </div>
      ) : (
        <div className="desktop-grid-3">
          {displayUsers.map(suggestedUser => (
            <div key={suggestedUser.id} className="cozy-card" style={{ padding: 20, textAlign: 'center' }}>
              <SimpleAvatar config={suggestedUser.avatar} size={80} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>
                {suggestedUser.displayName}
              </h3>
              <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: 16 }}>
                Level {suggestedUser.level || 1}
              </p>
              
              {isFriend(suggestedUser.id) ? (
                <button className="btn-main" style={{ width: '100%', background: 'var(--success)' }} disabled>
                  ✅ Following
                </button>
              ) : (
                <button
                  onClick={() => onFollow(suggestedUser.id)}
                  className="btn-main"
                  style={{ width: '100%' }}
                >
                  <UserPlus size={16} /> Follow
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialView;