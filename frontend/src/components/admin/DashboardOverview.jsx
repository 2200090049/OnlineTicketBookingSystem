import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  TruckIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { Button, Card } from '../index';

const DashboardOverview = ({ user, stats, onTabChange }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back, {user?.username || 'Admin'}</p>
        </div>
        <Button onClick={() => navigate('/')} variant="outline">
          Back to Main Site
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transportation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TruckIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Trains</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeTrains}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="small"
                onClick={() => onTabChange('trains')}
              >
                Manage
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FilmIcon className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Movies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeMovies}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="small"
                onClick={() => onTabChange('movies')}
              >
                Manage
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TruckIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Buses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeBuses}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="small"
                onClick={() => onTabChange('buses')}
              >
                Manage
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

DashboardOverview.propTypes = {
  user: PropTypes.object,
  stats: PropTypes.shape({
    totalUsers: PropTypes.number,
    totalVendors: PropTypes.number,
    totalBookings: PropTypes.number,
    totalRevenue: PropTypes.number,
    activeTrains: PropTypes.number,
    activeMovies: PropTypes.number,
    activeBuses: PropTypes.number,
  }).isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default DashboardOverview;