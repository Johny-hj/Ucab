import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiStar, FiMapPin, FiCheckCircle, FiX, FiNavigation } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import RideCard from '../components/RideCard';
import MapView from '../components/MapView';
import { driverService, rideService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const DriverDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [stats, setStats] = useState({
    todayEarnings: 0,
    totalRides: 0,
    rating: 4.5,
    totalEarnings: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, ridesRes, earningsRes] = await Promise.allSettled([
          driverService.getActiveRide(),
          driverService.getMyRides({ limit: 5 }),
          driverService.getEarnings(),
        ]);

        if (activeRes.status === 'fulfilled') {
          const ride = activeRes.value.data.ride || activeRes.value.data;
          if (ride && ride._id && !['completed', 'cancelled'].includes(ride.status)) {
            setActiveRide(ride);
            setIsAvailable(true);
          }
        }

        if (ridesRes.status === 'fulfilled') {
          const resData = ridesRes.value.data;
          const rides = resData.data || resData.rides || resData || [];
          setRecentRides(Array.isArray(rides) ? rides : []);
        }

        if (earningsRes.status === 'fulfilled') {
          const data = earningsRes.value.data?.data || earningsRes.value.data;
          setStats({
            todayEarnings: data.todayEarnings || data.today || 0,
            totalRides: data.totalRides || data.total || 0,
            rating: data.rating || user?.rating || 4.5,
            totalEarnings: data.totalEarnings || data.earnings || 0,
          });
        }
      } catch (err) {
        console.error('Driver dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = (ride) => {
      setIncomingRequest(ride);
    };

    const handleRideCancelled = () => {
      setActiveRide(null);
      setIncomingRequest(null);
    };

    const handleRequestRemoved = (data) => {
      setIncomingRequest((prev) => {
        if (prev && prev._id === data.rideId) return null;
        return prev;
      });
    };

    socket.on('new-ride-request', handleNewRequest);
    socket.on('ride-cancelled', handleRideCancelled);
    socket.on('request-removed', handleRequestRemoved);

    return () => {
      socket.off('new-ride-request', handleNewRequest);
      socket.off('ride-cancelled', handleRideCancelled);
      socket.off('request-removed', handleRequestRemoved);
    };
  }, [socket]);

  // Simulation code removed. Now waits for real socket events.

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    try {
      await driverService.toggleAvailability(newStatus);
    } catch (err) {
      // simulate toggle
    }
    setIsAvailable(newStatus);
    if (!newStatus) {
      setIncomingRequest(null);
    }
  };

  const acceptRide = async () => {
    if (!incomingRequest) return;
    try {
      await driverService.acceptRide(incomingRequest._id);
    } catch (err) {
      // simulate
    }
    setActiveRide({ ...incomingRequest, status: 'accepted' });
    setIncomingRequest(null);
    setOtpValue(['', '', '', '']); // Reset OTP for new ride
    setOtpError('');
  };

  const rejectRide = () => {
    setIncomingRequest(null);
  };

  const handleOtpChange = (index, value) => {
    let char = value;
    if (value.length > 1) {
      char = value.slice(-1); // Take the last character if they overwrite
    }
    const newOtp = [...otpValue];
    newOtp[index] = char;
    setOtpValue(newOtp);
    setOtpError('');
    if (char && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const verifyOtp = async () => {
    const otp = otpValue.join('');
    if (otp.length !== 4) { setOtpError('Please enter 4-digit OTP'); return; }
    try {
      await driverService.verifyOtp(activeRide._id, otp);
      setActiveRide(prev => ({ ...prev, status: 'in-progress', otpVerified: true }));
    } catch (err) {
      setOtpError('Invalid OTP');
    }
  };

  const startRide = async () => {
    try {
      await driverService.startRide(activeRide._id);
    } catch (err) {}
    setActiveRide(prev => ({ ...prev, status: 'in-progress' }));
  };

  const completeRide = async () => {
    try {
      await driverService.completeRide(activeRide._id);
    } catch (err) {}
    setActiveRide(null);
    setStats(prev => ({ 
      ...prev, 
      totalRides: (prev.totalRides || 0) + 1, 
    }));
  };

  return (
    <div>
      <Sidebar role="driver" />
      <div className="sidebar-content">
        <h2 style={{ fontFamily: 'Outfit', marginBottom: '1.5rem' }}>Driver Dashboard</h2>

        {/* Availability Toggle */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div className="flex-between">
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>Availability</h3>
              <p style={{ color: isAvailable ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                {isAvailable ? '🟢 Online — Ready for rides' : '🔴 Offline'}
              </p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={isAvailable} onChange={toggleAvailability} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatsCard icon={FaRupeeSign} title="Today's Earnings" value={`₹${Number(stats.todayEarnings).toFixed(2)}`} color="var(--success)" />
          <StatsCard icon={FiActivity} title="Total Rides" value={stats.totalRides} color="var(--primary)" />
          <StatsCard icon={FiStar} title="Rating" value={Number(stats.rating).toFixed(1)} color="var(--warning)" />
          <StatsCard icon={FaRupeeSign} title="Total Earnings" value={`₹${Number(stats.totalEarnings).toFixed(2)}`} color="var(--secondary)" />
        </div>

        {/* Incoming Ride Request */}
        {incomingRequest && (
          <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--warning)', animation: 'glow 2s ease-in-out infinite' }}>
            <h3 style={{ color: 'var(--warning)', marginBottom: '1rem' }}>🔔 New Ride Request!</h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }}></div>
                <div style={{ width: 2, height: 20, background: 'var(--border-color)' }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--error)' }}></div>
              </div>
              <div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PICKUP</div>
                  <div style={{ fontWeight: 500 }}>{incomingRequest.pickupLocation?.address || incomingRequest.pickup?.address || 'Pickup Location'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DROPOFF</div>
                  <div style={{ fontWeight: 500 }}>{incomingRequest.dropoffLocation?.address || incomingRequest.dropoff?.address || 'Dropoff Location'}</div>
                </div>
              </div>
            </div>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fare: <strong style={{ color: 'var(--primary)' }}>₹{incomingRequest.fare?.totalFare?.toFixed(2) || 250}</strong></span>
              <span style={{ color: 'var(--text-secondary)' }}>Distance: <strong>{incomingRequest.distance || 8.5} km</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-success" onClick={acceptRide} style={{ flex: 1 }}>
                <FiCheckCircle size={16} /> Accept
              </button>
              <button className="btn btn-danger" onClick={rejectRide} style={{ flex: 1 }}>
                <FiX size={16} /> Reject
              </button>
            </div>
          </div>
        )}

        {/* Active Ride */}
        {activeRide && (
          <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Active Ride</h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }}></div>
                <div style={{ width: 2, height: 20, background: 'var(--border-color)' }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--error)' }}></div>
              </div>
              <div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PICKUP</div>
                  <div style={{ fontWeight: 500 }}>{activeRide.pickupLocation?.address || activeRide.pickup?.address || 'Pickup'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DROPOFF</div>
                  <div style={{ fontWeight: 500 }}>{activeRide.dropoffLocation?.address || activeRide.dropoff?.address || 'Dropoff'}</div>
                </div>
              </div>
            </div>

            {activeRide.user && (
              <div style={{ padding: '0.75rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Passenger</div>
                <div style={{ fontWeight: 600 }}>{activeRide.user.name || 'Passenger'}</div>
              </div>
            )}

            {/* OTP Verification */}
            {activeRide.status === 'accepted' && !activeRide.otpVerified && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>Verify OTP</h4>
                <div className="otp-inputs">
                  {[0, 1, 2, 3].map(i => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      className="otp-input"
                      type="text"
                      maxLength="2"
                      value={otpValue[i]}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    />
                  ))}
                </div>
                {otpError && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>{otpError}</p>}
                <button className="btn btn-primary w-full mt-2" onClick={verifyOtp}>
                  Verify OTP
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              {activeRide.status === 'accepted' && activeRide.otpVerified && (
                <button className="btn btn-success w-full" onClick={startRide}>
                  <FiNavigation size={16} /> Start Ride
                </button>
              )}
              {(activeRide.status === 'in-progress' || activeRide.status === 'in_progress') && (
                <button className="btn btn-primary w-full" onClick={completeRide}>
                  <FiCheckCircle size={16} /> Complete Ride
                </button>
              )}
            </div>
          </div>
        )}

        {/* Waiting message */}
        {isAvailable && !activeRide && !incomingRequest && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <h3 className="animate-pulse">Waiting for ride requests...</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>You'll be notified when a new request comes in</p>
          </div>
        )}

        {/* Recent Rides */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Recent Rides</h3>
          {loading ? (
            <div className="flex-center" style={{ padding: '2rem' }}><div className="spinner"></div></div>
          ) : recentRides.length > 0 ? (
            recentRides.map(ride => (
              <RideCard key={ride._id} ride={ride} onClick={(r) => navigate(`/driver/ride/${r._id}`)} />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🚗</div>
              <p className="empty-state-text">No rides yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
