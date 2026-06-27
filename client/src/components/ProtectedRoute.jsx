import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const defaultPath = user.role === 'admin' ? '/admin' : user.role === 'driver' ? '/driver' : '/dashboard';
    return <Navigate to={defaultPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
