const StatsCard = ({ icon: Icon, title, value, subtitle, color }) => {
  return (
    <div className="glass-card stats-card">
      <div
        className="stats-card-icon"
        style={{ background: color ? `${color}20` : 'var(--primary-glow)', color: color || 'var(--primary)' }}
      >
        {Icon && <Icon />}
      </div>
      <div className="stats-card-value" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="stats-card-title">{title}</div>
      {subtitle && <div className="stats-card-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{subtitle}</div>}
    </div>
  );
};

export default StatsCard;
