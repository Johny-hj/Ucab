const FareEstimate = ({ fare }) => {
  if (!fare) return null;

  const lineItems = [
    { label: 'Base Fare', value: fare.baseFare || 0 },
    { label: 'Distance Fare', value: fare.distanceFare || 0 },
    { label: 'Time Fare', value: fare.timeFare || 0 },
  ];

  if (fare.surgeFare > 0) {
    lineItems.push({ label: 'Surge Charge', value: fare.surgeFare, isExtra: true });
  }

  if (fare.discount > 0) {
    lineItems.push({ label: 'Discount', value: -fare.discount, isDiscount: true });
  }

  return (
    <div className="glass-card" style={{ marginTop: '1rem' }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Fare Estimate</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {lineItems.map((item, idx) => (
          <div key={idx} className="flex-between">
            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{
              color: item.isDiscount ? 'var(--success)' : item.isExtra ? 'var(--warning)' : 'var(--text-primary)',
              fontWeight: 500
            }}>
              {item.isDiscount ? '-' : ''}₹{Math.abs(item.value).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        borderTop: '1px solid var(--glass-border)',
        marginTop: '0.75rem',
        paddingTop: '0.75rem'
      }}>
        <div className="flex-between">
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
            ₹{(fare.totalFare || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FareEstimate;
