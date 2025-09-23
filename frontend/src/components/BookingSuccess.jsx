import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, DocumentArrowDownIcon, HomeIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import Card from './Card';

const BookingSuccess = ({ bookingDetails, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleDownloadTicket = async () => {
    if (bookingDetails && bookingDetails.bookingId) {
      try {
        const { bookingsAPI } = await import('../services/api');
        const response = await bookingsAPI.downloadTicket(bookingDetails.bookingId);
        
        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `train-ticket-${bookingDetails.bookingId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading ticket:', error);
        alert('Failed to download ticket. Please try again.');
      }
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewBookings = () => {
    navigate('/user/dashboard');
  };

  return (
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

          {bookingDetails && (
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
          )}

          <div className="space-y-3">
            <Button
              onClick={handleDownloadTicket}
              className="w-full flex items-center justify-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Download Ticket Again</span>
            </Button>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleViewBookings}
                className="flex-1"
              >
                View My Bookings
              </Button>
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BookingSuccess;
