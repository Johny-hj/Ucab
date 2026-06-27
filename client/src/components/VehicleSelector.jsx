import { FiTruck, FiZap, FiNavigation, FiShield } from 'react-icons/fi';

const vehicleTypes = [
  { type: 'auto', icon: FiTruck, name: 'Auto', seats: '3 seater', desc: 'Economical', emoji: '🛺' },
  { type: 'bike', icon: FiZap, name: 'Bike', seats: '1 seater', desc: 'Fastest', emoji: '🏍️' },
  { type: 'sedan', icon: FiNavigation, name: 'Sedan', seats: '4 seater', desc: 'Comfortable', emoji: '🚗' },
  { type: 'suv', icon: FiShield, name: 'SUV', seats: '6 seater', desc: 'Premium', emoji: '🚙' },
];

const VehicleSelector = ({ selectedType, onSelect, fareEstimates }) => {
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Choose Vehicle</h4>
      <div className="grid-2" style={{ gap: '0.75rem' }}>
        {vehicleTypes.map((v) => (
          <div
            key={v.type}
            className="glass-card"
            onClick={() => onSelect(v.type)}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              padding: '1.25rem',
              border: selectedType === v.type
                ? '2px solid var(--primary)'
                : '1px solid var(--glass-border)',
              background: selectedType === v.type
                ? 'rgba(108,99,255,0.1)'
                : 'var(--glass-bg)',
              boxShadow: selectedType === v.type
                ? '0 0 20px var(--primary-glow)'
                : 'none',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{v.emoji}</div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{v.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.seats}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{v.desc}</div>
            {fareEstimates && fareEstimates[v.type] != null && (
              <div style={{
                marginTop: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)',
                fontSize: '1.1rem',
              }}>
                ₹{fareEstimates[v.type].toFixed(0)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelector;
