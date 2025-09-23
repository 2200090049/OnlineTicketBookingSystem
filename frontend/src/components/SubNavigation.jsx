import { Link, useLocation } from 'react-router-dom';
import { FilmIcon, TrophyIcon, TruckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

const SubNavigation = ({ className = '' }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Base navigation items
  const baseNavItems = [
    {
      name: 'Movies',
      path: '/movies',
      icon: FilmIcon,
    },
    {
      name: 'Train Tickets',
      path: '/trains',
      icon: TruckIcon,
    },
    {
      name: 'Sports',
      path: '/sports',
      icon: TrophyIcon,
    },
    {
      name: 'Buses',
      path: '/buses',
      icon: TruckIcon,
    },
  ];

  // Vendor-specific navigation items
  const getVendorNavItems = () => {
    if (!user?.isVendor && !user?.vendor) return [];
    
    const vendorItems = [];
    
    switch (user.vendorType) {
      case 'MOVIES_ADMIN':
        vendorItems.push({
          name: 'Movies Admin',
          path: '/vendor/movies',
          icon: FilmIcon,
          isVendor: true
        });
        break;
      case 'TRAIN_ADMIN':
        vendorItems.push({
          name: 'Trains Admin',
          path: '/vendor/trains',
          icon: TruckIcon,
          isVendor: true
        });
        break;
      case 'BUSES_ADMIN':
        vendorItems.push({
          name: 'Buses Admin',
          path: '/vendor/buses',
          icon: TruckIcon,
          isVendor: true
        });
        break;
      default:
        break;
    }
    
    return vendorItems;
  };

  // Combine navigation items
  const navItems = [...baseNavItems, ...getVendorNavItems()];
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  return (
    <div className={`bg-surface border-b border-gray-200 sticky top-16 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation items */}
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${active 
                      ? 'border-primary-main text-primary-main' 
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                    }
                    ${item.isVendor ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - Admin button (only for admin users) */}
          {user?.role === 'ADMIN' && (
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard">
                <Button 
                  variant="primary" 
                  size="small"
                  className="flex items-center space-x-2"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SubNavigation.propTypes = {
  className: PropTypes.string,
};

export default SubNavigation;