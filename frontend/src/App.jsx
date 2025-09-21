
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
// import Sports from './pages/Sports';
// import Buses from './pages/Buses';
// import Booking from './pages/Booking';
// import Payment from './pages/Payment';
// import Profile from './pages/Profile';

import './App.css';

// Layout component to conditionally show navigation
const Layout = ({ children }) => {
  const { user } = useAuth();
  
  // Show navigation on all pages now
  const hideNavigation = false; // Changed to always show navbar
  
  const handleSearch = (searchTerm) => {
    console.log('Search:', searchTerm);
    // Implement search functionality
  };
  
  const handleProfileClick = () => {
    console.log('Profile clicked');
    // Navigate to profile page
  };
  
  const handleNotificationClick = () => {
    console.log('Notifications clicked');
    // Show notifications
  };
  
  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && (
        <>
          <Navbar
            user={user}
            onSearch={handleSearch}
            onProfileClick={handleProfileClick}
            onNotificationClick={handleNotificationClick}
          />
          <SubNavigation />
        </>
      )}
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
              {/* 
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/movies/:id/book" element={<MovieBooking />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/sports/:id" element={<SportDetails />} />
              <Route path="/sports/:id/book" element={<SportBooking />} />
              <Route path="/buses" element={<Buses />} />
              <Route path="/buses/:id/book" element={<BusBooking />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/booking/:id" element={<BookingDetails />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
              */}
            </Routes>
          </Layout>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;