import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiClock, FiUser, FiHelpCircle, FiActivity, FiCalendar } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { rideService } from '../services/api';
import RideCard from '../components/RideCard';
import StatsCard from '../components/StatsCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentRides, setRecentRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRides: 0, totalSpent: 0, memberSince: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ridesRes, activeRes] = await Promise.allSettled([
          rideService.getMyRides({ limit: 5 }),
          rideService.getActiveRide(),
        ]);

        if (ridesRes.status === 'fulfilled') {
          const resData = ridesRes.value.data;
          const rides = resData.data || resData.rides || resData || [];
          setRecentRides(Array.isArray(rides) ? rides.slice(0, 5) : []);
          const total = Array.isArray(rides) ? rides.length : 0;
          const spent = Array.isArray(rides) ? rides.reduce((sum, r) => sum + (r.fare?.totalFare || r.fare?.total || 0), 0) : 0;
          setStats({
            totalRides: total,
            totalSpent: spent,
            memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently',
          });
        }

        if (activeRes.status === 'fulfilled' && activeRes.value.data) {
          const ride = activeRes.value.data.ride || activeRes.value.data;
          if (ride && ride._id && !['completed', 'cancelled'].includes(ride.status)) {
            setActiveRide(ride);
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const quickActions = [
    { icon: FiMap, title: 'Book a Ride', desc: 'Find a ride now', path: '/book', color: 'var(--primary)' },
    { icon: FiClock, title: 'View History', desc: 'Past rides', path: '/history', color: 'var(--secondary)' },
    { icon: FiUser, title: 'My Profile', desc: 'Edit details', path: '/profile', color: 'var(--accent)' },
    { icon: FiHelpCircle, title: 'Get Help', desc: 'Support center', path: '#', color: 'var(--warning)' },
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '90px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Where would you like to go today?</p>
      </div>

      {activeRide && (
        <Link to={`/ride/${activeRide._id}`} style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)', background: 'rgba(108,99,255,0.05)' }}>
            <div className="flex-between">
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Active Ride</span>
                <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>You have an ongoing ride</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status: {activeRide.status?.replace(/[-_]/g, ' ')}</p>
              </div>
              <div className="btn btn-primary btn-sm">Track Ride →</div>
            </div>
          </div>
        </Link>
      )}

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {quickActions.map((action, i) => (
          <Link key={i} to={action.path} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                width: 50, height: 50, borderRadius: 'var(--radius-md)',
                background: `${action.color}20`, color: action.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem', fontSize: '1.25rem',
              }}>
                <action.icon size={22} />
              </div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{action.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <StatsCard icon={FiActivity} title="Total Rides" value={stats.totalRides} color="var(--primary)" />
        <StatsCard icon={FaRupeeSign} title="Total Spent" value={`₹${stats.totalSpent.toFixed(0)}`} color="var(--secondary)" />
        <StatsCard icon={FiCalendar} title="Member Since" value={stats.memberSince} color="var(--accent)" />
      </div>

      <div>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3>Recent Rides</h3>
          <Link to="/history" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View All →</Link>
        </div>
        {loading ? (
          <div className="flex-center" style={{ padding: '3rem' }}><div className="spinner"></div></div>
        ) : recentRides.length > 0 ? (
          recentRides.map((ride) => (
            <RideCard key={ride._id} ride={ride} onClick={(r) => navigate(`/ride/${r._id}`)} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <p className="empty-state-text">No rides yet. Book your first ride!</p>
            <Link to="/book" className="btn btn-primary mt-2">Book Now</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
