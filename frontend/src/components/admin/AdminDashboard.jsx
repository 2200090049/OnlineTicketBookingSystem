import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Card } from '../index';
import * as adminAPI from '../../services/adminAPI';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', description }) => (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">
              {isLoading ? '...' : (value || '0')}
            </p>
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
        <button
          onClick={loadDashboardStats}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of system statistics and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={UserGroupIcon}
          color="blue"
          description="Registered users in the system"
        />
        
        <StatCard
          title="Total Vendors"
          value={stats?.totalVendors}
          icon={BuildingOfficeIcon}
          color="green"
          description="Active vendor accounts"
        />
        
        <StatCard
          title="Active Users"
          value={stats?.activeUsers}
          icon={UserGroupIcon}
          color="purple"
          description="Users with active status"
        />
        
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingApprovals}
          icon={ChartBarIcon}
          color="yellow"
          description="Items awaiting approval"
        />
      </div>

      {/* Additional Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Users:</span>
                <span className="font-medium">{stats.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users:</span>
                <span className="font-medium text-green-600">{stats.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inactive Users:</span>
                <span className="font-medium text-red-600">{stats.inactiveUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Users:</span>
                <span className="font-medium text-yellow-600">{stats.pendingUsers || 0}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Vendors:</span>
                <span className="font-medium">{stats.totalVendors || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Movie Vendors:</span>
                <span className="font-medium">{stats.movieVendors || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sports Vendors:</span>
                <span className="font-medium">{stats.sportsVendors || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transport Vendors:</span>
                <span className="font-medium">{stats.transportVendors || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Activity Section */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats?.systemStatus === 'healthy' ? '✓' : '⚠'}
            </div>
            <div className="text-sm text-gray-600 mt-1">System Status</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.systemStatus || 'Unknown'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalBookings || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Bookings</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats?.recentActivity || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Recent Activity</div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>
        </div>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadDashboardStats}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
