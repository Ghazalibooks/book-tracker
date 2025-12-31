// 📱 SOCIAL SHARING SYSTEM
import { useState, useEffect } from 'react';
import { Share2, Instagram, MessageCircle, Twitter, Copy, Gift, TrendingUp, Award, BookOpen, Check } from 'lucide-react';
import { doc, setDoc, getDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

// SHARE TEMPLATES
const SHARE_TEMPLATES = {
  bookFinished: (book, userData) => ({
    title: `📚 Just finished reading!`,
    text: `I just finished "${book.title}" by ${book.author} on Bookyo! 🎉\n\nJoin me on my reading journey!`,
    image: book.coverUrl,
    hashtags: ['Bookyo', 'Reading', 'Books']
  }),
  
  achievement: (achievement, userData) => ({
    title: `🏆 Achievement Unlocked!`,
    text: `I just unlocked "${achievement}" on Bookyo! 🎉\n\nLevel ${userData.level} • ${userData.xp} XP`,
    hashtags: ['Bookyo', 'Achievement', 'Reading']
  }),
  
  milestone: (milestone, userData) => ({
    title: `⭐ Milestone Reached!`,
    text: `${milestone} on Bookyo! 📚\n\nJoin me and start your reading journey!`,
    hashtags: ['Bookyo', 'Reading', 'Milestone']
  }),
  
  challenge: (challenge) => ({
    title: `🎯 Reading Challenge!`,
    text: `Join me in the ${challenge.name}!\n\nGoal: ${challenge.goal}\nReward: ${challenge.reward} coins 💰`,
    hashtags: ['Bookyo', 'ReadingChallenge']
  }),
  
  referral: (userData, referralCode) => ({
    title: `📚 Join Bookyo!`,
    text: `Hey! I'm using Bookyo to track my reading and it's amazing! 🎉\n\nUse my code: ${referralCode}\nGet 200 bonus coins! 💰\n\nJoin me: bookyo.app/ref/${referralCode}`,
    hashtags: ['Bookyo', 'Reading']
  })
};

export function SocialSharingModal({ isOpen, onClose, shareType, shareData, user, userData, showToast }) {
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  
  useEffect(() => {
    if (shareType === 'referral') {
      loadOrCreateReferralCode();
    }
  }, [shareType]);
  
  const loadOrCreateReferralCode = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let code = userDoc.data()?.referralCode;
      
      if (!code) {
        // Generate referral code
        code = generateReferralCode(userData.displayName);
        await setDoc(doc(db, "users", user.uid), { referralCode: code }, { merge: true });
      }
      
      setReferralCode(code);
    } catch (error) {
      console.error("Referral code error:", error);
    }
  };
  
  const generateReferralCode = (name) => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanName}${random}`;
  };
  
  const getShareContent = () => {
    switch (shareType) {
      case 'bookFinished':
        return SHARE_TEMPLATES.bookFinished(shareData, userData);
      case 'achievement':
        return SHARE_TEMPLATES.achievement(shareData, userData);
      case 'milestone':
        return SHARE_TEMPLATES.milestone(shareData, userData);
      case 'challenge':
        return SHARE_TEMPLATES.challenge(shareData);
      case 'referral':
        return SHARE_TEMPLATES.referral(userData, referralCode);
      default:
        return { title: 'Share on Bookyo', text: 'Check out my reading journey!' };
    }
  };
  
  const shareContent = getShareContent();
  
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareContent.title}\n\n${shareContent.text}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    trackShare('whatsapp');
  };
  
  const shareToInstagram = () => {
    // Instagram doesn't have direct sharing API, so we copy and guide user
    copyToClipboard();
    showToast("✅ Text copied! Open Instagram and paste in your story!");
    trackShare('instagram');
  };
  
  const shareToTwitter = () => {
    const text = encodeURIComponent(shareContent.text);
    const hashtags = shareContent.hashtags.join(',');
    window.open(`https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`, '_blank');
    trackShare('twitter');
  };
  
  const copyToClipboard = () => {
    const fullText = `${shareContent.title}\n\n${shareContent.text}\n\n${shareContent.hashtags.map(h => '#' + h).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast("✅ Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const trackShare = async (platform) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        shares: increment(1),
        [`shares_${platform}`]: increment(1)
      }, { merge: true });
      
      // Reward for sharing
      if (shareType === 'referral') {
        await setDoc(doc(db, "users", user.uid), {
          coins: increment(10)
        }, { merge: true });
        showToast("✅ +10 coins for sharing!");
      }
    } catch (error) {
      console.error("Track share error:", error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <Share2 size={24} style={{ display: 'inline', marginRight: 8 }} />
            Share Your Achievement
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}>
            <X />
          </button>
        </div>
        
        {/* Preview */}
        <div className="cozy-card" style={{ padding: 20, background: 'var(--grad-main)', marginBottom: 24 }}>
          <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: 12 }}>
            {shareType === 'bookFinished' && '📚'}
            {shareType === 'achievement' && '🏆'}
            {shareType === 'milestone' && '⭐'}
            {shareType === 'challenge' && '🎯'}
            {shareType === 'referral' && '🎁'}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
            {shareContent.title}
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.9, textAlign: 'center', whiteSpace: 'pre-line' }}>
            {shareContent.text}
          </p>
          {shareData?.coverUrl && (
            <img src={shareData.coverUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 12, marginTop: 16 }} />
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {shareContent.hashtags.map(tag => (
              <span key={tag} style={{ fontSize: '12px', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 12 }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Share Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          <button onClick={shareToWhatsApp} className="btn-main" style={{ background: '#25D366' }}>
            <MessageCircle size={20} /> WhatsApp
          </button>
          
          <button onClick={shareToInstagram} className="btn-main" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
            <Instagram size={20} /> Instagram
          </button>
          
          <button onClick={shareToTwitter} className="btn-main" style={{ background: '#1DA1F2' }}>
            <Twitter size={20} /> Twitter
          </button>
          
          <button onClick={copyToClipboard} className="btn-main" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
        
        {/* Referral Info */}
        {shareType === 'referral' && referralCode && (
          <div className="cozy-card" style={{ padding: 20, background: 'rgba(255, 215, 0, 0.1)', border: '2px solid #FFD700' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gift size={20} style={{ color: '#FFD700' }} />
              Your Referral Code
            </h4>
            <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, marginBottom: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: 4, color: 'var(--accent)' }}>
                {referralCode}
              </div>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.8, textAlign: 'center' }}>
              Friends who use your code get 200 bonus coins! 💰<br />
              You get 50 coins for each referral! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Referral System Component
export function ReferralView({ user, userData, showToast }) {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({ count: 0, earned: 0 });
  const [referrals, setReferrals] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  
  useEffect(() => {
    loadReferralData();
  }, [user.uid]);
  
  const loadReferralData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const data = userDoc.data();
      
      let code = data?.referralCode;
      if (!code) {
        code = generateReferralCode(userData.displayName);
        await setDoc(doc(db, "users", user.uid), { referralCode: code }, { merge: true });
      }
      
      setReferralCode(code);
      setReferralStats({
        count: data?.referralCount || 0,
        earned: data?.referralEarned || 0
      });
      setReferrals(data?.referredUsers || []);
    } catch (error) {
      console.error("Load referral error:", error);
    }
  };
  
  const generateReferralCode = (name) => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanName}${random}`;
  };
  
  const copyReferralLink = () => {
    const link = `https://bookyo.app/ref/${referralCode}`;
    navigator.clipboard.writeText(link);
    showToast("✅ Referral link copied!");
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎁 Referral Program</h1>
        <p className="page-subtitle">Invite friends and earn rewards!</p>
      </div>
      
      {/* Stats */}
      <div className="desktop-grid-3" style={{ marginBottom: 30 }}>
        <div className="stat-card">
          <div className="stat-value">{referralStats.count}</div>
          <div className="stat-label">Friends Invited</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{referralStats.earned}</div>
          <div className="stat-label">Coins Earned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{referralStats.count * 200}</div>
          <div className="stat-label">Friends' Bonus</div>
        </div>
      </div>
      
      {/* Referral Code Card */}
      <div className="cozy-card" style={{ padding: 30, background: 'var(--grad-main)', marginBottom: 30 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '48px', marginBottom: 12 }}>🎁</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 8 }}>Your Referral Code</h2>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>Share this code with friends!</p>
        </div>
        
        <div style={{ padding: 24, background: 'var(--bg-card)', borderRadius: 16, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '42px', fontWeight: 'bold', letterSpacing: 6, color: 'var(--accent)', marginBottom: 8 }}>
            {referralCode}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.6 }}>
            bookyo.app/ref/{referralCode}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={copyReferralLink} className="btn-main" style={{ flex: 1 }}>
            <Copy size={18} /> Copy Link
          </button>
          <button onClick={() => setShowShareModal(true)} className="btn-main" style={{ flex: 1 }}>
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="cozy-card" style={{ padding: 24, marginBottom: 30 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>📖 How It Works</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              1
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: 4 }}>Share Your Code</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Send your referral code to friends</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              2
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: 4 }}>They Sign Up</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Friends use your code when creating their account</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
              3
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: 4 }}>Everyone Wins! 🎉</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>They get 200 coins, you get 50 coins!</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Referral List */}
      {referrals.length > 0 && (
        <div className="cozy-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>👥 Your Referrals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {referrals.map((ref, i) => (
              <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{ref.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>{new Date(ref.joinedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: '20px' }}>✅</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showShareModal && (
        <SocialSharingModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareType="referral"
          shareData={{}}
          user={user}
          userData={userData}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// Quick Share Button (for use in other components)
export function QuickShareButton({ shareType, shareData, user, userData, showToast, children }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Share2 size={16} />
        {children || 'Share'}
      </button>
      
      {showModal && (
        <SocialSharingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          shareType={shareType}
          shareData={shareData}
          user={user}
          userData={userData}
          showToast={showToast}
        />
      )}
    </>
  );
}

export default SocialSharingModal;