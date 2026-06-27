import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter } from 'react-icons/fi';
import { rideService } from '../services/api';
import RideCard from '../components/RideCard';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'active', label: 'Active' },
];

const BookingHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRides = async (reset = false) => {
    const currentPage = reset ? 1 : page;
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (activeTab !== 'all') {
        if (activeTab === 'active') {
          params.status = 'requested,accepted,arriving,in-progress';
        } else {
          params.status = activeTab;
        }
      }
      const res = await rideService.getMyRides(params);
      const resData = res.data;
      const newRides = resData.data || resData.rides || resData || [];
      const ridesList = Array.isArray(newRides) ? newRides : [];

      if (reset) {
        setRides(ridesList);
        setPage(2);
      } else {
        setRides(prev => [...prev, ...ridesList]);
        setPage(prev => prev + 1);
      }
      setHasMore(ridesList.length >= 10);
    } catch (err) {
      console.error('Fetch rides error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides(true);
  }, [activeTab]);

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '90px' }}>
      <h2 style={{ fontFamily: 'Outfit', marginBottom: '1.5rem' }}>Your Rides</h2>

      <div className="auth-tabs" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`auth-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && rides.length === 0 ? (
        <div className="flex-center" style={{ padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : rides.length > 0 ? (
        <div>
          {rides.map((ride, idx) => (
            <div key={ride._id || idx} style={{ animationDelay: `${idx * 0.05}s` }}>
              <RideCard
                ride={ride}
                onClick={(r) => navigate(`/ride/${r._id}`)}
              />
            </div>
          ))}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => fetchRides(false)} disabled={loading}>
                {loading ? <div className="spinner spinner-sm"></div> : 'Load More'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🚗</div>
          <p className="empty-state-text">No rides found</p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {activeTab === 'all' ? 'Book your first ride to get started!' : `No ${activeTab} rides`}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
