import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ArrowRightIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { trainAPI, bookingsAPI } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import BookingSuccess from '../components/BookingSuccess';

const TrainBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: '',
    passengers: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    passengers: [
      {
        name: '',
        age: '',
        gender: 'Male',
        seatPreference: 'No Preference'
      }
    ],
    contactEmail: '',
    contactPhone: '',
    numberOfSeats: 1
  });
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Load all available trains
    loadTrains();
  }, [user, navigate]);

  const loadTrains = async () => {
    try {
      setIsLoading(true);
      const response = await trainAPI.getAvailableTrains();
      const trainsData = Array.isArray(response.data) ? response.data : [];
      setTrains(trainsData);
      setFilteredTrains(trainsData);
    } catch (error) {
      console.error('Error loading trains:', error);
      // Set some mock data for testing
      const mockTrains = [
        {
          id: 1,
          trainName: "Express Superfast",
          trainNumber: "EXP123",
          sourceStation: "Delhi",
          destinationStation: "Mumbai",
          departureTime: "2024-12-25T08:00:00",
          arrivalTime: "2024-12-25T20:00:00",
          totalSeats: 100,
          availableSeats: 85,
          price: 1500,
          trainClass: "SECOND_AC",
          status: "ACTIVE"
        },
        {
          id: 2,
          trainName: "Rajdhani Express",
          trainNumber: "RAJ456",
          sourceStation: "Delhi",
          destinationStation: "Bangalore",
          departureTime: "2024-12-25T10:00:00",
          arrivalTime: "2024-12-26T08:00:00",
          totalSeats: 80,
          availableSeats: 60,
          price: 2500,
          trainClass: "FIRST_AC",
          status: "ACTIVE"
        },
        {
          id: 3,
          trainName: "Shatabdi Express",
          trainNumber: "SHAT789",
          sourceStation: "Mumbai",
          destinationStation: "Pune",
          departureTime: "2024-12-25T14:00:00",
          arrivalTime: "2024-12-25T18:00:00",
          totalSeats: 60,
          availableSeats: 45,
          price: 800,
          trainClass: "THIRD_AC",
          status: "ACTIVE"
        }
      ];
      setTrains(mockTrains);
      setFilteredTrains(mockTrains);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    // Ensure trains is an array before filtering
    if (!Array.isArray(trains)) {
      console.error('Trains is not an array:', trains);
      return;
    }

    // If no search criteria, show all trains
    if (!searchParams.source && !searchParams.destination && !searchParams.date) {
      setFilteredTrains(trains);
      return;
    }

    const filtered = trains.filter(train => {
      let matches = true;
      
      // Filter by source station
      if (searchParams.source) {
        matches = matches && train.sourceStation.toLowerCase().includes(searchParams.source.toLowerCase());
      }
      
      // Filter by destination station
      if (searchParams.destination) {
        matches = matches && train.destinationStation.toLowerCase().includes(searchParams.destination.toLowerCase());
      }
      
      // Filter by date
      if (searchParams.date) {
        const trainDate = new Date(train.departureTime).toDateString();
        const searchDate = new Date(searchParams.date).toDateString();
        matches = matches && trainDate === searchDate;
      }
      
      // Filter by available seats
      matches = matches && train.availableSeats >= searchParams.passengers;
      
      return matches;
    });

    setFilteredTrains(filtered);
  };

  const handleBookTrain = async (train) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Navigate directly to seat selection page
    navigate('/train-booking/seats', { 
      state: { 
        train: train,
        passengers: searchParams.passengers 
      } 
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all passenger details
    const hasEmptyPassenger = bookingForm.passengers.some(passenger => 
      !passenger.name || !passenger.age
    );
    
    if (hasEmptyPassenger || !bookingForm.contactEmail || !bookingForm.contactPhone) {
      alert('Please fill all passenger details and contact information');
      return;
    }

    try {
      setIsBooking(true);
      const bookingData = {
        train: { id: selectedTrain.id },
        passengerName: bookingForm.passengers[0].name, // Use first passenger as primary
        passengerEmail: bookingForm.contactEmail,
        passengerPhone: bookingForm.contactPhone,
        numberOfSeats: bookingForm.numberOfSeats,
        totalAmount: selectedTrain.price * bookingForm.numberOfSeats
      };

      const response = await bookingsAPI.bookTrain(bookingData);
      
      if (response.data && response.data.booking) {
        // Download PDF ticket automatically
        await downloadTicket(response.data.booking.id);
        
        // Set booking details for success modal
        setBookingDetails({
          trainName: selectedTrain.trainName,
          sourceStation: selectedTrain.sourceStation,
          destinationStation: selectedTrain.destinationStation,
          numberOfSeats: bookingForm.numberOfSeats,
          totalAmount: selectedTrain.price * bookingForm.numberOfSeats,
          bookingId: response.data.booking.id,
          bookingReference: response.data.bookingReference
        });
        
        setSelectedTrain(null);
        setShowSuccess(true);
        // Reload trains to update availability
        loadTrains();
      }
    } catch (error) {
      console.error('Error booking train:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const addPassenger = () => {
    if (bookingForm.passengers.length < 6) {
      setBookingForm({
        ...bookingForm,
        passengers: [
          ...bookingForm.passengers,
          {
            name: '',
            age: '',
            gender: 'Male',
            seatPreference: 'No Preference'
          }
        ],
        numberOfSeats: bookingForm.passengers.length + 1
      });
    }
  };

  const removePassenger = (index) => {
    if (bookingForm.passengers.length > 1) {
      const updatedPassengers = bookingForm.passengers.filter((_, i) => i !== index);
      setBookingForm({
        ...bookingForm,
        passengers: updatedPassengers,
        numberOfSeats: updatedPassengers.length
      });
    }
  };

  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...bookingForm.passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setBookingForm({
      ...bookingForm,
      passengers: updatedPassengers
    });
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

  const getTrainClassColor = (trainClass) => {
    switch (trainClass) {
      case 'FIRST_AC':
        return 'bg-purple-100 text-purple-800';
      case 'SECOND_AC':
        return 'bg-blue-100 text-blue-800';
      case 'THIRD_AC':
        return 'bg-green-100 text-green-800';
      case 'SLEEPER':
        return 'bg-orange-100 text-orange-800';
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
              <h1 className="text-3xl font-bold text-gray-900">Train Booking</h1>
              <p className="text-gray-600 mt-1">
                Find and book your train tickets
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
        {/* Search Form */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Trains (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <input
                  type="text"
                  value={searchParams.source}
                  onChange={(e) => setSearchParams({...searchParams, source: e.target.value})}
                  placeholder="Source station"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <input
                  type="text"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
                  placeholder="Destination station"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passengers
                </label>
                <select
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MagnifyingGlassIcon className="h-4 w-4" />
                      <span>Search</span>
                    </div>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setSearchParams({
                      source: '',
                      destination: '',
                      date: '',
                      passengers: 1
                    });
                    setFilteredTrains(trains);
                  }}
                  variant="outline"
                  className="px-4"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {Array.isArray(filteredTrains) && filteredTrains.length > 0 ? (
            filteredTrains.map((train) => (
              <Card key={train.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TruckIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {train.trainName}
                        </h3>
                        <p className="text-sm text-gray-600">{train.trainNumber}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrainClassColor(train.trainClass)}`}>
                      {train.trainClass.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">{train.sourceStation}</p>
                        <p className="text-xs text-gray-500">Source</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">{train.destinationStation}</p>
                        <p className="text-xs text-gray-500">Destination</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">{formatTime(train.departureTime)}</p>
                        <p className="text-xs text-gray-500">Departure</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">{formatTime(train.arrivalTime)}</p>
                        <p className="text-xs text-gray-500">Arrival</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        <span>{train.availableSeats} seats available</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                        <span className="text-lg font-semibold text-gray-900">₹{train.price}</span>
                        <span className="text-xs text-gray-500 ml-1">per seat</span>
                      </div>
                    </div>
                    <Button 
                      variant="primary"
                      onClick={() => handleBookTrain(train)}
                      disabled={train.availableSeats < searchParams.passengers}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="p-8 text-center">
                <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trains found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or search for different dates.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedTrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Book Train Ticket</h3>
                <button
                  onClick={() => setSelectedTrain(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Train Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedTrain.trainName}</h4>
                    <p className="text-sm text-gray-600">{selectedTrain.trainNumber} • {selectedTrain.trainClass.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">
                      {selectedTrain.sourceStation} → {selectedTrain.destinationStation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">₹{selectedTrain.price}</p>
                    <p className="text-sm text-gray-600">per seat</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Passengers Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Passenger Details</h4>
                    {bookingForm.passengers.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="small"
                        onClick={addPassenger}
                      >
                        Add Passenger
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {bookingForm.passengers.map((passenger, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-medium text-gray-900">Passenger {index + 1}</h5>
                          {bookingForm.passengers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePassenger(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={passenger.name}
                              onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter full name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Age *
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              max="120"
                              value={passenger.age}
                              onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter age"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gender
                            </label>
                            <select
                              value={passenger.gender}
                              onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seat Preference
                            </label>
                            <select
                              value={passenger.seatPreference}
                              onChange={(e) => updatePassenger(index, 'seatPreference', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="No Preference">No Preference</option>
                              <option value="Window">Window</option>
                              <option value="Aisle">Aisle</option>
                              <option value="Middle">Middle</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={bookingForm.contactEmail}
                        onChange={(e) => setBookingForm({...bookingForm, contactEmail: e.target.value})}
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
                        required
                        value={bookingForm.contactPhone}
                        onChange={(e) => setBookingForm({...bookingForm, contactPhone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xs text-gray-500">
                        {bookingForm.numberOfSeats} seat{bookingForm.numberOfSeats > 1 ? 's' : ''} × ₹{selectedTrain.price}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{selectedTrain.price * bookingForm.numberOfSeats}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedTrain(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isBooking}
                    className="flex-1"
                  >
                    {isBooking ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Booking...</span>
                      </div>
                    ) : (
                      'Confirm Booking & Download Ticket'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <BookingSuccess
          bookingDetails={bookingDetails}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default TrainBooking;
