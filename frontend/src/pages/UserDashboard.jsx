import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TicketIcon, 
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Card from '../components/Card';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Load recent bookings
    loadRecentBookings();
  }, [user, navigate]);

  const loadRecentBookings = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      setRecentBookings([
        {
          id: 1,
          type: 'train',
          trainName: 'Express Superfast',
          from: 'Delhi',
          to: 'Mumbai',
          date: '2024-12-25',
          time: '08:00',
          status: 'confirmed',
          seats: 2,
          amount: 3000
        }
      ]);
    } catch (error) {
      console.error('Error loading recent bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const bookingOptions = [
    {
      id: 'movies',
      title: 'Movie Booking',
      description: 'Book tickets for your favorite movies',
      icon: TicketIcon,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/movies')
    },
    {
      id: 'bus',
      title: 'Bus Booking',
      description: 'Find and book bus tickets for your journey',
      icon: RectangleStackIcon,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/buses')
    },
    {
      id: 'train',
      title: 'Train Booking',
      description: 'Book train tickets for your travel',
      icon: TruckIcon,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/trains')
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name || user.username}!
              </h1>
              <p className="text-gray-600 mt-1">
                Choose your booking option or manage your existing bookings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{recentBookings.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Booking Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Your Tickets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookingOptions.map((option) => (
              <Card
                key={option.id}
                className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                onClick={option.onClick}
              >
                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-lg ${option.color} ${option.hoverColor} transition-colors`}>
                    <option.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600">
                    {option.description}
                  </p>
                  <div className="mt-4">
                    <Button 
                      variant="primary" 
                      size="small"
                      className="w-full"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/bookings')}
            >
              View All
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : recentBookings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {booking.type === 'train' && <TruckIcon className="h-6 w-6 text-blue-600" />}
                        {booking.type === 'bus' && <RectangleStackIcon className="h-6 w-6 text-green-600" />}
                        {booking.type === 'movie' && <TicketIcon className="h-6 w-6 text-purple-600" />}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking.trainName || booking.movieName || booking.busName}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">{booking.type} booking</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{booking.from} → {booking.to}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        <span>{booking.seats} seat{booking.seats > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-lg font-semibold text-gray-900">₹{booking.amount}</p>
                      </div>
                      <Button variant="outline" size="small">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="p-8 text-center">
                <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by booking your first ticket using the options above.
                </p>
                <Button variant="primary" onClick={() => navigate('/trains')}>
                  Book Train Ticket
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/profile')}
            >
              <UserGroupIcon className="h-6 w-6" />
              <span>Profile</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/bookings')}
            >
              <TicketIcon className="h-6 w-6" />
              <span>My Bookings</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/support')}
            >
              <UserGroupIcon className="h-6 w-6" />
              <span>Support</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/settings')}
            >
              <UserGroupIcon className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
