import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPhone, FiX, FiStar, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import { rideService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import MapView from '../components/MapView';
import RatingModal from '../components/RatingModal';
import PaymentModal from '../components/PaymentModal';

const statusSteps = ['requested', 'accepted', 'arriving', 'in-progress', 'completed'];

const RideTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [driverLocation, setDriverLocation] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchRide = useCallback(async () => {
    try {
      const res = await rideService.getById(id);
      const rideData = res.data?.data || res.data?.ride || res.data;
      setRide(rideData);
      if (rideData.driver?.location) {
        setDriverLocation({
          lat: rideData.driver.location.coordinates?.[1] || rideData.driver.location.lat,
          lng: rideData.driver.location.coordinates?.[0] || rideData.driver.location.lng,
        });
      }
    } catch (err) {
      setError('Ride not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRide();
  }, [fetchRide]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join-ride', id);

      socket.on('ride-updated', (data) => {
        setRide(prev => ({ ...prev, ...data }));
      });

      socket.on('driver-location', (location) => {
        setDriverLocation(location);
      });

      socket.on('ride-status-changed', (data) => {
        setRide(prev => ({ ...prev, status: data.status }));
      });

      return () => {
        socket.off('ride-updated');
        socket.off('driver-location');
        socket.off('ride-status-changed');
        socket.emit('leave-ride', id);
      };
    }
  }, [socket, id]);

  // Simulate driver movement
  useEffect(() => {
    if (!ride || !ride.driver || ride.status === 'completed' || ride.status === 'cancelled') return;

    const target = ride.status === 'in-progress' || ride.status === 'in_progress'
      ? ride.dropoffLocation || ride.dropoff
      : ride.pickupLocation || ride.pickup;

    if (!target || !driverLocation) return;

    const targetLat = target.coordinates ? target.coordinates[1] : target.lat;
    const targetLng = target.coordinates ? target.coordinates[0] : target.lng;

    const interval = setInterval(() => {
      setDriverLocation(prev => {
        if (!prev) return prev;
        const newLat = prev.lat + (targetLat - prev.lat) * 0.1;
        const newLng = prev.lng + (targetLng - prev.lng) * 0.1;
        return { lat: newLat, lng: newLng };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [ride, driverLocation]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    setCancelling(true);
    try {
      await rideService.cancel(id);
      setRide(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel ride');
    } finally {
      setCancelling(false);
    }
  };

  const handleRate = async (ratingData) => {
    await rideService.rate(id, ratingData);
    setRide(prev => ({ ...prev, rated: true }));
  };

  const handlePayment = async (paymentData) => {
    setPaymentLoading(true);
    try {
      await rideService.pay(id, paymentData);
      setRide(prev => ({ ...prev, paymentStatus: 'completed' }));
      setShowPayment(false);
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', paddingTop: '70px' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', paddingTop: '70px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FiAlertCircle size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
          <h3>{error || 'Ride not found'}</h3>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const pLoc = ride.pickupLocation || ride.pickup;
  const pickupLoc = pLoc ? {
    lat: pLoc.coordinates ? pLoc.coordinates[1] : pLoc.lat,
    lng: pLoc.coordinates ? pLoc.coordinates[0] : pLoc.lng,
  } : null;

  const dLoc = ride.dropoffLocation || ride.dropoff;
  const dropoffLoc = dLoc ? {
    lat: dLoc.coordinates ? dLoc.coordinates[1] : dLoc.lat,
    lng: dLoc.coordinates ? dLoc.coordinates[0] : dLoc.lng,
  } : null;

  const currentStepIndex = statusSteps.indexOf(ride.status?.replace('_', '-'));

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '90px' }}>
      <h2 style={{ fontFamily: 'Outfit', marginBottom: '1.5rem' }}>Ride Tracking</h2>

      {/* Status Timeline */}
      <div className="status-timeline">
        {statusSteps.map((step, idx) => (
          <div key={step} className="status-step">
            {idx < statusSteps.length - 1 && (
              <div className={`status-line ${idx < currentStepIndex ? 'active' : ''}`}></div>
            )}
            <div className={`status-dot ${
              idx < currentStepIndex ? 'completed' : idx === currentStepIndex ? 'active' : ''
            }`}></div>
            <span className="status-label">{step.replace(/-/g, ' ')}</span>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: '2rem', marginTop: '2rem' }}>
        {/* Map */}
        <div>
          <MapView
            pickupLocation={pickupLoc}
            dropoffLocation={dropoffLoc}
            driverLocation={driverLocation}
            interactive={true}
            height="350px"
          />
        </div>

        {/* Info Panel */}
        <div>
          {/* Waiting for driver */}
          {ride.status === 'requested' && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <h3 className="animate-pulse">Finding your driver...</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please wait while we match you with a nearby driver</p>
            </div>
          )}

          {/* Driver Info */}
          {ride.driver && (
            <div className="glass-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1.2rem',
                }}>
                  {(ride.driver.name || 'D')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ride.driver.name || 'Driver'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {ride.driver.vehicleName || ride.driver.vehicle?.name} • {ride.driver.vehicleNumber || ride.driver.vehicle?.number}
                  </div>
                  <div className="star-rating" style={{ marginTop: '0.25rem' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`star ${s <= (ride.driver.rating || 4) ? 'filled' : ''}`} style={{ fontSize: '0.8rem' }}>★</span>
                    ))}
                  </div>
                </div>
                {ride.driver.phone && (
                  <a href={`tel:${ride.driver.phone}`} className="btn btn-icon btn-primary">
                    <FiPhone size={16} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* OTP */}
          {ride.otp && ride.status !== 'completed' && ride.status !== 'cancelled' && (
            <div className="otp-display">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Share this OTP with your driver</div>
              <div className="otp-code">{ride.otp}</div>
            </div>
          )}

          {/* Fare */}
          {ride.fare && (
            <div className="glass-card" style={{ marginTop: '1rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Fare</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{(ride.fare.totalFare || ride.fare.total || ride.fare).toFixed ? (ride.fare.totalFare || ride.fare.total || ride.fare).toFixed(2) : ride.fare}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(ride.status === 'requested' || ride.status === 'accepted') && (
              <button className="btn btn-danger w-full" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <div className="spinner spinner-sm"></div> : <><FiX size={16} /> Cancel Ride</>}
              </button>
            )}
            {ride.status === 'completed' && !ride.rated && (
              <button className="btn btn-primary w-full" onClick={() => setShowRating(true)}>
                <FiStar size={16} /> Rate Your Ride
              </button>
            )}
            {ride.status === 'completed' && ride.paymentStatus !== 'paid' && ride.paymentStatus !== 'completed' && (
              <button className="btn btn-success w-full" onClick={() => setShowPayment(true)}>
                <FiCreditCard size={16} /> Make Payment
              </button>
            )}
          </div>
        </div>
      </div>

      <RatingModal isOpen={showRating} onClose={() => setShowRating(false)} onSubmit={handleRate} />
      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} onSubmit={handlePayment} fare={ride.fare?.totalFare || ride.fare?.total || ride.fare} loading={paymentLoading} />
    </div>
  );
};

export default RideTracking;
