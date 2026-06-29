import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiChevronLeft, FiUser, FiPhone, FiCheckCircle, FiNavigation } from 'react-icons/fi';
import MapView from '../components/MapView';
import FareEstimate from '../components/FareEstimate';
import { rideService, driverService } from '../services/api';

const DriverRideView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await rideService.getById(id);
        setRide(res.data.ride || res.data);
      } catch (err) {
        console.error('Error fetching ride:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);
    setOtpError('');
    if (value && index < 3) {
      const next = document.getElementById(`driver-otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const verifyOtp = async () => {
    const otp = otpValue.join('');
    if (otp.length !== 4) { setOtpError('Enter complete OTP'); return; }
    try {
      await driverService.verifyOtp(id, otp);
      setOtpVerified(true);
      setRide(prev => ({ ...prev, status: 'in-progress' }));
    } catch (err) {
      setOtpError(err.response?.data?.error || err.response?.data?.message || 'Invalid OTP. Try again.');
    }
  };

  const acceptRide = async () => {
    try { 
      await driverService.acceptRide(id); 
      setRide(prev => ({ ...prev, status: 'accepted' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept ride');
    }
  };

  const startRide = async () => {
    try { 
      await driverService.startRide(id); 
      setRide(prev => ({ ...prev, status: 'in-progress' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start ride');
    }
  };

  const completeRide = async () => {
    try { 
      await driverService.completeRide(id); 
      setRide(prev => ({ ...prev, status: 'completed' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete ride');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', paddingTop: '70px' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="page-container" style={{ paddingTop: '90px', textAlign: 'center' }}>
        <h3>Ride not found</h3>
        <Link to="/driver" className="btn btn-primary mt-2">Back to Dashboard</Link>
      </div>
    );
  }

  const pickupLoc = ride.pickup ? {
    lat: ride.pickup.coordinates ? ride.pickup.coordinates[1] : ride.pickup.lat,
    lng: ride.pickup.coordinates ? ride.pickup.coordinates[0] : ride.pickup.lng,
  } : null;

  const dropoffLoc = ride.dropoff ? {
    lat: ride.dropoff.coordinates ? ride.dropoff.coordinates[1] : ride.dropoff.lat,
    lng: ride.dropoff.coordinates ? ride.dropoff.coordinates[0] : ride.dropoff.lng,
  } : null;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '90px' }}>
      <button onClick={() => navigate('/driver')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <FiChevronLeft size={16} /> Back to Dashboard
      </button>

      <h2 style={{ fontFamily: 'Outfit', marginBottom: '1.5rem' }}>Ride Details</h2>

      <div className="grid-2" style={{ gap: '2rem' }}>
        {/* Map */}
        <MapView pickupLocation={pickupLoc} dropoffLocation={dropoffLoc} height="350px" interactive={true} />

        {/* Info */}
        <div>
          {/* Passenger Info */}
          {ride.user && (
            <div className="glass-card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}><FiUser size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Passenger</h4>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ride.user.name || 'Passenger'} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>(User)</span></div>
              {ride.user.phone && (
                <a href={`tel:${ride.user.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <FiPhone size={14} /> {ride.user.phone}
                </a>
              )}
            </div>
          )}

          {/* Locations */}
          <div className="glass-card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }}></div>
                <div style={{ width: 2, height: 24, background: 'var(--border-color)' }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--error)' }}></div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PICKUP</div>
                  <div style={{ fontWeight: 500 }}>{ride.pickupLocation?.address || ride.pickup?.address || 'Pickup Location'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DROPOFF</div>
                  <div style={{ fontWeight: 500 }}>{ride.dropoffLocation?.address || ride.dropoff?.address || 'Dropoff Location'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* OTP Verification */}
          {ride.status === 'accepted' && !otpVerified && (
            <div className="glass-card" style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Verify Passenger OTP</h4>
              <div className="otp-inputs">
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={i}
                    id={`driver-otp-${i}`}
                    className="otp-input"
                    type="text"
                    maxLength="1"
                    value={otpValue[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                  />
                ))}
              </div>
              {otpError && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>{otpError}</p>}
              <button className="btn btn-primary w-full mt-2" onClick={verifyOtp}>Verify OTP</button>
            </div>
          )}

          {/* Fare */}
          {ride.fare && <FareEstimate fare={ride.fare} />}

          {/* Status Badge */}
          <div className="glass-card" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
              Status: {ride.status?.replace(/[-_]/g, ' ').toUpperCase()}
            </span>
          </div>

          {/* Actions */}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ride.status === 'requested' && (
              <button className="btn btn-success w-full" onClick={acceptRide}>
                <FiCheckCircle size={16} /> Accept Ride
              </button>
            )}
            {ride.status === 'accepted' && otpVerified && (
              <button className="btn btn-success w-full" onClick={startRide}>
                <FiNavigation size={16} /> Start Ride
              </button>
            )}
            {(ride.status === 'in-progress' || ride.status === 'in_progress') && (
              <button className="btn btn-primary w-full" onClick={completeRide}>
                <FiCheckCircle size={16} /> Complete Ride
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRideView;
