import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { busBookingsAPI } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  TruckIcon, 
  CalendarIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const BusVendorBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      console.log('Loading bus bookings from API...');
      
      const response = await busBookingsAPI.getAllBookings();
      console.log('All bus bookings response:', response);
      console.log('Response data:', response.data);
      console.log('Bookings array:', response.data?.bookings);
      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error('Error loading bus bookings:', error);
      console.error('Error details:', error.response?.data);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTicket = async (bookingId) => {
    try {
      const response = await busBookingsAPI.downloadTicket(bookingId);
      
      // Create blob and download file
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bus-ticket-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Bus ticket downloaded successfully');
    } catch (error) {
      console.error('Error downloading bus ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = !searchTerm || 
      booking.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passengerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.bus?.busName && booking.bus.busName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
    cancelled: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length,
    pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bus Bookings Management</h1>
          <p className="mt-2 text-gray-600">View and manage all bus bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.all}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Confirmed</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.confirmed}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cancelled</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.cancelled}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.pending}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Bookings ({statusCounts.all})</option>
                  <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
                  <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
                  <option value="pending">Pending ({statusCounts.pending})</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Bookings
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by passenger name, email, booking reference, or bus name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Refresh Button */}
              <div className="flex items-end">
                <Button
                  onClick={loadBookings}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Bookings List */}
        {isLoading ? (
          <Card>
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bus bookings...</p>
            </div>
          </Card>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(booking.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <TruckIcon className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.bus?.busName || 'Bus Name Not Available'}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><span className="font-medium">Route:</span> {booking.bus?.sourceCity || 'N/A'} → {booking.bus?.destinationCity || 'N/A'}</p>
                              <p><span className="font-medium">Passenger:</span> {booking.passengerName || 'N/A'}</p>
                              <p><span className="font-medium">Email:</span> {booking.passengerEmail || 'N/A'}</p>
                              <p><span className="font-medium">Phone:</span> {booking.passengerPhone || 'N/A'}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Departure:</span> {booking.bus?.departureTime ? formatDate(booking.bus.departureTime) : 'N/A'} at {booking.bus?.departureTime ? formatTime(booking.bus.departureTime) : 'N/A'}</p>
                              <p><span className="font-medium">Seats:</span> {booking.numberOfSeats || 'N/A'}</p>
                              <p><span className="font-medium">Booking Ref:</span> {booking.bookingReference || 'N/A'}</p>
                              <p><span className="font-medium">Booking Date:</span> {booking.bookingDate ? formatDate(booking.bookingDate) : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end">
                      <div className="text-right mb-4">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{booking.totalAmount || '0'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.numberOfSeats || 0} seat{(booking.numberOfSeats || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => {
                            // View booking details
                            console.log('View bus booking:', booking.id);
                            alert(`Booking Details:\nRef: ${booking.bookingReference}\nPassenger: ${booking.passengerName}\nBus: ${booking.bus?.busName}\nStatus: ${booking.status}`);
                          }}
                        >
                          View Details
                        </Button>
                        
                        {booking.status?.toLowerCase() === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleDownloadTicket(booking.id)}
                            className="flex items-center space-x-1"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>Download Ticket</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-8 text-center">
              <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bus bookings found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No bus bookings have been made yet.'
                }
              </p>
              {(searchTerm || filter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BusVendorBookings;