import PropTypes from 'prop-types';
import { 
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TruckIcon,
  FilmIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'users', name: 'User Management', icon: UserGroupIcon },
    { id: 'vendors', name: 'Vendor Management', icon: BuildingOfficeIcon },
    { id: 'trains', name: 'Train Management', icon: TruckIcon },
    { id: 'movies', name: 'Movie Management', icon: FilmIcon },
    { id: 'buses', name: 'Bus Management', icon: TruckIcon },
    { id: 'reports', name: 'Reports & Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const handleItemClick = (itemId) => {
    setActiveTab(itemId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-primary-main text-white">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center px-4 py-2.5 text-left hover:bg-gray-100 transition-colors ${
                  activeTab === item.id 
                    ? 'bg-primary-50 text-primary-main border-r-2 border-primary-main' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>


      </div>
    </>
  );
};

AdminSidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default AdminSidebar;