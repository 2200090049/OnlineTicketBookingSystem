package org.otbs.www.backend.bus.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.otbs.www.backend.bus.models.Bus;
import org.otbs.www.backend.bus.models.BusBooking;
import org.otbs.www.backend.bus.repositories.BusBookingRepository;
import org.otbs.www.backend.bus.repositories.BusRepository;
import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
@Transactional
public class BusBookingService {

    @Autowired
    private BusBookingRepository busBookingRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private Validator validator;

    /**
     * Create a new bus booking
     */
    public ResponseEntity<Object> createBooking(BusBooking booking) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate the booking entity
            Set<ConstraintViolation<BusBooking>> violations = validator.validate(booking);
            if (!violations.isEmpty()) {
                Map<String, String> errors = violations.stream()
                    .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage
                    ));
                response.put("message", "Validation failed");
                response.put("errors", errors);
                return ResponseEntity.badRequest().body(response);
            }

            // Verify bus exists and is available
            Optional<Bus> busOpt = busRepository.findById(booking.getBus().getId());
            if (!busOpt.isPresent()) {
                response.put("message", "Bus not found");
                return ResponseEntity.badRequest().body(response);
            }

            Bus bus = busOpt.get();
            
            // Check if bus is active and departure is in future
            if (bus.getStatus() != Bus.BusStatus.ACTIVE) {
                response.put("message", "Bus is not available for booking");
                return ResponseEntity.badRequest().body(response);
            }

            if (bus.getDepartureTime().isBefore(LocalDateTime.now().plusMinutes(30))) {
                response.put("message", "Booking not allowed. Bus departure is within 30 minutes");
                return ResponseEntity.badRequest().body(response);
            }

            // Verify user exists
            Optional<Users> userOpt = userRepository.findById(booking.getUser().getId());
            if (!userOpt.isPresent()) {
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            Users user = userOpt.get();

            // Check seat availability
            if (!bus.canBookSeats(booking.getNumberOfSeats())) {
                response.put("message", "Requested seats not available");
                response.put("availableSeats", bus.getAvailableSeats());
                return ResponseEntity.badRequest().body(response);
            }

            // Check for duplicate booking
            List<BusBooking> existingBookings = busBookingRepository.findByUserAndStatusOrderByBookingDateDesc(
                user, BusBooking.BookingStatus.CONFIRMED);
            boolean hasDuplicateBooking = existingBookings.stream()
                .anyMatch(b -> b.getBus().getId().equals(bus.getId()));
            if (hasDuplicateBooking) {
                response.put("message", "You already have a confirmed booking for this bus");
                return ResponseEntity.badRequest().body(response);
            }

            // Set booking details
            booking.setBus(bus);
            booking.setUser(user);
            booking.setBookingDate(LocalDateTime.now());
            booking.setStatus(BusBooking.BookingStatus.CONFIRMED);
            booking.setBookingReference(generateBookingReference());

            // Calculate total amount
            BigDecimal totalAmount = bus.getPrice().multiply(new BigDecimal(booking.getNumberOfSeats()));
            booking.setTotalAmount(totalAmount);

            // Save booking
            BusBooking savedBooking = busBookingRepository.save(booking);

            // Update available seats
            bus.setAvailableSeats(bus.getAvailableSeats() - booking.getNumberOfSeats());
            busRepository.save(bus);

            response.put("message", "Booking created successfully");
            response.put("booking", savedBooking);
            response.put("bookingReference", savedBooking.getBookingReference());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to create booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Cancel a booking
     */
    public ResponseEntity<Object> cancelBooking(Integer bookingId, Integer userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<BusBooking> bookingOpt = busBookingRepository.findById(bookingId);
            if (!bookingOpt.isPresent()) {
                response.put("message", "Booking not found");
                return ResponseEntity.notFound().build();
            }

            BusBooking booking = bookingOpt.get();

            // Verify booking belongs to user
            if (!booking.getUser().getId().equals(userId)) {
                response.put("message", "Unauthorized to cancel this booking");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Check if booking can be cancelled
            if (booking.getStatus() == BusBooking.BookingStatus.CANCELLED) {
                response.put("message", "Booking is already cancelled");
                return ResponseEntity.badRequest().body(response);
            }

            if (booking.getStatus() == BusBooking.BookingStatus.COMPLETED) {
                response.put("message", "Cannot cancel completed booking");
                return ResponseEntity.badRequest().body(response);
            }

            // Check if cancellation is allowed (at least 2 hours before departure)
            if (booking.getBus().getDepartureTime().isBefore(LocalDateTime.now().plusHours(2))) {
                response.put("message", "Cancellation not allowed. Less than 2 hours before departure");
                return ResponseEntity.badRequest().body(response);
            }

            // Calculate refund amount
            BigDecimal refundAmount = booking.calculateRefundAmount();

            // Update booking status
            booking.setStatus(BusBooking.BookingStatus.CANCELLED);
            booking.setCancellationDate(LocalDateTime.now());
            booking.setRefundAmount(refundAmount);

            BusBooking savedBooking = busBookingRepository.save(booking);

            // Update available seats
            Bus bus = booking.getBus();
            bus.setAvailableSeats(bus.getAvailableSeats() + booking.getNumberOfSeats());
            busRepository.save(bus);

            response.put("message", "Booking cancelled successfully");
            response.put("booking", savedBooking);
            response.put("refundAmount", refundAmount);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to cancel booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get booking by ID
     */
    public ResponseEntity<Object> getBookingById(Integer bookingId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<BusBooking> bookingOpt = busBookingRepository.findById(bookingId);
            if (!bookingOpt.isPresent()) {
                response.put("message", "Booking not found");
                return ResponseEntity.notFound().build();
            }

            BusBooking booking = bookingOpt.get();
            response.put("message", "Booking retrieved successfully");
            response.put("booking", booking);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to retrieve booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get booking by reference number
     */
    public ResponseEntity<Object> getBookingByReference(String bookingReference) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<BusBooking> bookingOpt = busBookingRepository.findByBookingReference(bookingReference);
            if (!bookingOpt.isPresent()) {
                response.put("message", "Booking not found");
                return ResponseEntity.notFound().build();
            }

            BusBooking booking = bookingOpt.get();
            response.put("message", "Booking retrieved successfully");
            response.put("booking", booking);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to retrieve booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get user bookings
     */
    public ResponseEntity<Object> getUserBookings(Integer userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Users> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            List<BusBooking> bookings = busBookingRepository.findByUserOrderByBookingDateDesc(userOpt.get());
            
            response.put("message", "User bookings retrieved successfully");
            response.put("bookings", bookings);
            response.put("count", bookings.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to retrieve user bookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get user active bookings
     */
    public ResponseEntity<Object> getUserActiveBookings(Integer userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Users> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            List<BusBooking> bookings = busBookingRepository.findByUserAndStatusOrderByBookingDateDesc(
                userOpt.get(), BusBooking.BookingStatus.CONFIRMED);
            
            response.put("message", "User active bookings retrieved successfully");
            response.put("bookings", bookings);
            response.put("count", bookings.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to retrieve user active bookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all bookings (Admin)
     */
    public ResponseEntity<Object> getAllBookings() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<BusBooking> bookings = busBookingRepository.findAll();
            
            response.put("message", "All bookings retrieved successfully");
            response.put("bookings", bookings);
            response.put("count", bookings.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to retrieve all bookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get bookings by bus (Admin)
     */
    public ResponseEntity<Object> getBookingsByBus(Integer busId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Bus> busOpt = busRepository.findById(busId);
            if (!busOpt.isPresent()) {
                response.put("message", "Bus not found");
                return ResponseEntity.notFound().build();
            }
            
            List<BusBooking> bookings = busBookingRepository.findByBusOrderByBookingDateDesc(busOpt.get());
            
            response.put("message", "Bus bookings retrieved successfully");
            response.put("bookings", bookings);
            response.put("count", bookings.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to retrieve bus bookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get booking statistics
     */
    public ResponseEntity<Object> getBookingStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Basic statistics
            Long totalBookings = busBookingRepository.count();
            Long confirmedBookings = busBookingRepository.countBookingsByStatus(BusBooking.BookingStatus.CONFIRMED);
            Long cancelledBookings = busBookingRepository.countBookingsByStatus(BusBooking.BookingStatus.CANCELLED);
            Long completedBookings = busBookingRepository.countBookingsByStatus(BusBooking.BookingStatus.COMPLETED);

            // Revenue statistics
            BigDecimal totalRevenue = busBookingRepository.calculateTotalRevenue();

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalBookings", totalBookings);
            statistics.put("confirmedBookings", confirmedBookings);
            statistics.put("cancelledBookings", cancelledBookings);
            statistics.put("completedBookings", completedBookings);
            statistics.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

            response.put("message", "Booking statistics retrieved successfully");
            response.put("statistics", statistics);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to retrieve booking statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }



    /**
     * Update booking status (Admin)
     */
    public ResponseEntity<Object> updateBookingStatus(Integer bookingId, BusBooking.BookingStatus status) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<BusBooking> bookingOpt = busBookingRepository.findById(bookingId);
            if (!bookingOpt.isPresent()) {
                response.put("message", "Booking not found");
                return ResponseEntity.notFound().build();
            }

            BusBooking booking = bookingOpt.get();
            BusBooking.BookingStatus oldStatus = booking.getStatus();
            booking.setStatus(status);

            // Handle status-specific logic
            if (status == BusBooking.BookingStatus.CANCELLED && oldStatus != BusBooking.BookingStatus.CANCELLED) {
                booking.setCancellationDate(LocalDateTime.now());
                booking.setRefundAmount(booking.calculateRefundAmount());
                
                // Return seats to bus
                Bus bus = booking.getBus();
                bus.setAvailableSeats(bus.getAvailableSeats() + booking.getNumberOfSeats());
                busRepository.save(bus);
            }

            BusBooking savedBooking = busBookingRepository.save(booking);
            
            response.put("message", "Booking status updated successfully");
            response.put("booking", savedBooking);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to update booking status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get passenger manifest for a bus
     */
    public ResponseEntity<Object> getPassengerManifest(Integer busId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Bus> busOpt = busRepository.findById(busId);
            if (!busOpt.isPresent()) {
                response.put("message", "Bus not found");
                return ResponseEntity.notFound().build();
            }
            
            List<BusBooking> bookings = busBookingRepository.findByBusAndStatusOrderByBookingDateDesc(
                busOpt.get(), BusBooking.BookingStatus.CONFIRMED);
            
            List<Map<String, Object>> passengers = bookings.stream()
                .map(booking -> {
                    Map<String, Object> passenger = new HashMap<>();
                    passenger.put("bookingId", booking.getId());
                    passenger.put("bookingReference", booking.getBookingReference());
                    passenger.put("passengerName", booking.getPassengerName());
                    passenger.put("passengerAge", booking.getPassengerAge());
                    passenger.put("gender", booking.getPassengerGender());
                    passenger.put("phoneNumber", booking.getPassengerPhone());
                    passenger.put("seatNumbers", booking.getSeatNumbers());
                    passenger.put("numberOfSeats", booking.getNumberOfSeats());
                    return passenger;
                })
                .collect(Collectors.toList());

            response.put("message", "Passenger manifest retrieved successfully");
            response.put("passengers", passengers);
            response.put("totalPassengers", passengers.size());
            response.put("busId", busId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to retrieve passenger manifest: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Process refund
     */
    public ResponseEntity<Object> processRefund(Integer bookingId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<BusBooking> bookingOpt = busBookingRepository.findById(bookingId);
            if (!bookingOpt.isPresent()) {
                response.put("message", "Booking not found");
                return ResponseEntity.notFound().build();
            }

            BusBooking booking = bookingOpt.get();
            
            if (booking.getStatus() != BusBooking.BookingStatus.CANCELLED) {
                response.put("message", "Only cancelled bookings can be refunded");
                return ResponseEntity.badRequest().body(response);
            }

            if (booking.getRefundAmount() == null || booking.getRefundAmount().compareTo(BigDecimal.ZERO) <= 0) {
                response.put("message", "No refund amount available");
                return ResponseEntity.badRequest().body(response);
            }

            // Here you would integrate with payment gateway for refund processing
            // For now, we'll just update the booking record
            BusBooking savedBooking = busBookingRepository.save(booking);
            
            response.put("message", "Refund processed successfully");
            response.put("booking", savedBooking);
            response.put("refundAmount", booking.getRefundAmount());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("message", "Failed to process refund: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Generate unique booking reference
     */
    private String generateBookingReference() {
        String prefix = "BUS";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + "-" + timestamp.substring(timestamp.length() - 6) + "-" + uuid;
    }

    /**
     * Validate booking before creating
     */
    private boolean validateBookingData(BusBooking booking, Map<String, Object> response) {
        // Additional business logic validations
        if (booking.getNumberOfSeats() <= 0 || booking.getNumberOfSeats() > 10) {
            response.put("message", "Number of seats must be between 1 and 10");
            return false;
        }

        if (booking.getPassengerAge() < 1 || booking.getPassengerAge() > 120) {
            response.put("message", "Invalid passenger age");
            return false;
        }

        if (booking.getPassengerPhone() == null || booking.getPassengerPhone().trim().isEmpty()) {
            response.put("message", "Phone number is required");
            return false;
        }

        return true;
    }
}