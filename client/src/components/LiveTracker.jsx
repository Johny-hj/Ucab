import { FiPhone, FiStar, FiUser } from 'react-icons/fi';
import MapView from './MapView';

const LiveTracker = ({ ride, driverLocation }) => {
  if (!ride) return null;

  const pickupLoc = ride.pickup ? {
    lat: ride.pickup.coordinates ? ride.pickup.coordinates[1] : ride.pickup.lat,
    lng: ride.pickup.coordinates ? ride.pickup.coordinates[0] : ride.pickup.lng,
  } : null;

  const dropoffLoc = ride.dropoff ? {
    lat: ride.dropoff.coordinates ? ride.dropoff.coordinates[1] : ride.dropoff.lat,
    lng: ride.dropoff.coordinates ? ride.dropoff.coordinates[0] : ride.dropoff.lng,
  } : null;

  return (
    <div>
      <MapView
        pickupLocation={pickupLoc}
        dropoffLocation={dropoffLoc}
        driverLocation={driverLocation}
        interactive={true}
        height="350px"
      />

      {ride.driver && (
        <div className="glass-card" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '1.2rem',
            }}>
              {ride.driver.name ? ride.driver.name[0].toUpperCase() : <FiUser />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ride.driver.name || 'Driver'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {ride.driver.vehicleName || ride.driver.vehicle?.name} • {ride.driver.vehicleNumber || ride.driver.vehicle?.number}
              </div>
              <div className="star-rating" style={{ marginTop: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`star ${s <= (ride.driver.rating || 4) ? 'filled' : ''}`} style={{ fontSize: '0.9rem' }}>★</span>
                ))}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.25rem' }}>
                  {(ride.driver.rating || 4.0).toFixed(1)}
                </span>
              </div>
            </div>
            {ride.driver.phone && (
              <a href={`tel:${ride.driver.phone}`} className="btn btn-icon btn-primary">
                <FiPhone size={18} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracker;
