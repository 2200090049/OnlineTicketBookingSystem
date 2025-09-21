import { Link, useLocation } from 'react-router-dom';
import { FilmIcon, TrophyIcon, TruckIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

const SubNavigation = ({ className = '' }) => {
  const location = useLocation();
  
  const navItems = [
    {
      name: 'Movies',
      path: '/movies',
      icon: FilmIcon,
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
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  return (
    <div className={`bg-surface border-b border-gray-200 sticky top-16 z-40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

SubNavigation.propTypes = {
  className: PropTypes.string,
};

export default SubNavigation;