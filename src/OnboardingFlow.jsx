// 🎓 ONBOARDING FLOW SYSTEM
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ChevronRight, ChevronLeft, Check, Sparkles, BookOpen, Target, Palette, Gift } from 'lucide-react';
import { SimpleAvatar } from './AvatarBuilder';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Bookyo! 📚',
    subtitle: 'Your personal reading companion',
    icon: '🎉'
  },
  {
    id: 'avatar',
    title: 'Create Your Avatar',
    subtitle: 'Customize your reading identity',
    icon: '🎨'
  },
  {
    id: 'goals',
    title: 'Set Your Goals',
    subtitle: 'How much do you want to read?',
    icon: '🎯'
  },
  {
    id: 'features',
    title: 'Discover Features',
    subtitle: 'Everything you can do on Bookyo',
    icon: '✨'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    subtitle: 'Start your reading journey',
    icon: '🚀'
  }
];

export function OnboardingFlow({ user, userData, onComplete, showToast }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    avatar: {
      skin: 'light',
      hairStyle: 'short',
      hairColor: 'black',
      eyeShape: 'round',
      eyeColor: 'brown',
      glasses: 'none',
      hat: 'none',
      clothing: 'tshirt',
      background: 'library'
    },
    goals: {
      daily: 30,
      weekly: 200,
      monthly: 1000,
      yearlyBooks: 12
    },
    theme: 'mystic'
  });
  
  const step = ONBOARDING_STEPS[currentStep];
  
  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const completeOnboarding = async () => {
    try {
      // Save onboarding data
      await setDoc(doc(db, "users", user.uid), {
        ...onboardingData,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
        coins: 500, // Welcome bonus!
        inventory: ['frame_gold'], // Give a free gold frame!
      }, { merge: true });
      
      showToast("🎉 Welcome to Bookyo! You received 500 coins and a Gold Frame!");
      onComplete();
    } catch (error) {
      console.error("Complete onboarding error:", error);
      showToast("❌ Failed to complete onboarding");
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--bg-main)',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: 40,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            {ONBOARDING_STEPS.map((s, i) => (
              <div key={s.id} style={{
                width: `${100 / ONBOARDING_STEPS.length}%`,
                height: 4,
                background: i <= currentStep ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                margin: '0 2px',
                transition: 'all 0.3s'
              }} />
            ))}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.6, textAlign: 'center' }}>
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>
        </div>
        
        {/* Content */}
        <div className="cozy-card" style={{ padding: 50, textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: '80px', marginBottom: 20 }}>{step.icon}</div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: 12 }}>{step.title}</h1>
          <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: 40 }}>{step.subtitle}</p>
          
          {/* Step Content */}
          {step.id === 'welcome' && <WelcomeStep />}
          {step.id === 'avatar' && <AvatarStep onboardingData={onboardingData} setOnboardingData={setOnboardingData} />}
          {step.id === 'goals' && <GoalsStep onboardingData={onboardingData} setOnboardingData={setOnboardingData} />}
          {step.id === 'features' && <FeaturesStep />}
          {step.id === 'complete' && <CompleteStep userData={userData} />}
        </div>
        
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <button
            onClick={prevStep}
            className="btn-ghost"
            style={{ visibility: currentStep > 0 ? 'visible' : 'hidden', padding: '12px 24px' }}
          >
            <ChevronLeft size={20} /> Back
          </button>
          
          {currentStep < ONBOARDING_STEPS.length - 1 ? (
            <button onClick={nextStep} className="btn-main" style={{ padding: '12px 32px' }}>
              Continue <ChevronRight size={20} />
            </button>
          ) : (
            <button onClick={completeOnboarding} className="btn-main" style={{ padding: '12px 32px', background: 'var(--success)' }}>
              <Check size={20} /> Start Reading!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 16 }}>What is Bookyo?</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
          <div style={{ fontSize: '32px', flexShrink: 0 }}>📚</div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: 4 }}>Track Your Reading</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>Log books, track progress, and see your statistics</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
          <div style={{ fontSize: '32px', flexShrink: 0 }}>⏰</div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: 4 }}>Reading Timer</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>Time your reading sessions and earn rewards</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
          <div style={{ fontSize: '32px', flexShrink: 0 }}>🎯</div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: 4 }}>Goals & Quests</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>Complete daily challenges and reach milestones</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
          <div style={{ fontSize: '32px', flexShrink: 0 }}>👥</div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: 4 }}>Social Features</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>Connect with friends and share your journey</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarStep({ onboardingData, setOnboardingData }) {
  const avatarOptions = {
    skin: [
      { value: 'light', label: 'Light', emoji: '👨' },
      { value: 'medium', label: 'Medium', emoji: '👨🏽' },
      { value: 'dark', label: 'Dark', emoji: '👨🏿' }
    ],
    hairStyle: [
      { value: 'short', label: 'Short', icon: '✂️' },
      { value: 'long', label: 'Long', icon: '💇' },
      { value: 'curly', label: 'Curly', icon: '🦱' }
    ],
    hairColor: [
      { value: 'black', label: 'Black', color: '#000000' },
      { value: 'brown', label: 'Brown', color: '#8B4513' },
      { value: 'blonde', label: 'Blonde', color: '#FFD700' },
      { value: 'red', label: 'Red', color: '#FF4444' }
    ]
  };
  
  return (
    <div>
      {/* Avatar Preview */}
      <div style={{ marginBottom: 30 }}>
        <SimpleAvatar config={onboardingData.avatar} size={120} />
      </div>
      
      {/* Customization */}
      <div style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: 8 }}>
            Skin Tone
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {avatarOptions.skin.map(option => (
              <button
                key={option.value}
                onClick={() => setOnboardingData({
                  ...onboardingData,
                  avatar: { ...onboardingData.avatar, skin: option.value }
                })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: onboardingData.avatar.skin === option.value ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: 12,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '24px'
                }}
              >
                {option.emoji}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: 8 }}>
            Hair Style
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {avatarOptions.hairStyle.map(option => (
              <button
                key={option.value}
                onClick={() => setOnboardingData({
                  ...onboardingData,
                  avatar: { ...onboardingData.avatar, hairStyle: option.value }
                })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: onboardingData.avatar.hairStyle === option.value ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: 12,
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: 4 }}>{option.icon}</div>
                <div style={{ fontSize: '12px' }}>{option.label}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: 8 }}>
            Hair Color
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {avatarOptions.hairColor.map(option => (
              <button
                key={option.value}
                onClick={() => setOnboardingData({
                  ...onboardingData,
                  avatar: { ...onboardingData.avatar, hairColor: option.value }
                })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: onboardingData.avatar.hairColor === option.value ? 'var(--accent)' : option.color,
                  border: onboardingData.avatar.hairColor === option.value ? '3px solid var(--accent)' : 'none',
                  borderRadius: 12,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <p style={{ fontSize: '13px', opacity: 0.6, marginTop: 20 }}>
        You can customize more later in Settings!
      </p>
    </div>
  );
}

function GoalsStep({ onboardingData, setOnboardingData }) {
  return (
    <div style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
      <p style={{ fontSize: '15px', opacity: 0.8, marginBottom: 24, textAlign: 'center' }}>
        Set your reading goals to stay motivated!
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: 8 }}>
            📅 Daily (minutes)
          </label>
          <input
            type="number"
            value={onboardingData.goals.daily}
            onChange={(e) => setOnboardingData({
              ...onboardingData,
              goals: { ...onboardingData.goals, daily: parseInt(e.target.value) || 0 }
            })}
            className="input"
            min="0"
          />
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: 4 }}>
            Recommended: 30 minutes
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: 8 }}>
            📆 Weekly (minutes)
          </label>
          <input
            type="number"
            value={onboardingData.goals.weekly}
            onChange={(e) => setOnboardingData({
              ...onboardingData,
              goals: { ...onboardingData.goals, weekly: parseInt(e.target.value) || 0 }
            })}
            className="input"
            min="0"
          />
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: 4 }}>
            Recommended: 200 minutes
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: 8 }}>
            📖 Monthly (pages)
          </label>
          <input
            type="number"
            value={onboardingData.goals.monthly}
            onChange={(e) => setOnboardingData({
              ...onboardingData,
              goals: { ...onboardingData.goals, monthly: parseInt(e.target.value) || 0 }
            })}
            className="input"
            min="0"
          />
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: 4 }}>
            Recommended: 1000 pages
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: 8 }}>
            📚 Yearly (books)
          </label>
          <input
            type="number"
            value={onboardingData.goals.yearlyBooks}
            onChange={(e) => setOnboardingData({
              ...onboardingData,
              goals: { ...onboardingData.goals, yearlyBooks: parseInt(e.target.value) || 0 }
            })}
            className="input"
            min="0"
          />
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: 4 }}>
            Recommended: 12 books
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesStep() {
  const features = [
    { icon: '📚', title: 'Library', desc: 'Organize your books and track progress' },
    { icon: '⏰', title: 'Timer', desc: 'Track reading time and earn XP & coins' },
    { icon: '📊', title: 'Statistics', desc: 'View your reading analytics' },
    { icon: '🎯', title: 'Quests', desc: 'Complete daily, weekly challenges' },
    { icon: '🛒', title: 'Shop', desc: '30+ items to customize your profile' },
    { icon: '👥', title: 'Social', desc: 'Follow friends and share achievements' },
    { icon: '🎵', title: 'Music', desc: 'Listen to ambient music while reading' },
    { icon: '⚙️', title: 'Settings', desc: 'Customize every aspect of your experience' }
  ];
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 600, margin: '0 auto' }}>
      {features.map((feature, i) => (
        <div key={i} className="cozy-card" style={{ padding: 20, background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '32px', marginBottom: 8 }}>{feature.icon}</div>
          <div style={{ fontWeight: '600', marginBottom: 4 }}>{feature.title}</div>
          <div style={{ fontSize: '13px', opacity: 0.7 }}>{feature.desc}</div>
        </div>
      ))}
    </div>
  );
}

function CompleteStep({ userData }) {
  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontSize: '120px', marginBottom: 20 }}>🎁</div>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 12 }}>
          Welcome Bonus!
        </h3>
        <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: 24 }}>
          You've received:
        </p>
        
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 30 }}>
          <div className="cozy-card" style={{ padding: 20, minWidth: 150, background: 'var(--grad-main)' }}>
            <div style={{ fontSize: '36px', marginBottom: 8 }}>💰</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 4 }}>500</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Coins</div>
          </div>
          
          <div className="cozy-card" style={{ padding: 20, minWidth: 150, background: 'var(--grad-main)' }}>
            <div style={{ fontSize: '36px', marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 4 }}>Gold Frame</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Premium Item</div>
          </div>
        </div>
      </div>
      
      <p style={{ fontSize: '15px', opacity: 0.8 }}>
        Ready to start your reading journey? Click below to explore Bookyo!
      </p>
    </div>
  );
}

export default OnboardingFlow;