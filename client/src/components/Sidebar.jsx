import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiUser, FiUsers, FiActivity, FiMap, FiSettings } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const driverItems = [
  { path: '/driver', icon: FiHome, label: 'Dashboard' },
  { path: '/driver/rides', icon: FiList, label: 'My Rides' },
  { path: '/driver/earnings', icon: FaRupeeSign, label: 'Earnings' },
  { path: '/profile', icon: FiUser, label: 'Profile' },
];

const adminItems = [
  { path: '/admin', icon: FiHome, label: 'Overview' },
  { path: '/admin?tab=users', icon: FiUsers, label: 'Users' },
  { path: '/admin?tab=drivers', icon: FiActivity, label: 'Drivers' },
  { path: '/admin?tab=rides', icon: FiMap, label: 'Rides' },
];

const Sidebar = ({ role, activeItem }) => {
  const location = useLocation();
  const items = role === 'admin' ? adminItems : driverItems;

  const isActive = (item) => {
    if (activeItem) return activeItem === item.label.toLowerCase();
    if (item.path.includes('?')) {
      return location.pathname + location.search === item.path;
    }
    return location.pathname === item.path;
  };

  return (
    <nav className="sidebar">
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
          {role === 'admin' ? 'Admin Panel' : 'Driver Panel'}
        </h3>
      </div>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`sidebar-item ${isActive(item) ? 'active' : ''}`}
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Sidebar;
