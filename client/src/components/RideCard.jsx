import { FiMapPin, FiClock } from 'react-icons/fi';

const statusColors = {
  requested: 'badge-warning',
  accepted: 'badge-info',
  arriving: 'badge-info',
  'in-progress': 'badge-primary',
  in_progress: 'badge-primary',
  completed: 'badge-success',
  cancelled: 'badge-error',
};

const vehicleEmojis = {
  auto: '🛺',
  bike: '🏍️',
  sedan: '🚗',
  suv: '🚙',
};

const RideCard = ({ ride, onClick }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const statusKey = ride.status?.replace('-', '_') || 'requested';
  const badgeClass = statusColors[ride.status] || statusColors[statusKey] || 'badge-primary';

  return (
    <div
      className="glass-card animate-slide-up"
      onClick={() => onClick && onClick(ride)}
      style={{ cursor: onClick ? 'pointer' : 'default', marginBottom: '1rem' }}
    >
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{vehicleEmojis[ride.vehicleType] || '🚗'}</span>
          <span className={`badge ${badgeClass}`}>{ride.status?.replace(/[-_]/g, ' ')}</span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <FiClock size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
          {formatDate(ride.createdAt || ride.date)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }}></div>
          <div style={{ width: 2, height: 24, background: 'var(--border-color)' }}></div>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--error)' }}></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pickup</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {ride.pickupLocation?.address || ride.pickupAddress || ride.pickup?.address || 'Pickup Location'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dropoff</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {ride.dropoffLocation?.address || ride.dropoffAddress || ride.dropoff?.address || 'Dropoff Location'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-between">
        <div>
          {ride.driver && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Driver: {ride.driver.name || ride.driverName}
            </span>
          )}
        </div>
        {ride.fare && (
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
            ₹{(ride.fare.totalFare || ride.fare.total || ride.fare).toFixed ? (ride.fare.totalFare || ride.fare.total || ride.fare).toFixed(2) : ride.fare}
          </span>
        )}
      </div>
    </div>
  );
};

export default RideCard;
