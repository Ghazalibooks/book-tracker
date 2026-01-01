import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Users, UserPlus, MessageCircle, Heart, Send, Search, TrendingUp, Award, Book, Clock } from 'lucide-react';

export function SocialView({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('feed');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  return (
    <div className="social-container" style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div className="social-tabs" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid var(--border)'
      }}>
        <button
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'feed' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'feed' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer'
          }}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'friends' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'friends' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer'
          }}
        >
          Friends
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'discover' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'discover' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer'
          }}
        >
          Discover
        </button>
      </div>

      {activeTab === 'feed' && <FeedView user={user} />}
      {activeTab === 'friends' && <FriendsView user={user} />}
      {activeTab === 'discover' && <DiscoverView user={user} />}
    </div>
  );
}

function FriendsView({ user }) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadFriends = async () => {
      const friendsRef = collection(db, 'friendships');
      const q = query(friendsRef, where('users', 'array-contains', user.uid));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const friendIds = [];
        const pendingIds = [];

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.status === 'accepted') {
            const friendId = (data.users || []).find(id => id !== user.uid);
            if (friendId) friendIds.push(friendId);
          } else if (data.status === 'pending' && data.requestedBy !== user.uid) {
            pendingIds.push(doc.id);
          }
        });

        // Load friend details
        if (friendIds.length > 0) {
          const usersRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersRef);
          const friendsData = usersSnapshot.docs
            .filter(doc => friendIds.includes(doc.id))
            .map(doc => ({ id: doc.id, ...doc.data() }));
          setFriends(friendsData);
        } else {
          setFriends([]);
        }

        // Load pending requests
        setRequests(pendingIds);
      });

      return unsubscribe;
    };

    loadFriends();
  }, [user]);

  const filteredFriends = friends.filter(friend =>
    (friend.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (friend.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text)'
            }}
          />
        </div>
      </div>

      {requests.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Pending Requests ({requests.length})</h3>
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {filteredFriends.map(friend => (
          <div key={friend.id} style={{
            padding: '15px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {(friend.displayName || friend.email || '?')[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{friend.displayName || 'Anonymous'}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{friend.email}</div>
            </div>
            <button style={{
              padding: '8px 16px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <MessageCircle size={16} />
              Message
            </button>
          </div>
        ))}
      </div>

      {filteredFriends.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <Users size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
          <p>No friends yet. Start by discovering users!</p>
        </div>
      )}
    </div>
  );
}

function DiscoverView({ user }) {
  const [users, setUsers] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      // Load all users except current user and friends
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      // Load friend IDs
      const friendsRef = collection(db, 'friendships');
      const friendsQuery = query(friendsRef, where('users', 'array-contains', user.uid));
      const friendsSnapshot = await getDocs(friendsQuery);
      
      const friendIdsList = [];
      friendsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const friendId = (data.users || []).find(id => id !== user.uid);
        if (friendId) friendIdsList.push(friendId);
      });
      
      setFriendIds(friendIdsList);

      const allUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid && !friendIdsList.includes(u.id));
      
      setUsers(allUsers);
    };

    loadUsers();
  }, [user]);

  const sendFriendRequest = async (targetUserId) => {
    try {
      await addDoc(collection(db, 'friendships'), {
        users: [user.uid, targetUserId],
        status: 'pending',
        requestedBy: user.uid,
        createdAt: new Date()
      });
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    searchQuery === '' ||
    ((u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
     (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text)'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {filteredUsers.map(discoveredUser => (
          <div key={discoveredUser.id} style={{
            padding: '15px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {(discoveredUser.displayName || discoveredUser.email || '?')[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{discoveredUser.displayName || 'Anonymous'}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{discoveredUser.email}</div>
            </div>
            <button
              onClick={() => sendFriendRequest(discoveredUser.id)}
              style={{
                padding: '8px 16px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <UserPlus size={16} />
              Add Friend
            </button>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <Search size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
          <p>No users found</p>
        </div>
      )}
    </div>
  );
}

function FeedView({ user }) {
  const [newPost, setNewPost] = useState('');
  
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        content: newPost,
        likes: {},  // Use object format for likes
        comments: [],
        createdAt: new Date(),
        type: 'status'
      });
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId, likes) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const likesObj = likes || {};
      
      // Handle both array and object formats
      if (Array.isArray(likesObj)) {
        // Convert array to object
        const newLikesObj = {};
        likesObj.forEach(uid => { newLikesObj[uid] = true; });
        
        if (newLikesObj[user.uid]) {
          delete newLikesObj[user.uid];
        } else {
          newLikesObj[user.uid] = true;
        }
        
        await updateDoc(postRef, { likes: newLikesObj });
      } else {
        // Object format
        if (likesObj[user.uid]) {
          delete likesObj[user.uid];
        } else {
          likesObj[user.uid] = true;
        }
        
        await updateDoc(postRef, { likes: likesObj });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    if (!comment.trim()) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          userId: user.uid,
          userName: user.displayName || user.email,
          text: comment,
          createdAt: new Date()
        })
      });
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  return (
    <div>
      <div style={{
        padding: '20px',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What are you reading?"
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleCreatePost}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Send size={16} />
          Post
        </button>
      </div>

      <ActivityFeed 
        currentUser={user} 
        onLike={handleLike}
        onComment={handleComment}
      />
    </div>
  );
}

function ActivityFeed({ currentUser, onLike, onComment }) {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});

  // Helper function to check if user liked a post
  const hasLiked = (post) => {
    if (!post.likes) return false;
    // Handle both array and object formats
    if (Array.isArray(post.likes)) {
      return post.likes.includes(currentUser.uid);
    }
    // Object format: { "userId": true }
    return !!post.likes[currentUser.uid];
  };

  // Helper to get like count
  const getLikeCount = (post) => {
    if (!post.likes) return 0;
    if (Array.isArray(post.likes)) {
      return post.likes.length;
    }
    return Object.keys(post.likes).length;
  };

  useEffect(() => {
    if (!currentUser) return;

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleCommentSubmit = (postId) => {
    const comment = commentText[postId];
    if (comment) {
      onComment(postId, comment);
      setCommentText({ ...commentText, [postId]: '' });
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {posts.map(post => (
        <div key={post.id} style={{
          padding: '20px',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {(post.userName || '?')[0]}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{post.userName || 'Anonymous'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {post.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px', lineHeight: '1.6' }}>
            {post.content}
          </div>

          {post.bookTitle && (
            <div style={{
              padding: '12px',
              background: 'var(--bg)',
              borderRadius: '8px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Book size={20} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 'bold' }}>{post.bookTitle}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {post.bookAuthor}
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '20px',
            paddingTop: '15px',
            borderTop: '1px solid var(--border)'
          }}>
            <button
              onClick={() => onLike(post.id, post.likes)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text)',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                opacity: hasLiked(post) ? 1 : 0.6,
              }}
            >
              <Heart 
                size={18} 
                fill={hasLiked(post) ? 'currentColor' : 'none'} 
              />
              <span>{getLikeCount(post)}</span>
            </button>

            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text)',
              padding: '8px 12px',
              borderRadius: '8px',
              opacity: 0.6
            }}>
              <MessageCircle size={18} />
              <span>{(post.comments || []).length}</span>
            </button>
          </div>

          {post.comments && post.comments.length > 0 && (
            <div style={{
              marginTop: '15px',
              paddingTop: '15px',
              borderTop: '1px solid var(--border)'
            }}>
              {post.comments.map((comment, idx) => (
                <div key={idx} style={{
                  padding: '10px',
                  background: 'var(--bg)',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
                    {comment.userName}
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {comment.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText[post.id] || ''}
              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            />
            <button
              onClick={() => handleCommentSubmit(post.id)}
              style={{
                padding: '8px 16px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-secondary)'
        }}>
          <TrendingUp size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      )}
    </div>
  );
}