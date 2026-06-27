import { useState } from 'react';
import { FiX, FiCreditCard } from 'react-icons/fi';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: '💵', desc: 'Pay with cash' },
  { id: 'card', label: 'Card', icon: '💳', desc: 'Credit/Debit card' },
  { id: 'wallet', label: 'Wallet', icon: '👛', desc: 'Ucab Wallet' },
];

const PaymentModal = ({ isOpen, onClose, onSubmit, fare, loading }) => {
  const [selectedMethod, setSelectedMethod] = useState('cash');

  if (!isOpen) return null;

  const handlePay = () => {
    onSubmit({ method: selectedMethod });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h3>Payment</h3>
          <button onClick={onClose} className="btn btn-icon" style={{ color: 'var(--text-secondary)' }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Select Payment Method</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="glass-card"
                onClick={() => setSelectedMethod(method.id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  border: selectedMethod === method.id
                    ? '2px solid var(--primary)'
                    : '1px solid var(--glass-border)',
                  background: selectedMethod === method.id
                    ? 'rgba(108,99,255,0.1)'
                    : 'var(--glass-bg)',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{method.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{method.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${selectedMethod === method.id ? 'var(--primary)' : 'var(--border-color)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selectedMethod === method.id && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }}></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {fare && (
          <div style={{
            background: 'rgba(108,99,255,0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div className="flex-between">
              <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                ₹{typeof fare === 'number' ? fare.toFixed(2) : (fare.totalFare || fare.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? (
            <><div className="spinner spinner-sm"></div> Processing...</>
          ) : (
            <><FiCreditCard size={18} /> Pay Now</>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
