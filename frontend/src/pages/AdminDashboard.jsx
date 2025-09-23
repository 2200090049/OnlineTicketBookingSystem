import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  TruckIcon,
  TicketIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { trainAPI, bookingsAPI } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrains: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeTrains: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTrain, setShowAddTrain] = useState(false);
  const [trainForm, setTrainForm] = useState({
    trainName: '',
    trainNumber: '',
    sourceStation: '',
    destinationStation: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: '',
    price: '',
    trainClass: 'SECOND_AC'
  });
  const [isAddingTrain, setIsAddingTrain] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated or not admin
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'ADMIN') {
      navigate('/user/dashboard');
      return;
    }

    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load statistics
      const [trainsResponse, bookingsResponse, statsResponse] = await Promise.all([
        trainAPI.getAllTrains(),
        bookingsAPI.getAllBookings(),
        bookingsAPI.getBookingStats()
      ]);

      const trains = trainsResponse.data?.trains || [];
      const bookings = bookingsResponse.data || [];
      const bookingStats = statsResponse.data || {};

      setStats({
        totalTrains: Array.isArray(trains) ? trains.length : 0,
        totalBookings: Array.isArray(bookings) ? bookings.length : 0,
        totalRevenue: bookingStats.totalRevenue || 0,
        activeTrains: Array.isArray(trains) ? trains.filter(train => train.status === 'ACTIVE').length : 0
      });

      setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 5) : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrain = async (e) => {
    e.preventDefault();
    
    try {
      setIsAddingTrain(true);
      const totalSeats = parseInt(trainForm.totalSeats);
      const trainData = {
        ...trainForm,
        totalSeats: totalSeats,
        availableSeats: totalSeats, // Initially available seats = total seats
        price: parseFloat(trainForm.price),
        departureTime: trainForm.departureTime + ':00', // Add seconds for LocalDateTime format
        arrivalTime: trainForm.arrivalTime + ':00' // Add seconds for LocalDateTime format
      };

      await trainAPI.addTrain(trainData);
      
      alert('Train added successfully!');
      setShowAddTrain(false);
      setTrainForm({
        trainName: '',
        trainNumber: '',
        sourceStation: '',
        destinationStation: '',
        departureTime: '',
        arrivalTime: '',
        totalSeats: '',
        price: '',
        trainClass: 'SECOND_AC'
      });
      
      // Reload dashboard data
      loadDashboardData();
    } catch (error) {
      console.error('Error adding train:', error);
      alert('Failed to add train. Please try again.');
    } finally {
      setIsAddingTrain(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage trains, bookings, and system overview
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/user/dashboard')}
              >
                User Dashboard
              </Button>
              <Button 
                variant="primary"
                onClick={() => setShowAddTrain(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Train
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trains</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalTrains}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TicketIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{stats.totalRevenue}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Trains</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeTrains}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Train
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passenger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.train?.trainName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.passengerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.numberOfSeats}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{booking.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/trains')}>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TruckIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Manage Trains</h3>
                  <p className="text-gray-600">Add, edit, or delete trains</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/bookings')}>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TicketIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Manage Bookings</h3>
                  <p className="text-gray-600">View and manage all bookings</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/reports')}>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                  <p className="text-gray-600">View analytics and reports</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Train Modal */}
      {showAddTrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add New Train</h3>
                <button
                  onClick={() => setShowAddTrain(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddTrain} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Train Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainForm.trainName}
                      onChange={(e) => setTrainForm({...trainForm, trainName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Train Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainForm.trainNumber}
                      onChange={(e) => setTrainForm({...trainForm, trainNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Station *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainForm.sourceStation}
                      onChange={(e) => setTrainForm({...trainForm, sourceStation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Station *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainForm.destinationStation}
                      onChange={(e) => setTrainForm({...trainForm, destinationStation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={trainForm.departureTime}
                      onChange={(e) => setTrainForm({...trainForm, departureTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arrival Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={trainForm.arrivalTime}
                      onChange={(e) => setTrainForm({...trainForm, arrivalTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Seats *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={trainForm.totalSeats}
                      onChange={(e) => setTrainForm({...trainForm, totalSeats: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Seat *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={trainForm.price}
                      onChange={(e) => setTrainForm({...trainForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Train Class *
                    </label>
                    <select
                      required
                      value={trainForm.trainClass}
                      onChange={(e) => setTrainForm({...trainForm, trainClass: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FIRST_AC">First AC</option>
                      <option value="SECOND_AC">Second AC</option>
                      <option value="THIRD_AC">Third AC</option>
                      <option value="SLEEPER">Sleeper</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddTrain(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAddingTrain}
                    className="flex-1"
                  >
                    {isAddingTrain ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add Train'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
