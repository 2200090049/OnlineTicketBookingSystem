import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TicketIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { bookingsAPI, busBookingsAPI } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';

const UserBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trainBookings, setTrainBookings] = useState([]);
  const [busBookings, setBusBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, confirmed, cancelled
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [user, navigate]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      
      // Load both train and bus bookings in parallel
      const [trainResponse, busResponse] = await Promise.allSettled([
        bookingsAPI.getUserBookings(),
        busBookingsAPI.getUserBookings()
      ]);

      // Handle train bookings
      let trainBookingsData = [];
      if (trainResponse.status === 'fulfilled' && trainResponse.value?.data?.bookings) {
        trainBookingsData = trainResponse.value.data.bookings.map(booking => ({
          ...booking,
          type: 'train'
        }));
      } else {
        console.warn('Failed to load train bookings:', trainResponse.reason);
      }

      // Handle bus bookings
      let busBookingsData = [];
      if (busResponse.status === 'fulfilled' && busResponse.value?.data?.bookings) {
        busBookingsData = busResponse.value.data.bookings.map(booking => ({
          ...booking,
          type: 'bus'
        }));
      } else {
        console.warn('Failed to load bus bookings:', busResponse.reason);
      }

      // Combine and sort all bookings by booking date (newest first)
      const combinedBookings = [...trainBookingsData, ...busBookingsData]
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

      setTrainBookings(trainBookingsData);
      setBusBookings(busBookingsData);
      setAllBookings(combinedBookings);
      
      console.log('Train bookings:', trainBookingsData);
      console.log('Bus bookings:', busBookingsData);
      console.log('All bookings:', combinedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setTrainBookings([]);
      setBusBookings([]);
      setAllBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTicket = async (bookingId, bookingType) => {
    try {
      let response;
      let filename;
      
      if (bookingType === 'train') {
        response = await bookingsAPI.downloadTicket(bookingId);
        filename = `train-ticket-${bookingId}.pdf`;
      } else if (bookingType === 'bus') {
        response = await busBookingsAPI.downloadTicket(bookingId);
        filename = `bus-ticket-${bookingId}.pdf`;
      }
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  const handleCancelBooking = async (bookingId, bookingType) => {
    try {
      setCancellingBooking(bookingId);
      
      if (bookingType === 'train') {
        await bookingsAPI.cancelBooking(bookingId);
      } else if (bookingType === 'bus') {
        await busBookingsAPI.cancelBooking(bookingId);
      }
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      loadBookings(); // Reload bookings to update status
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBooking(null);
    }
  };

  const filteredBookings = allBookings.filter(booking => {
    // Filter by status only
    if (filter !== 'all' && booking.status.toLowerCase() !== filter) {
      return false;
    }
    
    return true;
  });

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
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
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
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                View and manage your train and bus ticket bookings
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/user/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Bookings', count: allBookings.length },
                { key: 'confirmed', label: 'Confirmed', count: allBookings.filter(b => b.status.toLowerCase() === 'confirmed').length },
                { key: 'cancelled', label: 'Cancelled', count: allBookings.filter(b => b.status.toLowerCase() === 'cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card key={`${booking.type}-${booking.id}`} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${booking.type === 'train' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {booking.type === 'train' ? (
                          <BuildingOfficeIcon className={`h-6 w-6 ${booking.type === 'train' ? 'text-blue-600' : 'text-green-600'}`} />
                        ) : (
                          <TruckIcon className={`h-6 w-6 ${booking.type === 'train' ? 'text-blue-600' : 'text-green-600'}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.type === 'train' 
                            ? (booking.train?.trainName || 'Train Name Not Available')
                            : (booking.bus?.busName || 'Bus Name Not Available')
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.type === 'train' 
                            ? `${booking.train?.trainNumber || 'N/A'} • ${booking.train?.trainClass?.replace('_', ' ') || 'N/A'}`
                            : `${booking.bus?.busNumber || 'N/A'} • ${booking.bus?.busType?.replace('_', ' ') || 'N/A'}`
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                            booking.type === 'train' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {booking.type === 'train' ? 'Train' : 'Bus'}
                          </span>
                          Booking Ref: {booking.bookingReference}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(booking.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">
                          {booking.type === 'train' 
                            ? (booking.train?.sourceStation || 'N/A')
                            : (booking.bus?.sourceCity || 'N/A')
                          }
                        </p>
                        <p className="text-xs text-gray-500">From</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">
                          {booking.type === 'train' 
                            ? (booking.train?.destinationStation || 'N/A')
                            : (booking.bus?.destinationCity || 'N/A')
                          }
                        </p>
                        <p className="text-xs text-gray-500">To</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">
                          {booking.type === 'train' 
                            ? (booking.train?.departureTime ? formatTime(booking.train.departureTime) : 'N/A')
                            : (booking.bus?.departureTime ? formatTime(booking.bus.departureTime) : 'N/A')
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.type === 'train' 
                            ? (booking.train?.departureTime ? formatDate(booking.train.departureTime) : 'N/A')
                            : (booking.bus?.departureTime ? formatDate(booking.bus.departureTime) : 'N/A')
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">₹{booking.totalAmount}</p>
                        <p className="text-xs text-gray-500">{booking.numberOfSeats} seat{booking.numberOfSeats > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <p>Passenger: {booking.passengerName}</p>
                      <p>Booked on: {formatDate(booking.bookingDate)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleDownloadTicket(booking.id, booking.type)}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download Ticket
                      </Button>
                      {booking.status.toLowerCase() === 'confirmed' && booking.canBeCancelled && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelModal(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-8 text-center">
              <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all'
                  ? "You haven't made any bookings yet."
                  : `No ${filter} bookings found.`
                }
              </p>
              <div className="flex space-x-3">
                <Button onClick={() => navigate('/train-booking')}>
                  Book a Train
                </Button>
                <Button onClick={() => navigate('/bus-booking')} variant="outline">
                  Book a Bus
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    {selectedBooking.type === 'train' 
                      ? (selectedBooking.train?.trainName || 'Train Name Not Available')
                      : (selectedBooking.bus?.busName || 'Bus Name Not Available')
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.type === 'train' 
                      ? `${selectedBooking.train?.sourceStation || 'N/A'} → ${selectedBooking.train?.destinationStation || 'N/A'}`
                      : `${selectedBooking.bus?.sourceCity || 'N/A'} → ${selectedBooking.bus?.destinationCity || 'N/A'}`
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.type === 'train' 
                      ? (selectedBooking.train?.departureTime ? `${formatDate(selectedBooking.train.departureTime)} at ${formatTime(selectedBooking.train.departureTime)}` : 'N/A')
                      : (selectedBooking.bus?.departureTime ? `${formatDate(selectedBooking.bus.departureTime)} at ${formatTime(selectedBooking.bus.departureTime)}` : 'N/A')
                    }
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                >
                  Keep Booking
                </Button>
                <Button
                  onClick={() => handleCancelBooking(selectedBooking.id, selectedBooking.type)}
                  disabled={cancellingBooking === selectedBooking.id}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {cancellingBooking === selectedBooking.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Cancelling...</span>
                    </div>
                  ) : (
                    'Cancel Booking'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
