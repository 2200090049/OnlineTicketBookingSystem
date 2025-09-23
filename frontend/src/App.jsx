import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { useAuth } from './hooks/useAuth';
import { Navbar, SubNavigation } from './components';
import AuthGuard from './components/AuthGuard';

// Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrainBooking from './pages/TrainBooking';
import TrainSeatSelection from './pages/TrainSeatSelection';
import UserBookings from './pages/UserBookings';
import TrainAdmin from './pages/vendor/TrainAdmin';

import './App.css';

// Layout component to conditionally show navigation
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleSearch = (searchTerm) => {
    console.log('Search:', searchTerm);
  };
  
  const handleProfileClick = () => {
    console.log('Profile clicked');
    navigate('/profile');
  };
  
  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={user}
        onSearch={handleSearch}
        onProfileClick={handleProfileClick}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />
      <SubNavigation />
      <main>
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

// Main App component
const App = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/login" element={
                <AuthGuard>
                  <Login />
                </AuthGuard>
              } />
              <Route path="/signup" element={
                <AuthGuard>
                  <Register />
                </AuthGuard>
              } />
              <Route path="/register" element={
                <AuthGuard>
                  <Register />
                </AuthGuard>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/bookings" element={<UserBookings />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/train-booking" element={<TrainBooking />} />
              <Route path="/train-booking/seats" element={<TrainSeatSelection />} />
              <Route path="/trains" element={<TrainBooking />} />
              <Route path="/vendor/trains" element={<TrainAdmin />} />
              <Route path="/buses" element={<div>Bus booking coming soon...</div>} />
            </Routes>
          </Layout>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;
