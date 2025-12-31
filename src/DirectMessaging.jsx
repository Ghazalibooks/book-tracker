// 💬 DIRECT MESSAGING SYSTEM
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';
import { MessageSquare, Send, Search, Image, Gift, BookOpen, X, Check, CheckCheck } from 'lucide-react';
import { SimpleAvatar } from './AvatarBuilder';

export function DirectMessagingView({ user, userData, showToast }) {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadChats();
    loadFriends();
  }, [user.uid]);
  
  const loadChats = async () => {
    try {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid),
        orderBy("lastMessageAt", "desc")
      );
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const chatsData = await Promise.all(
          snapshot.docs.map(async (chatDoc) => {
            const chatData = chatDoc.data();
            const otherUserId = chatData.participants.find(id => id !== user.uid);
            
            // Get other user's data
            const userQuery = query(collection(db, "users"), where("__name__", "==", otherUserId));
            const userSnapshot = await getDocs(userQuery);
            const otherUser = userSnapshot.docs[0]?.data();
            
            return {
              id: chatDoc.id,
              ...chatData,
              otherUser: { id: otherUserId, ...otherUser }
            };
          })
        );
        
        setChats(chatsData);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Load chats error:", error);
    }
  };
  
  const loadFriends = async () => {
    const friendIds = userData?.friends || [];
    if (friendIds.length === 0) return;
    
    const friendsData = await Promise.all(
      friendIds.map(async (friendId) => {
        const q = query(collection(db, "users"), where("__name__", "==", friendId));
        const snapshot = await getDocs(q);
        return { id: friendId, ...snapshot.docs[0]?.data() };
      })
    );
    
    setFriends(friendsData);
  };
  
  const createChat = async (friendId) => {
    try {
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.participants.includes(friendId)
      );
      
      if (existingChat) {
        setActiveChat(existingChat);
        setShowNewChat(false);
        return;
      }
      
      // Create new chat
      const chatRef = await addDoc(collection(db, "chats"), {
        participants: [user.uid, friendId],
        createdAt: new Date().toISOString(),
        lastMessage: "",
        lastMessageAt: new Date().toISOString(),
        unreadCount: { [user.uid]: 0, [friendId]: 0 }
      });
      
      setShowNewChat(false);
      await loadChats();
      
      // Set active chat
      const newChat = chats.find(c => c.id === chatRef.id);
      if (newChat) setActiveChat(newChat);
    } catch (error) {
      console.error("Create chat error:", error);
      showToast("❌ Failed to create chat");
    }
  };
  
  const filteredFriends = friends.filter(friend => 
    friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 0 }}>
      {/* Chats List */}
      <div style={{
        width: 320,
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 12 }}>
            💬 Messages
          </h2>
          <button onClick={() => setShowNewChat(true)} className="btn-main" style={{ width: '100%' }}>
            + New Chat
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', opacity: 0.5 }}>
              <MessageSquare size={48} style={{ margin: '0 auto 12px' }} />
              <p>No messages yet</p>
            </div>
          ) : (
            chats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                currentUserId={user.uid}
                isActive={activeChat?.id === chat.id}
                onClick={() => setActiveChat(chat)}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            currentUser={user}
            currentUserData={userData}
            showToast={showToast}
          />
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            opacity: 0.3
          }}>
            <MessageSquare size={64} style={{ marginBottom: 20 }} />
            <p style={{ fontSize: '18px' }}>Select a chat to start messaging</p>
          </div>
        )}
      </div>
      
      {/* New Chat Modal */}
      {showNewChat && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowNewChat(false)}>
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>New Chat</h2>
              <button onClick={() => setShowNewChat(false)} className="btn-ghost" style={{ width: 40, height: 40, padding: 0 }}>
                <X />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ marginBottom: 20 }}
            />
            
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  onClick={() => createChat(friend.id)}
                  style={{
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    borderRadius: 8,
                    marginBottom: 8,
                    background: 'rgba(255,255,255,0.03)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <SimpleAvatar config={friend.avatar} size={40} />
                  <div>
                    <div style={{ fontWeight: '600' }}>{friend.displayName}</div>
                    <div style={{ fontSize: '13px', opacity: 0.6 }}>Level {friend.level || 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatListItem({ chat, currentUserId, isActive, onClick }) {
  const unreadCount = chat.unreadCount?.[currentUserId] || 0;
  
  return (
    <div
      onClick={onClick}
      style={{
        padding: 16,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
        transition: 'all 0.3s',
        display: 'flex',
        gap: 12,
        alignItems: 'center'
      }}
    >
      <SimpleAvatar config={chat.otherUser?.avatar} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>
            {chat.otherUser?.displayName || 'Unknown'}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.5 }}>
            {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{
          fontSize: '13px',
          opacity: 0.7,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {chat.lastMessage || 'No messages yet'}
        </div>
      </div>
      {unreadCount > 0 && (
        <div style={{
          background: 'var(--accent)',
          borderRadius: '50%',
          minWidth: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          {unreadCount}
        </div>
      )}
    </div>
  );
}

function ChatWindow({ chat, currentUser, currentUserData, showToast }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    loadMessages();
    markAsRead();
  }, [chat.id]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const loadMessages = () => {
    const q = query(
      collection(db, "chats", chat.id, "messages"),
      orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    });
    
    return unsubscribe;
  };
  
  const markAsRead = async () => {
    try {
      await updateDoc(doc(db, "chats", chat.id), {
        [`unreadCount.${currentUser.uid}`]: 0
      });
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };
  
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      await addDoc(collection(db, "chats", chat.id, "messages"), {
        text: newMessage,
        senderId: currentUser.uid,
        createdAt: new Date().toISOString(),
        read: false
      });
      
      // Update last message
      await updateDoc(doc(db, "chats", chat.id), {
        lastMessage: newMessage,
        lastMessageAt: new Date().toISOString(),
        [`unreadCount.${chat.otherUser.id}`]: (chat.unreadCount?.[chat.otherUser.id] || 0) + 1
      });
      
      setNewMessage('');
    } catch (error) {
      console.error("Send message error:", error);
      showToast("❌ Failed to send message");
    }
    setSending(false);
  };
  
  return (
    <>
      {/* Header */}
      <div style={{
        padding: 20,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <SimpleAvatar config={chat.otherUser?.avatar} size={40} />
        <div>
          <div style={{ fontWeight: '600', fontSize: '16px' }}>
            {chat.otherUser?.displayName}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.6 }}>
            Level {chat.otherUser?.level || 1}
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUser.uid}
            showAvatar={index === 0 || messages[index - 1].senderId !== message.senderId}
            senderAvatar={message.senderId === currentUser.uid ? currentUserData.avatar : chat.otherUser.avatar}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={sendMessage} style={{
        padding: 20,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: 12
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-main" disabled={!newMessage.trim() || sending}>
          <Send size={18} />
        </button>
      </form>
    </>
  );
}

function MessageBubble({ message, isOwn, showAvatar, senderAvatar }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      gap: 8
    }}>
      {!isOwn && showAvatar && <SimpleAvatar config={senderAvatar} size={32} />}
      {!isOwn && !showAvatar && <div style={{ width: 32 }} />}
      
      <div style={{
        maxWidth: '60%',
        padding: '12px 16px',
        borderRadius: 16,
        background: isOwn ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
        wordWrap: 'break-word'
      }}>
        <div style={{ fontSize: '14px', marginBottom: 4 }}>
          {message.text}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.6, textAlign: 'right' }}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isOwn && showAvatar && <SimpleAvatar config={senderAvatar} size={32} />}
      {isOwn && !showAvatar && <div style={{ width: 32 }} />}
    </div>
  );
}

export default DirectMessagingView;
