import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiTruck, FiAlertCircle, FiCheckCircle, FiArrowRight, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    role: 'user',
    vehicleType: 'sedan', vehicleName: '', vehicleNumber: '',
    vehicleColor: '', licenseNumber: '',
  });

  const totalSteps = formData.role === 'driver' ? 3 : 2;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.phone.trim()) return 'Phone number is required';
    return null;
  };

  const validateStep3 = () => {
    if (!formData.vehicleName.trim()) return 'Vehicle name is required';
    if (!formData.vehicleNumber.trim()) return 'Vehicle number is required';
    if (!formData.vehicleColor.trim()) return 'Vehicle color is required';
    if (!formData.licenseNumber.trim()) return 'License number is required';
    return null;
  };

  const nextStep = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (formData.role === 'driver') {
      const err = validateStep3();
      if (err) { setError(err); return; }
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };
      if (formData.role === 'driver') {
        payload.vehicle = {
          type: formData.vehicleType,
          name: formData.vehicleName,
          number: formData.vehicleNumber,
          color: formData.vehicleColor,
        };
        payload.licenseNumber = formData.licenseNumber;
      }
      await register(payload);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errMsg = err.response?.data?.error || 
                     (err.response?.data?.errors && err.response.data.errors[0]?.message) || 
                     err.response?.data?.message || 
                     'Registration failed';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '90px' }}>
      <div className="floating-shapes" style={{ position: 'fixed', inset: 0, zIndex: 0 }}></div>
      <div className="glass-card animate-slide-up" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ fontFamily: 'Outfit', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Step {step} of {totalSteps}</p>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <FiAlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <FiCheckCircle size={16} /> {success}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe" value={formData.name} onChange={(e) => updateField('name', e.target.value)} autoComplete="off" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="john@example.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} autoComplete="new-email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={(e) => updateField('password', e.target.value)} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" placeholder="+91 9876543210" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} autoComplete="off" />
            </div>
            <button className="btn btn-primary btn-lg w-full" onClick={nextStep}>
              Next <FiArrowRight />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>I want to...</h3>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div
                className={`role-card ${formData.role === 'user' ? 'selected' : ''}`}
                onClick={() => updateField('role', 'user')}
              >
                <div className="role-card-icon">🚕</div>
                <h4>Ride</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Book rides & travel comfortably</p>
              </div>
              <div
                className={`role-card ${formData.role === 'driver' ? 'selected' : ''}`}
                onClick={() => updateField('role', 'driver')}
              >
                <div className="role-card-icon">🚗</div>
                <h4>Drive</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Earn money by driving</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={prevStep} style={{ flex: 1 }}>
                <FiChevronLeft /> Back
              </button>
              {formData.role === 'driver' ? (
                <button className="btn btn-primary" onClick={nextStep} style={{ flex: 2 }}>
                  Next <FiArrowRight />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
                  {loading ? <div className="spinner spinner-sm"></div> : 'Create Account'}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select className="form-input" value={formData.vehicleType} onChange={(e) => updateField('vehicleType', e.target.value)}>
                <option value="auto">Auto</option>
                <option value="bike">Bike</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Name</label>
              <input className="form-input" placeholder="e.g. Maruti Swift" value={formData.vehicleName} onChange={(e) => updateField('vehicleName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Number</label>
              <input className="form-input" placeholder="e.g. KA-01-AB-1234" value={formData.vehicleNumber} onChange={(e) => updateField('vehicleNumber', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Color</label>
              <input className="form-input" placeholder="e.g. White" value={formData.vehicleColor} onChange={(e) => updateField('vehicleColor', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">License Number</label>
              <input className="form-input" placeholder="e.g. DL-1234567890" value={formData.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={prevStep} style={{ flex: 1 }}>
                <FiChevronLeft /> Back
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
                {loading ? <div className="spinner spinner-sm"></div> : 'Create Account'}
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
