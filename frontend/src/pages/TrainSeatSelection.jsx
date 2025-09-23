import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { bookingsAPI } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';

const TrainSeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { train, passengers } = location.state || {};
  
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
    if (!train) {
      navigate('/train-booking');
      return;
    }
    
    // Debug: Log train data
    console.log('Train data in TrainSeatSelection:', train);
  }, [user, navigate, train]);

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

    if (numberOfSeats > train.availableSeats) {
      alert('Not enough seats available');
      return;
    }

    try {
      setIsBooking(true);
      const bookingData = {
        train: { id: train.id },
        passengerName: passengerDetails.name,
        passengerEmail: passengerDetails.email,
        passengerPhone: passengerDetails.phone,
        numberOfSeats: numberOfSeats,
        totalAmount: train.price * numberOfSeats
      };

      console.log('Sending booking data:', bookingData);
      console.log('API URL:', 'http://localhost:2002/api/bookings/book');
      
      // Test if API is reachable first
      try {
        const testResponse = await fetch('http://localhost:2002/api/trains/available');
        console.log('API test response:', testResponse.status);
        const testData = await testResponse.json();
        console.log('Available trains from API:', testData);
      } catch (testError) {
        console.error('API test failed:', testError);
      }
      
      const response = await bookingsAPI.bookTrain(bookingData);
      console.log('Booking response:', response);
      
      // Check if booking was successful (even if response has JSON issues)
      if (response.status === 200 || response.status === 201) {
        // Set booking details for success modal
        setBookingDetails({
          trainName: train.trainName,
          sourceStation: train.sourceStation,
          destinationStation: train.destinationStation,
          numberOfSeats: numberOfSeats,
          totalAmount: train.price * numberOfSeats,
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
      console.error('Error booking train:', error);
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
      const response = await bookingsAPI.downloadTicket(bookingId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `train-ticket-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ticket:', error);
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

  if (!user || !train) {
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
                onClick={() => navigate('/train-booking')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Trains</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Select Seats</h1>
                <p className="text-gray-600 mt-1">Choose your seats and complete booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Train Details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Train Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{train.trainName}</h4>
                    <p className="text-sm text-gray-600">{train.trainNumber} • {train.trainClass.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {train.sourceStation} → {train.destinationStation}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(train.departureTime)} • {formatDate(train.departureTime)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Seat Selection */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Number of Seats</h3>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((seats) => (
                    <button
                      key={seats}
                      onClick={() => handleSeatChange(seats)}
                      className={`p-4 border-2 rounded-lg text-center font-medium transition-colors ${
                        numberOfSeats === seats
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {seats}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Available seats: {train.availableSeats}
                </p>
              </div>
            </Card>

            {/* Passenger Details */}
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Passenger Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={passengerDetails.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={passengerDetails.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={passengerDetails.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter exactly 10 digits (e.g., 9876543210)
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>{numberOfSeats} seat{numberOfSeats > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                    <span>₹{train.price} per seat</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{train.price * numberOfSeats}
                    </span>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={isBooking || numberOfSeats > train.availableSeats}
                    className="w-full"
                  >
                    {isBooking ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Booking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Confirm Booking & Download PDF</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && bookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Booking Successful!
              </h3>
              
              <p className="text-gray-600 mb-6">
                Your train ticket has been booked and downloaded successfully.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Train:</span> {bookingDetails.trainName}</p>
                  <p><span className="font-medium">Route:</span> {bookingDetails.sourceStation} → {bookingDetails.destinationStation}</p>
                  <p><span className="font-medium">Passengers:</span> {bookingDetails.numberOfSeats}</p>
                  <p><span className="font-medium">Total Amount:</span> ₹{bookingDetails.totalAmount}</p>
                  <p><span className="font-medium">Booking ID:</span> {bookingDetails.bookingId}</p>
                  {bookingDetails.bookingReference && (
                    <p><span className="font-medium">Reference:</span> {bookingDetails.bookingReference}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => downloadTicket(bookingDetails.bookingId)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Download Ticket Again</span>
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/user/bookings')}
                    className="flex-1"
                  >
                    View My Bookings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/train-booking')}
                    className="flex-1"
                  >
                    Book Another Train
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TrainSeatSelection;
