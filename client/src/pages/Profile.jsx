import { useState } from 'react';
import { FiEdit, FiLock, FiCreditCard, FiLogOut, FiSave, FiChevronRight } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { authService, paymentService } from '../services/api';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [walletBalance, setWalletBalance] = useState(500);
  const [toppingUp, setToppingUp] = useState(false);
  const [message, setMessage] = useState('');

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, phone });
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword) { setPasswordError('Current password required'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { setPasswordError('Passwords do not match'); return; }
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPassword(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleTopUp = async () => {
    setToppingUp(true);
    try {
      await paymentService.topUpWallet(500);
      setWalletBalance(prev => prev + 500);
    } catch (err) {
      // simulate
      setWalletBalance(prev => prev + 500);
    } finally {
      setToppingUp(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '90px', maxWidth: '700px' }}>
      {/* Avatar Section */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="profile-avatar">{getInitials()}</div>
        <h2 style={{ fontFamily: 'Outfit' }}>{user?.name}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
        <span className="badge badge-primary" style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
          {user?.role}
        </span>
      </div>

      {message && (
        <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>
          {message}
        </div>
      )}

      {/* Edit Form */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3>Personal Info</h3>
          <button className="btn btn-sm btn-secondary" onClick={() => setEditing(!editing)}>
            <FiEdit size={14} /> {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} />
        </div>

        {editing && (
          <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>
            {saving ? <div className="spinner spinner-sm"></div> : <><FiSave size={16} /> Save Changes</>}
          </button>
        )}
      </div>

      {/* Change Password */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
          <h3><FiLock size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Change Password</h3>
          <FiChevronRight size={18} style={{ transform: showPassword ? 'rotate(90deg)' : 'none', transition: 'var(--transition-base)' }} />
        </div>

        {showPassword && (
          <div style={{ marginTop: '1rem' }}>
            {passwordError && <div style={{ color: 'var(--error)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{passwordError}</div>}
            {passwordSuccess && <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{passwordSuccess}</div>}
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handlePasswordChange}>Update Password</button>
          </div>
        )}
      </div>

      {/* Wallet */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}><FaRupeeSign size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Wallet</h3>
        <div className="flex-between">
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Balance</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit' }}>₹{walletBalance}</div>
          </div>
          <button className="btn btn-success" onClick={handleTopUp} disabled={toppingUp}>
            {toppingUp ? <div className="spinner spinner-sm"></div> : '+ Add ₹500'}
          </button>
        </div>
      </div>

      {/* Saved Payment Methods */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}><FiCreditCard size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Payment Methods</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>💳</span>
          <div>
            <div style={{ fontWeight: 500 }}>•••• •••• •••• 4242</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expires 12/26</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm">+ Add Payment Method</button>
      </div>

      {/* Logout */}
      <button className="btn btn-danger w-full" onClick={logout} style={{ marginBottom: '2rem' }}>
        <FiLogOut size={16} /> Logout
      </button>
    </div>
  );
};

export default Profile;
