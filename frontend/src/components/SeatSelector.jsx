import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SeatSelector = ({ 
  rows = 10, 
  seatsPerRow = 10, 
  bookedSeats = [], 
  lockedSeats = [], 
  onSeatSelect, 
  maxSelection = 6,
  className = '',
  showLegend = true 
}) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [temporaryLocks, setTemporaryLocks] = useState(new Set());

  // Generate seat layout
  const generateSeats = () => {
    const seats = [];
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        rowSeats.push({
          id: `${String.fromCharCode(64 + row)}${seat}`,
          row,
          seat,
          isBooked: bookedSeats.includes(`${String.fromCharCode(64 + row)}${seat}`),
          isLocked: lockedSeats.includes(`${String.fromCharCode(64 + row)}${seat}`) || 
                    temporaryLocks.has(`${String.fromCharCode(64 + row)}${seat}`),
        });
      }
      seats.push(rowSeats);
    }
    return seats;
  };

  const [seats] = useState(generateSeats);

  // Handle seat selection
  const handleSeatClick = (seatId, seatData) => {
    if (seatData.isBooked || seatData.isLocked) return;

    let newSelectedSeats;
    if (selectedSeats.includes(seatId)) {
      // Deselect seat
      newSelectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
      // Select seat (check max limit)
      if (selectedSeats.length >= maxSelection) {
        return; // Max selection reached
      }
      newSelectedSeats = [...selectedSeats, seatId];
    }

    setSelectedSeats(newSelectedSeats);
    onSeatSelect && onSeatSelect(newSelectedSeats);
  };

  // Simulate real-time seat locking (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 3 seconds
        const availableSeats = seats.flat().filter(seat => 
          !seat.isBooked && !seat.isLocked && !selectedSeats.includes(seat.id)
        );
        if (availableSeats.length > 0) {
          const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
          setTemporaryLocks(prev => new Set([...prev, randomSeat.id]));
          
          // Remove lock after 10 seconds
          setTimeout(() => {
            setTemporaryLocks(prev => {
              const newLocks = new Set(prev);
              newLocks.delete(randomSeat.id);
              return newLocks;
            });
          }, 10000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [seats, selectedSeats]);

  const getSeatClassName = (seatData) => {
    const baseClasses = 'w-8 h-8 m-1 rounded-md border-2 text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110';
    
    if (seatData.isBooked) {
      return `${baseClasses} bg-gray-400 border-gray-500 text-white cursor-not-allowed`;
    }
    
    if (seatData.isLocked) {
      return `${baseClasses} bg-warning border-yellow-500 text-white cursor-not-allowed animate-pulse`;
    }
    
    if (selectedSeats.includes(seatData.id)) {
      return `${baseClasses} bg-primary-main border-primary-dark text-white shadow-lg`;
    }
    
    return `${baseClasses} bg-white border-gray-300 text-text-primary hover:border-primary-main hover:bg-primary-light hover:bg-opacity-20`;
  };

  return (
    <div className={`bg-white rounded-xl p-6 ${className}`}>
      {/* Screen */}
      <div className="mb-8">
        <div className="bg-gray-800 text-white text-center py-2 rounded-lg mb-2">
          <span className="text-sm font-medium">SCREEN</span>
        </div>
        <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded"></div>
      </div>

      {/* Seat Layout */}
      <div className="flex flex-col items-center space-y-2 mb-6">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center space-x-2">
            {/* Row Label */}
            <div className="w-8 text-center font-semibold text-text-secondary">
              {String.fromCharCode(65 + rowIndex)}
            </div>
            
            {/* Left Section */}
            <div className="flex">
              {row.slice(0, Math.floor(seatsPerRow / 2)).map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id, seat)}
                  className={getSeatClassName(seat)}
                  disabled={seat.isBooked || seat.isLocked}
                  title={`Seat ${seat.id} - ${seat.isBooked ? 'Booked' : seat.isLocked ? 'Temporarily Locked' : 'Available'}`}
                >
                  {seat.seat}
                </button>
              ))}
            </div>
            
            {/* Aisle */}
            <div className="w-8"></div>
            
            {/* Right Section */}
            <div className="flex">
              {row.slice(Math.floor(seatsPerRow / 2)).map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id, seat)}
                  className={getSeatClassName(seat)}
                  disabled={seat.isBooked || seat.isLocked}
                  title={`Seat ${seat.id} - ${seat.isBooked ? 'Booked' : seat.isLocked ? 'Temporarily Locked' : 'Available'}`}
                >
                  {seat.seat}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
            <span className="text-text-secondary">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-main border-2 border-primary-dark rounded"></div>
            <span className="text-text-secondary">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 border-2 border-gray-500 rounded"></div>
            <span className="text-text-secondary">Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-warning border-2 border-yellow-500 rounded"></div>
            <span className="text-text-secondary">Temporarily Locked</span>
          </div>
        </div>
      )}

      {/* Selection Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-text-secondary">
          Selected: {selectedSeats.length} of {maxSelection} seats
        </p>
        {selectedSeats.length > 0 && (
          <p className="text-sm text-primary-main font-medium mt-1">
            Seats: {selectedSeats.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

SeatSelector.propTypes = {
  rows: PropTypes.number,
  seatsPerRow: PropTypes.number,
  bookedSeats: PropTypes.arrayOf(PropTypes.string),
  lockedSeats: PropTypes.arrayOf(PropTypes.string),
  onSeatSelect: PropTypes.func,
  maxSelection: PropTypes.number,
  className: PropTypes.string,
  showLegend: PropTypes.bool,
};

export default SeatSelector;