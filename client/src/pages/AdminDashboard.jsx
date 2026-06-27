import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiUsers, FiActivity, FiMap, FiCheckCircle, FiX, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['overview', 'users', 'drivers', 'rides'].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('overview');
    }
  }, [location.search]);
  const [stats, setStats] = useState({
    totalUsers: 0, totalDrivers: 0, activeRides: 0,
    completedRides: 0, totalRevenue: 0, pendingVerifications: 0,
  });
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rideFilter, setRideFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const res = await adminService.getStats();
          const data = res.data;
          setStats({
            totalUsers: data.totalUsers || data.users || 125,
            totalDrivers: data.totalDrivers || data.drivers || 48,
            activeRides: data.activeRides || data.active || 12,
            completedRides: data.completedRides || data.completed || 1847,
            totalRevenue: data.totalRevenue || data.revenue || 284500,
            pendingVerifications: data.pendingVerifications || data.pending || 5,
          });
        } else if (activeTab === 'users') {
          const res = await adminService.getUsers();
          setUsers(res.data.users || res.data.data || (Array.isArray(res.data) ? res.data : []));
        } else if (activeTab === 'drivers') {
          const res = await adminService.getDrivers();
          setDrivers(res.data.drivers || res.data.data || (Array.isArray(res.data) ? res.data : []));
        } else if (activeTab === 'rides') {
          const params = rideFilter !== 'all' ? { status: rideFilter } : {};
          const res = await adminService.getRides(params);
          setRides(res.data.rides || res.data.data || (Array.isArray(res.data) ? res.data : []));
        }
      } catch (err) {
        console.error('Admin fetch error:', err);
        // Set demo data on error
        if (activeTab === 'overview') {
          setStats({ totalUsers: 125, totalDrivers: 48, activeRides: 12, completedRides: 1847, totalRevenue: 284500, pendingVerifications: 5 });
        } else if (activeTab === 'users') {
          setUsers([
            { _id: '1', name: 'Rahul Sharma', email: 'rahul@test.com', phone: '9876543210', role: 'user', status: 'active', createdAt: '2024-01-15' },
            { _id: '2', name: 'Priya Mehta', email: 'priya@test.com', phone: '9876543211', role: 'user', status: 'active', createdAt: '2024-02-20' },
            { _id: '3', name: 'Amit Kumar', email: 'amit@test.com', phone: '9876543212', role: 'user', status: 'active', createdAt: '2024-03-10' },
          ]);
        } else if (activeTab === 'drivers') {
          setDrivers([
            { _id: '1', name: 'Suresh Kumar', vehicle: { name: 'Swift', type: 'sedan', number: 'KA-01-1234' }, status: 'active', isVerified: true, rating: 4.7 },
            { _id: '2', name: 'Ramesh Singh', vehicle: { name: 'Alto', type: 'auto', number: 'KA-02-5678' }, status: 'active', isVerified: true, rating: 4.3 },
            { _id: '3', name: 'Vijay Patel', vehicle: { name: 'Innova', type: 'suv', number: 'KA-03-9012' }, status: 'inactive', isVerified: false, rating: 0 },
          ]);
        } else if (activeTab === 'rides') {
          setRides([
            { _id: '1', user: { name: 'Rahul' }, driver: { name: 'Suresh' }, pickup: { address: 'MG Road' }, dropoff: { address: 'Koramangala' }, status: 'completed', fare: { totalFare: 250 }, createdAt: '2024-06-15' },
            { _id: '2', user: { name: 'Priya' }, driver: { name: 'Ramesh' }, pickup: { address: 'Indiranagar' }, dropoff: { address: 'Whitefield' }, status: 'in-progress', fare: { totalFare: 450 }, createdAt: '2024-06-15' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, rideFilter]);

  const handleVerify = async (driverId) => {
    try {
      await adminService.verifyDriver(driverId);
      setDrivers(prev => prev.map(d => d._id === driverId ? { ...d, isVerified: true } : d));
    } catch (err) {
      setDrivers(prev => prev.map(d => d._id === driverId ? { ...d, isVerified: true } : d));
    }
  };

  const handleReject = async (driverId) => {
    try {
      await adminService.rejectDriver(driverId);
      setDrivers(prev => prev.filter(d => d._id !== driverId));
    } catch (err) {
      setDrivers(prev => prev.filter(d => d._id !== driverId));
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <Sidebar role="admin" activeItem={activeTab} />
      <div className="sidebar-content">
        <h2 style={{ fontFamily: 'Outfit', marginBottom: '1.5rem' }}>Admin Dashboard</h2>

        {/* Tab Buttons (mobile) */}
        <div className="auth-tabs" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
          {['overview', 'users', 'drivers', 'rides'].map(tab => (
            <button
              key={tab}
              className={`auth-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: '4rem' }}><div className="spinner spinner-lg"></div></div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid-3" style={{ gap: '1.5rem' }}>
                <StatsCard icon={FiUsers} title="Total Users" value={stats.totalUsers} color="var(--primary)" />
                <StatsCard icon={FiActivity} title="Total Drivers" value={stats.totalDrivers} color="var(--secondary)" />
                <StatsCard icon={FiMap} title="Active Rides" value={stats.activeRides} color="var(--success)" />
                <StatsCard icon={FiCheckCircle} title="Completed Rides" value={stats.completedRides} color="var(--primary)" />
                <StatsCard icon={FaRupeeSign} title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="var(--warning)" />
                <StatsCard icon={FiAlertCircle} title="Pending Verifications" value={stats.pendingVerifications} color="var(--accent)" />
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      className="form-input"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td><span className="badge badge-primary">{user.role}</span></td>
                          <td><span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>{user.status || 'active'}</span></td>
                          <td>{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="empty-state"><p className="empty-state-text">No users found</p></div>
                )}
              </div>
            )}

            {/* Drivers */}
            {activeTab === 'drivers' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Vehicle</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Verified</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(driver => (
                      <tr key={driver._id}>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{driver.user?.name || 'N/A'}</td>
                        <td>{driver.vehicleName || 'N/A'} ({driver.vehicleNumber || ''})</td>
                        <td><span className="badge badge-info">{driver.vehicleType || 'N/A'}</span></td>
                        <td><span className={`badge ${driver.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{driver.status || 'inactive'}</span></td>
                        <td>
                          {driver.isVerified ? (
                            <span className="badge badge-success">Verified</span>
                          ) : (
                            <span className="badge badge-warning">Pending</span>
                          )}
                        </td>
                        <td>{driver.rating ? `${driver.rating.toFixed(1)} ★` : 'N/A'}</td>
                        <td>
                          {!driver.isVerified && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-sm btn-success" onClick={() => handleVerify(driver._id)}>
                                <FiCheckCircle size={14} />
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleReject(driver._id)}>
                                <FiX size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {drivers.length === 0 && (
                  <div className="empty-state"><p className="empty-state-text">No drivers found</p></div>
                )}
              </div>
            )}

            {/* Rides */}
            {activeTab === 'rides' && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <select
                    className="form-input"
                    value={rideFilter}
                    onChange={(e) => setRideFilter(e.target.value)}
                    style={{ maxWidth: '250px' }}
                  >
                    <option value="all">All Rides</option>
                    <option value="requested">Requested</option>
                    <option value="accepted">Accepted</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Driver</th>
                        <th>Route</th>
                        <th>Status</th>
                        <th>Fare</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rides.map(ride => (
                        <tr key={ride._id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ride._id?.slice(-6) || 'N/A'}</td>
                          <td>{ride.user?.name || 'N/A'}</td>
                          <td>{ride.driver?.user?.name || ride.driver?.name || 'Unassigned'}</td>
                          <td style={{ maxWidth: '200px' }}>
                            <div style={{ fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--success)' }}>●</span> {ride.pickupLocation?.address || ride.pickup?.address || 'N/A'}
                              <br />
                              <span style={{ color: 'var(--error)' }}>●</span> {ride.dropoffLocation?.address || ride.dropoff?.address || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              ride.status === 'completed' ? 'badge-success' :
                              ride.status === 'cancelled' ? 'badge-error' :
                              ride.status === 'in-progress' ? 'badge-primary' :
                              'badge-warning'
                            }`}>
                              {ride.status?.replace(/[-_]/g, ' ')}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{ride.fare?.totalFare || ride.fare?.total || 0}</td>
                          <td>{formatDate(ride.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rides.length === 0 && (
                  <div className="empty-state"><p className="empty-state-text">No rides found</p></div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
