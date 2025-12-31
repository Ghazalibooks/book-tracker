// 👑 PREMIUM VIEW - Subscription & Billing
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Crown, Check, X, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { isPremium, PremiumStatus, PremiumFeaturesList, PREMIUM_TIERS } from './PremiumSystem';

export function PremiumView({ user, userData, showToast }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showCheckout, setShowCheckout] = useState(false);
  const premium = isPremium(userData);
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👑 Premium</h1>
        <p className="page-subtitle">Unlock the full Bookyo experience</p>
      </div>
      
      {/* Current Status */}
      <PremiumStatus userData={userData} />
      
      {!premium && (
        <>
          {/* Pricing Cards */}
          <div className="desktop-grid-2" style={{ marginTop: 30, marginBottom: 30 }}>
            {/* Monthly */}
            <div className="cozy-card" style={{
              padding: 32,
              border: billingCycle === 'monthly' ? '3px solid var(--accent)' : 'none',
              cursor: 'pointer'
            }} onClick={() => setBillingCycle('monthly')}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 8 }}>Monthly</h3>
                <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: 4 }}>
                  $2.99
                  <span style={{ fontSize: '18px', opacity: 0.6 }}>/month</span>
                </div>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>Billed monthly</p>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setShowCheckout(true); }}
                className="btn-main" 
                style={{ width: '100%', background: 'var(--accent)' }}
              >
                <Crown size={18} /> Start Free Trial
              </button>
            </div>
            
            {/* Yearly */}
            <div className="cozy-card" style={{
              padding: 32,
              border: billingCycle === 'yearly' ? '3px solid var(--accent)' : 'none',
              cursor: 'pointer',
              position: 'relative'
            }} onClick={() => setBillingCycle('yearly')}>
              <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'var(--success)',
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                SAVE 17%
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 8 }}>Yearly</h3>
                <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: 4 }}>
                  $29.99
                  <span style={{ fontSize: '18px', opacity: 0.6 }}>/year</span>
                </div>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>$2.50/month</p>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setShowCheckout(true); }}
                className="btn-main" 
                style={{ width: '100%', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#000' }}
              >
                <Crown size={18} /> Start Free Trial
              </button>
            </div>
          </div>
          
          {/* Features List */}
          <div className="cozy-card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
              Everything in Premium
            </h3>
            <PremiumFeaturesList />
          </div>
          
          {/* FAQ */}
          <div className="cozy-card" style={{ padding: 32, marginTop: 30 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 24 }}>
              Frequently Asked Questions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FAQItem 
                question="Is there a free trial?"
                answer="Yes! You get 7 days free when you start your Premium subscription. Cancel anytime during the trial period."
              />
              <FAQItem 
                question="Can I cancel anytime?"
                answer="Absolutely! You can cancel your subscription at any time. You'll keep Premium benefits until the end of your billing period."
              />
              <FAQItem 
                question="What payment methods do you accept?"
                answer="We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through Stripe."
              />
              <FAQItem 
                question="Will my data be safe?"
                answer="Yes! All your reading data is automatically backed up and synced across devices with Premium."
              />
            </div>
          </div>
        </>
      )}
      
      {premium && (
        <>
          {/* Billing Details */}
          <div className="cozy-card" style={{ padding: 32, marginTop: 30 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 24 }}>
              <CreditCard size={20} style={{ display: 'inline', marginRight: 8 }} />
              Billing Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="cozy-card" style={{ padding: 16, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ opacity: 0.7 }}>Plan</span>
                  <span style={{ fontWeight: 'bold' }}>Premium {userData?.premium?.billingCycle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ opacity: 0.7 }}>Next billing date</span>
                  <span>{userData?.premium?.expiresAt ? new Date(userData.premium.expiresAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Amount</span>
                  <span style={{ fontWeight: 'bold' }}>
                    ${userData?.premium?.billingCycle === 'yearly' ? '29.99' : '2.99'}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-ghost" style={{ flex: 1 }}>
                  Update Payment Method
                </button>
                <button className="btn-ghost" style={{ flex: 1, color: '#FF6B6B' }}>
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
          
          {/* Premium Benefits */}
          <div className="cozy-card" style={{ padding: 32, marginTop: 30 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 24 }}>
              Your Premium Benefits
            </h3>
            <PremiumFeaturesList />
          </div>
        </>
      )}
      
      {showCheckout && (
        <StripeCheckoutModal
          billingCycle={billingCycle}
          onClose={() => setShowCheckout(false)}
          user={user}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: 16,
          background: 'rgba(255,255,255,0.03)',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '16px',
          fontWeight: '600',
          color: 'inherit'
        }}
      >
        {question}
        <span style={{ fontSize: '20px' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div style={{
          padding: '16px 16px 0',
          fontSize: '14px',
          opacity: 0.8,
          lineHeight: 1.6
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}

function StripeCheckoutModal({ billingCycle, onClose, user, showToast }) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  
  const price = billingCycle === 'yearly' ? 29.99 : 2.99;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // DEMO MODE - In production, use Stripe API
      // This simulates a successful payment
      
      // Create subscription in Firestore
      const expiresAt = new Date();
      if (billingCycle === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }
      
      await updateDoc(doc(db, "users", user.uid), {
        premium: {
          status: 'active',
          billingCycle: billingCycle,
          startedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days trial
        }
      });
      
      showToast("🎉 Welcome to Premium! Your 7-day free trial has started!");
      onClose();
      
      // Reload page to update premium status
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Checkout error:", error);
      showToast("❌ Payment failed. Please try again.");
    }
    
    setLoading(false);
  };
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <Crown size={24} style={{ display: 'inline', marginRight: 8 }} />
            Upgrade to Premium
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ width: 40, height: 40, padding: 0 }}>
            <X />
          </button>
        </div>
        
        {/* Trial Info */}
        <div className="cozy-card" style={{ padding: 16, marginBottom: 24, background: 'var(--success)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>7-Day Free Trial</div>
              <div style={{ fontSize: '13px' }}>
                You won't be charged until {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Cancel anytime.
              </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Plan Summary */}
          <div className="cozy-card" style={{ padding: 20, marginBottom: 24, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span>Plan</span>
              <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>Premium {billingCycle}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span>Price</span>
              <span style={{ fontWeight: 'bold' }}>${price}/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                <span style={{ fontWeight: 'bold' }}>Total due today</span>
                <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>$0.00</span>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 4 }}>
                Free for 7 days, then ${price}
              </div>
            </div>
          </div>
          
          {/* Payment Form */}
          <label style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>Card Number</label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="input"
            style={{ marginBottom: 16 }}
            required
            maxLength="19"
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>Expiry</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="input"
                required
                maxLength="5"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>CVC</label>
              <input
                type="text"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="input"
                required
                maxLength="4"
              />
            </div>
          </div>
          
          <button type="submit" className="btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px' }} disabled={loading}>
            {loading ? (
              <div className="spinner" style={{ width: 20, height: 20, margin: '0 auto' }}></div>
            ) : (
              <>
                <CreditCard size={18} /> Start Free Trial
              </>
            )}
          </button>
          
          <p style={{ fontSize: '12px', opacity: 0.6, textAlign: 'center', marginTop: 16 }}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Secured by Stripe.
          </p>
        </form>
      </div>
    </div>
  );
}

export default PremiumView;
