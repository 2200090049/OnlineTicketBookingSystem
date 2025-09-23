import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FilmIcon, CalendarIcon, StarIcon, TruckIcon, ClockIcon, MapPinIcon, UserGroupIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import Card from '../components/Card';
import Button from '../components/Button';
import { trainAPI } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [availableTrains, setAvailableTrains] = useState([]);
  const [featuredBuses, setFeaturedBuses] = useState([]);
  const [isLoadingTrains, setIsLoadingTrains] = useState(true);

  // Load data from APIs
  useEffect(() => {
    loadAvailableTrains();
    loadMockData();
  }, []);

  const loadAvailableTrains = async () => {
    try {
      setIsLoadingTrains(true);
      const response = await trainAPI.getAvailableTrains();
      setAvailableTrains(response.data?.trains || []);
    } catch (error) {
      console.error('Error loading trains:', error);
      setAvailableTrains([]);
    } finally {
      setIsLoadingTrains(false);
    }
  };

  const loadMockData = () => {
    // Mock data for movies and buses
    setFeaturedMovies([
      {
        id: 1,
        title: 'Spider-Man: No Way Home',
        genre: 'Action, Adventure',
        rating: 8.8,
        image: '/api/placeholder/300/400',
        price: 250,
        duration: '2h 28m',
      },
      {
        id: 2,
        title: 'Dune',
        genre: 'Sci-Fi, Adventure',
        rating: 8.1,
        image: '/api/placeholder/300/400',
        price: 280,
        duration: '2h 35m',
      },
      {
        id: 3,
        title: 'No Time to Die',
        genre: 'Action, Thriller',
        rating: 7.3,
        image: '/api/placeholder/300/400',
        price: 300,
        duration: '2h 43m',
      },
    ]);

    setFeaturedBuses([
      {
        id: 1,
        route: 'Delhi to Mumbai',
        operator: 'Volvo AC Sleeper',
        departure: '10:30 PM',
        arrival: '2:00 PM +1',
        duration: '15h 30m',
        price: 1200,
      },
      {
        id: 2,
        route: 'Bangalore to Chennai',
        operator: 'Mercedes AC Semi-Sleeper',
        departure: '11:45 PM',
        arrival: '6:30 AM +1',
        duration: '6h 45m',
        price: 800,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-main to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Book Your Journey
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-light">
            Movies, Train Tickets, and Bus Tickets - All in One Place
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/movies">
              <Button size="large" variant="secondary" className="w-full sm:w-auto">
                <FilmIcon className="h-5 w-5 mr-2" />
                Browse Movies
              </Button>
            </Link>
            <Link to="/trains">
              <Button size="large" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-main">
                <TruckIcon className="h-5 w-5 mr-2" />
                Train Tickets
              </Button>
            </Link>
            <Link to="/buses">
              <Button size="large" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-main">
                <TruckIcon className="h-5 w-5 mr-2" />
                Bus Tickets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary">Featured Movies</h2>
            <Link to="/movies">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMovies.map((movie) => (
              <Card
                key={movie.id}
                hover
                clickable
                onClick={() => {/* Navigate to movie details */}}
                className="overflow-hidden"
              >
                <div className="aspect-w-2 aspect-h-3 mb-4">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-text-primary">{movie.title}</h3>
                  <p className="text-text-secondary text-sm">{movie.genre}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-warning fill-current" />
                      <span className="text-sm font-medium">{movie.rating}</span>
                    </div>
                    <span className="text-sm text-text-secondary">{movie.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-main">₹{movie.price}</span>
                    <Button size="small">Book Now</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Available Trains */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary">Available Trains</h2>
            <Link to="/trains">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          
          {isLoadingTrains ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : availableTrains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTrains.slice(0, 6).map((train) => (
                <Card
                  key={train.id}
                  hover
                  clickable
                  onClick={() => navigate('/trains')}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-text-primary mb-1">{train.trainName}</h3>
                        <p className="text-text-secondary text-sm mb-2">{train.trainNumber}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          train.trainClass === 'FIRST_AC' ? 'bg-purple-100 text-purple-800' :
                          train.trainClass === 'SECOND_AC' ? 'bg-blue-100 text-blue-800' :
                          train.trainClass === 'THIRD_AC' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {train.trainClass.replace('_', ' ')}
                        </span>
                      </div>
                      <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        train.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {train.status}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-text-secondary">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">{train.sourceStation}</div>
                          <div className="text-xs text-gray-500">to</div>
                          <div className="font-medium">{train.destinationStation}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-text-secondary">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div>Departure: {new Date(train.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div>Arrival: {new Date(train.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-text-secondary">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{train.availableSeats} seats available</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <CurrencyRupeeIcon className="h-5 w-5 text-primary-main mr-1" />
                        <span className="text-lg font-bold text-primary-main">₹{train.price}</span>
                      </div>
                      <Button size="small" onClick={(e) => { e.stopPropagation(); navigate('/trains'); }}>Book Now</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trains available</h3>
              <p className="text-gray-500">Check back later for available train routes.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Bus Routes */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary">Popular Bus Routes</h2>
            <Link to="/buses">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredBuses.map((bus) => (
              <Card
                key={bus.id}
                hover
                clickable
                onClick={() => {/* Navigate to bus booking */}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-text-primary mb-2">{bus.route}</h3>
                    <p className="text-text-secondary text-sm mb-2">{bus.operator}</p>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <div>
                        <span className="font-medium">Departure:</span> {bus.departure}
                      </div>
                      <div>
                        <span className="font-medium">Arrival:</span> {bus.arrival}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">Duration: {bus.duration}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-primary-main">₹{bus.price}</p>
                    <Button size="small" className="mt-2">Book Seats</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-main text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose TicketBook?
          </h2>
          <p className="text-xl mb-8 text-primary-light">
            Fast, secure, and convenient booking experience with instant confirmation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Wide Selection</h3>
              <p className="text-primary-light">Choose from movies, train routes, and bus services</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Best Prices</h3>
              <p className="text-primary-light">Competitive pricing with exclusive deals and offers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Easy Booking</h3>
              <p className="text-primary-light">Simple and quick booking process with instant confirmation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;