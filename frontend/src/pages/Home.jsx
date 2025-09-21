import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FilmIcon, TrophyIcon, CalendarIcon, StarIcon, TruckIcon } from '@heroicons/react/24/outline';
import Card from '../components/Card';
import Button from '../components/Button';

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredSports, setFeaturedSports] = useState([]);
  const [featuredBuses, setFeaturedBuses] = useState([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
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

      setFeaturedSports([
        {
          id: 1,
          title: 'India vs Australia',
          sport: 'Cricket',
          venue: 'Eden Gardens, Kolkata',
          date: '2024-01-15',
          time: '2:30 PM',
          price: 500,
        },
        {
          id: 2,
          title: 'Mumbai FC vs Delhi United',
          sport: 'Football',
          venue: 'Salt Lake Stadium',
          date: '2024-01-20',
          time: '7:00 PM',
          price: 350,
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
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-main to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Book Your Entertainment
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-light">
            Movies, Sports Events, and Bus Tickets - All in One Place
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/movies">
              <Button size="large" variant="secondary" className="w-full sm:w-auto">
                <FilmIcon className="h-5 w-5 mr-2" />
                Browse Movies
              </Button>
            </Link>
            <Link to="/sports">
              <Button size="large" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-main">
                <TrophyIcon className="h-5 w-5 mr-2" />
                Sports Events
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

      {/* Featured Sports */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary">Upcoming Sports Events</h2>
            <Link to="/sports">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredSports.map((event) => (
              <Card
                key={event.id}
                hover
                clickable
                onClick={() => {/* Navigate to event details */}}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-text-primary mb-2">{event.title}</h3>
                    <p className="text-text-secondary text-sm mb-1">{event.sport}</p>
                    <p className="text-text-secondary text-sm mb-2">{event.venue}</p>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{event.date}</span>
                      </div>
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-main">₹{event.price}</p>
                    <Button size="small" className="mt-2">Book Tickets</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
                <FilmIcon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Wide Selection</h3>
              <p className="text-primary-light">Choose from thousands of movies, events, and routes</p>
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