import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { busBookingsAPI } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';

const BusSeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { bus, passengers } = location.state || {};
  
  const [numberOfSeats, setNumberOfSeats] = useState(passengers || 1);
  const [passengerDetails, setPassengerDetails] = useState({
    name: '',
    email: user?.email || '',
    phone: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!bus) {
      navigate('/buses');
      return;
    }
    
    // Debug: Log bus data
    console.log('Bus data in BusSeatSelection:', bus);
  }, [user, navigate, bus]);

  const handleSeatChange = (seats) => {
    setNumberOfSeats(seats);
  };

  const handleInputChange = (field, value) => {
    setPassengerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBooking = async () => {
    if (!passengerDetails.name || !passengerDetails.email || !passengerDetails.phone) {
      alert('Please fill all passenger details');
      return;
    }

    // Validate phone number format (10 digits)
    if (!/^[0-9]{10}$/.test(passengerDetails.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    if (numberOfSeats > bus.availableSeats) {
      alert('Not enough seats available');
      return;
    }

    try {
      setIsBooking(true);
      const bookingData = {
        bus: { id: bus.id },
        passengerName: passengerDetails.name,
        passengerEmail: passengerDetails.email,
        passengerPhone: passengerDetails.phone,
        numberOfSeats: numberOfSeats,
        totalAmount: bus.price * numberOfSeats
      };

      console.log('Sending booking data:', bookingData);
      console.log('API URL:', 'http://localhost:2002/api/bus-bookings/book');
      
      // Test if API is reachable first
      try {
        const testResponse = await fetch('http://localhost:2002/api/buses/available');
        console.log('API test response:', testResponse.status);
        const testData = await testResponse.json();
        console.log('Available buses from API:', testData);
      } catch (testError) {
        console.error('API test failed:', testError);
      }
      
      const response = await busBookingsAPI.bookBus(bookingData);
      console.log('Booking response:', response);
      
      // Check if booking was successful (even if response has JSON issues)
      if (response.status === 200 || response.status === 201) {
        // Set booking details for success modal
        setBookingDetails({
          busName: bus.busName,
          sourceCity: bus.sourceCity,
          destinationCity: bus.destinationCity,
          numberOfSeats: numberOfSeats,
          totalAmount: bus.price * numberOfSeats,
          bookingId: response.data?.booking?.id || 'N/A',
          bookingReference: response.data?.bookingReference || 'N/A'
        });
        
        setShowSuccess(true);
        
        // Download PDF ticket automatically (after success modal)
        if (response.data?.booking?.id) {
          try {
            await downloadTicket(response.data.booking.id);
          } catch (pdfError) {
            console.error('PDF download failed:', pdfError);
            // Don't fail the booking if PDF download fails
          }
        }
      } else {
        throw new Error('Booking failed with status: ' + response.status);
      }
    } catch (error) {
      console.error('Error booking bus:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      // Show specific error message from backend
      let errorMessage = 'Booking failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).join(', ');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsBooking(false);
    }
  };

  const downloadTicket = async (bookingId) => {
    try {
      const response = await busBookingsAPI.downloadTicket(bookingId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bus-ticket-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again later.');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user || !bus) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="small"
                onClick={() => navigate('/buses')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Buses</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Select Seats</h1>
                <p className="text-gray-600 mt-1">
                  Choose your seats and enter passenger details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bus Details Card */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <TruckIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{bus.busName}</h3>
                      <p className="text-gray-600">{bus.busNumber} • {bus.operatorName}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                        {bus.busType?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Route</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {bus.sourceCity} → {bus.destinationCity}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Departure</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatTime(bus.departureTime)} • {formatDate(bus.departureTime)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Arrival</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatTime(bus.arrivalTime)} • {formatDate(bus.arrivalTime)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Available Seats</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {bus.availableSeats} of {bus.totalSeats}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Seat Selection */}
            <Card>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Number of Seats</h4>
                <div className="flex items-center space-x-4">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={numberOfSeats}
                    onChange={(e) => setNumberOfSeats(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: Math.min(bus.availableSeats, 6) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Seat' : 'Seats'}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Simple Bus Layout Visualization */}
                <div className="mt-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Bus Layout</h5>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-center mb-2">
                      <div className="inline-block bg-gray-600 text-white px-3 py-1 rounded text-xs">
                        Driver
                      </div>
                    </div>
                    
                    {/* Simple 2+2 layout visualization */}
                    <div className="space-y-2">
                      {Array.from({ length: Math.ceil(bus.totalSeats / 4) }, (_, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center space-x-4">
                          <div className="flex space-x-1">
                            {Array.from({ length: 2 }, (_, seatIndex) => {
                              const seatNumber = rowIndex * 4 + seatIndex + 1;
                              const isSelected = seatNumber <= numberOfSeats;
                              const isAvailable = seatNumber <= bus.availableSeats;
                              
                              return seatNumber <= bus.totalSeats ? (
                                <div
                                  key={seatNumber}
                                  className={`w-8 h-8 rounded text-xs flex items-center justify-center font-medium ${
                                    isSelected
                                      ? 'bg-blue-500 text-white'
                                      : isAvailable
                                      ? 'bg-green-100 text-green-800 border border-green-300'
                                      : 'bg-red-100 text-red-800 border border-red-300'
                                  }`}
                                >
                                  {seatNumber}
                                </div>
                              ) : null;
                            })}
                          </div>
                          
                          <div className="w-4"></div> {/* Aisle space */}
                          
                          <div className="flex space-x-1">
                            {Array.from({ length: 2 }, (_, seatIndex) => {
                              const seatNumber = rowIndex * 4 + seatIndex + 3;
                              const isSelected = seatNumber <= numberOfSeats;
                              const isAvailable = seatNumber <= bus.availableSeats;
                              
                              return seatNumber <= bus.totalSeats ? (
                                <div
                                  key={seatNumber}
                                  className={`w-8 h-8 rounded text-xs flex items-center justify-center font-medium ${
                                    isSelected
                                      ? 'bg-blue-500 text-white'
                                      : isAvailable
                                      ? 'bg-green-100 text-green-800 border border-green-300'
                                      : 'bg-red-100 text-red-800 border border-red-300'
                                  }`}
                                >
                                  {seatNumber}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="mt-4 flex justify-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                        <span>Booked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-4">
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h4>
                
                {/* Passenger Details Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={passengerDetails.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={passengerDetails.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={passengerDetails.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Seats ({numberOfSeats})</span>
                    <span className="text-gray-900">₹{bus.price * numberOfSeats}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price</span>
                    <span className="text-gray-900">₹{bus.price} per seat</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <div className="flex items-center space-x-1">
                        <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          {bus.price * numberOfSeats}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Now Button */}
                <Button
                  onClick={handleBooking}
                  disabled={isBooking || !passengerDetails.name || !passengerDetails.email || !passengerDetails.phone}
                  className="w-full mt-6"
                  size="large"
                >
                  {isBooking ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Confirm Booking & Pay</span>
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Booking Confirmed!
              </h3>
              
              <p className="text-sm text-gray-500 mb-4">
                Your bus ticket has been booked successfully.
              </p>

              {bookingDetails && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bus:</span>
                      <span className="font-medium">{bookingDetails.busName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-medium">
                        {bookingDetails.sourceCity} → {bookingDetails.destinationCity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seats:</span>
                      <span className="font-medium">{bookingDetails.numberOfSeats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-green-600">₹{bookingDetails.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-medium">{bookingDetails.bookingId}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                {bookingDetails?.bookingId && bookingDetails.bookingId !== 'N/A' && (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => downloadTicket(bookingDetails.bookingId)}
                    className="flex items-center justify-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Download Ticket</span>
                  </Button>
                )}
                
                <Button
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/user/bookings');
                  }}
                  className="w-full"
                >
                  View My Bookings
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccess(false);
                    navigate('/buses');
                  }}
                  className="w-full"
                >
                  Book Another Bus
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BusSeatSelection;