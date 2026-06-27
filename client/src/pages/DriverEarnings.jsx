import { useState, useEffect } from 'react';
import { FiActivity, FiTrendingUp } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import { driverService } from '../services/api';

const DriverEarnings = () => {
  const [stats, setStats] = useState({ todayEarnings: 0, totalRides: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverService.getEarnings()
      .then(res => {
        const data = res.data?.data || res.data;
        setStats({
          todayEarnings: data.todayEarnings || data.today || 0,
          totalRides: data.totalRides || data.total || 0,
          totalEarnings: data.totalEarnings || data.earnings || 0,
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Sidebar role="driver" />
      <div className="sidebar-content">
        <h2 style={{ fontFamily: 'Outfit', marginBottom: '1.5rem' }}>Your Earnings</h2>
        
        {loading ? (
          <div className="flex-center" style={{ padding: '3rem' }}><div className="spinner"></div></div>
        ) : (
          <>
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
              <StatsCard icon={FaRupeeSign} title="Today's Earnings" value={`₹${Number(stats.todayEarnings).toFixed(2)}`} color="var(--success)" />
              <StatsCard icon={FiActivity} title="Total Rides" value={stats.totalRides} color="var(--primary)" />
              <StatsCard icon={FiTrendingUp} title="Total Earnings" value={`₹${Number(stats.totalEarnings).toFixed(2)}`} color="var(--secondary)" />
            </div>
            
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <FaRupeeSign size={48} style={{ color: 'var(--success)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3>Earnings Hub</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
                You're doing great! This section is where you can track your detailed daily, weekly, and monthly earnings breakdown.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DriverEarnings;
