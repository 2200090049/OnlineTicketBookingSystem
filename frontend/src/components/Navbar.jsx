import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, BellIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { TicketIcon } from '@heroicons/react/24/solid';
import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import Button from './Button';

const Navbar = ({ user, onSearch, onProfileClick, onNotificationClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <TicketIcon className="h-8 w-8 text-primary-main" />
              <span className="text-xl font-bold text-text-primary">
                TicketBook
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar 
              placeholder="Search movies, events, destinations..."
              onSearch={onSearch}
              size="medium"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              onClick={onNotificationClick}
              className="p-2 text-text-secondary hover:text-primary-main transition-colors rounded-lg hover:bg-surface"
            >
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onProfileClick}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <UserCircleIcon className="h-8 w-8 text-text-secondary" />
                  <span className="hidden sm:block text-sm font-medium text-text-primary">
                    {user.name}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="small">
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="small">
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-text-secondary hover:text-primary-main transition-colors rounded-lg hover:bg-surface"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <SearchBar 
              placeholder="Search movies, events, destinations..."
              onSearch={onSearch}
              size="medium"
            />
          </div>
        )}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
  }),
  onSearch: PropTypes.func,
  onProfileClick: PropTypes.func,
  onNotificationClick: PropTypes.func,
};

export default Navbar;