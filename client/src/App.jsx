import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookRide from './pages/BookRide';
import RideTracking from './pages/RideTracking';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';
import DriverDashboard from './pages/DriverDashboard';
import DriverRideView from './pages/DriverRideView';
import DriverEarnings from './pages/DriverEarnings';
import AdminDashboard from './pages/AdminDashboard';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', paddingTop: '70px' }}>
    <div style={{ fontSize: '6rem', opacity: 0.5 }}>🔍</div>
    <h1 className="gradient-text" style={{ fontFamily: 'Outfit', fontSize: '3rem' }}>404</h1>
    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Page not found</p>
    <Link to="/" className="btn btn-primary">Go Home</Link>
  </div>
);

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User routes */}
        <Route element={<ProtectedRoute roles={['user']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<BookRide />} />
          <Route path="/history" element={<BookingHistory />} />
        </Route>

        {/* Shared user/driver routes */}
        <Route element={<ProtectedRoute roles={['user', 'driver']} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/ride/:id" element={<RideTracking />} />
        </Route>

        {/* Driver routes */}
        <Route element={<ProtectedRoute roles={['driver']} />}>
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/ride/:id" element={<DriverRideView />} />
          <Route path="/driver/rides" element={<BookingHistory />} />
          <Route path="/driver/earnings" element={<DriverEarnings />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
