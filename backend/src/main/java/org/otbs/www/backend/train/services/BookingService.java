package org.otbs.www.backend.train.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.services.EmailService;
import org.otbs.www.backend.services.PdfService;
import org.otbs.www.backend.train.models.Booking;
import org.otbs.www.backend.train.models.Train;
import org.otbs.www.backend.train.repositories.BookingRepository;
import org.otbs.www.backend.train.repositories.TrainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private Validator validator;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private EmailService emailService;

    /**
     * Book train tickets
     */
    public ResponseEntity<Object> bookTrainTickets(Booking bookingRequest, Users user) {
        System.out.println("=== BOOKING REQUEST DEBUG ===");
        System.out.println("Booking request: " + bookingRequest);
        System.out.println("Train ID: " + (bookingRequest.getTrain() != null ? bookingRequest.getTrain().getId() : "NULL"));
        System.out.println("User: " + user);
        
        // Check if train exists and is available
        Optional<Train> optionalTrain = trainRepository.findById(bookingRequest.getTrain().getId());
        System.out.println("Train found: " + optionalTrain.isPresent());
        
        if (optionalTrain.isEmpty()) {
            System.out.println("Train not found in database with ID: " + bookingRequest.getTrain().getId());
            return ResponseEntity.notFound().build();
        }

        Train train = optionalTrain.get();
        System.out.println("Train details: " + train.getTrainName() + " - " + train.getTrainNumber());
        
        // Validate train availability
        if (train.getStatus() != Train.TrainStatus.ACTIVE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Train is not available for booking"));
        }

        // Check seat availability
        if (!train.hasSeatsAvailable(bookingRequest.getNumberOfSeats())) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Not enough seats available",
                "availableSeats", train.getAvailableSeats(),
                "requestedSeats", bookingRequest.getNumberOfSeats()
            ));
        }

        // Check if departure time is in the future
        if (train.getDepartureTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot book tickets for past trains"));
        }

        // Set required fields before validation
        BigDecimal totalAmount = train.getPrice().multiply(BigDecimal.valueOf(bookingRequest.getNumberOfSeats()));
        bookingRequest.setTotalAmount(totalAmount);
        bookingRequest.setUser(user);
        bookingRequest.setStatus(Booking.BookingStatus.CONFIRMED);

        // Validate booking data after setting required fields
        Set<ConstraintViolation<Booking>> violations = validator.validate(bookingRequest);
        if (!violations.isEmpty()) {
            Map<String, String> errors = violations.stream()
                    .collect(Collectors.toMap(
                            violation -> violation.getPropertyPath().toString(),
                            ConstraintViolation::getMessage
                    ));
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        // Save booking
        Booking savedBooking = bookingRepository.save(bookingRequest);

        // Update train's available seats
        train.setAvailableSeats(train.getAvailableSeats() - bookingRequest.getNumberOfSeats());
        train.setUpdatedAt(LocalDateTime.now());
        trainRepository.save(train);

        // Send booking confirmation email
        try {
            emailService.sendBookingConfirmation(
                savedBooking.getPassengerEmail(),
                savedBooking.getPassengerName(),
                savedBooking.getBookingReference(),
                train.getTrainName(),
                train.getTrainNumber(),
                train.getSourceStation(),
                train.getDestinationStation(),
                train.getDepartureTime().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")),
                train.getArrivalTime().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")),
                savedBooking.getNumberOfSeats(),
                "₹" + savedBooking.getTotalAmount()
            );
        } catch (Exception e) {
            // Log error but don't fail the booking
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tickets booked successfully");
        response.put("bookingReference", savedBooking.getBookingReference());
        
        // Create a simplified booking object to avoid JSON serialization issues
        Map<String, Object> bookingInfo = new HashMap<>();
        bookingInfo.put("id", savedBooking.getId());
        bookingInfo.put("passengerName", savedBooking.getPassengerName());
        bookingInfo.put("passengerEmail", savedBooking.getPassengerEmail());
        bookingInfo.put("numberOfSeats", savedBooking.getNumberOfSeats());
        bookingInfo.put("totalAmount", savedBooking.getTotalAmount());
        bookingInfo.put("status", savedBooking.getStatus().toString());
        bookingInfo.put("bookingDate", savedBooking.getBookingDate());
        
        response.put("booking", bookingInfo);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get user's bookings
     */
    public ResponseEntity<Object> getUserBookings(Users user) {
        List<Booking> bookings = bookingRepository.findByUserWithTrainOrderByBookingDateDesc(user);
        
        // Convert to DTOs to avoid lazy loading issues
        List<Map<String, Object>> bookingDTOs = bookings.stream().map(booking -> {
            Map<String, Object> bookingDTO = new HashMap<>();
            bookingDTO.put("id", booking.getId());
            bookingDTO.put("passengerName", booking.getPassengerName());
            bookingDTO.put("passengerEmail", booking.getPassengerEmail());
            bookingDTO.put("passengerPhone", booking.getPassengerPhone());
            bookingDTO.put("numberOfSeats", booking.getNumberOfSeats());
            bookingDTO.put("totalAmount", booking.getTotalAmount());
            bookingDTO.put("status", booking.getStatus().toString());
            bookingDTO.put("bookingReference", booking.getBookingReference());
            bookingDTO.put("bookingDate", booking.getBookingDate());
            bookingDTO.put("updatedAt", booking.getUpdatedAt());
            
            // Create train DTO
            if (booking.getTrain() != null) {
                Map<String, Object> trainDTO = new HashMap<>();
                trainDTO.put("id", booking.getTrain().getId());
                trainDTO.put("trainName", booking.getTrain().getTrainName());
                trainDTO.put("trainNumber", booking.getTrain().getTrainNumber());
                trainDTO.put("sourceStation", booking.getTrain().getSourceStation());
                trainDTO.put("destinationStation", booking.getTrain().getDestinationStation());
                trainDTO.put("departureTime", booking.getTrain().getDepartureTime());
                trainDTO.put("arrivalTime", booking.getTrain().getArrivalTime());
                trainDTO.put("totalSeats", booking.getTrain().getTotalSeats());
                trainDTO.put("availableSeats", booking.getTrain().getAvailableSeats());
                trainDTO.put("price", booking.getTrain().getPrice());
                trainDTO.put("trainClass", booking.getTrain().getTrainClass().toString());
                trainDTO.put("status", booking.getTrain().getStatus().toString());
                bookingDTO.put("train", trainDTO);
            }
            
            return bookingDTO;
        }).collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bookings found: " + bookingDTOs.size());
        response.put("bookings", bookingDTOs);
        return ResponseEntity.ok(response);
    }

    /**
     * Get booking by reference
     */
    public ResponseEntity<Object> getBookingByReference(String bookingReference) {
        Optional<Booking> booking = bookingRepository.findByBookingReference(bookingReference);
        if (booking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(Map.of("booking", booking.get()));
    }

    /**
     * Get booking by ID
     */
    public ResponseEntity<Object> getBookingById(Integer bookingId) {
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        if (booking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(Map.of("booking", booking.get()));
    }

    /**
     * Cancel booking
     */
    public ResponseEntity<Object> cancelBooking(Integer bookingId, Users user) {
        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = optionalBooking.get();

        // Check if user owns this booking
        if (!booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You can only cancel your own bookings"));
        }

        // Check if booking can be cancelled
        if (!booking.canBeCancelled()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Booking cannot be cancelled. Cancellation must be done at least 24 hours before departure"));
        }

        // Check if booking is already cancelled
        if (booking.isCancelled()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Booking is already cancelled"));
        }

        // Update booking status
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);

        // Restore train seats
        Train train = booking.getTrain();
        train.setAvailableSeats(train.getAvailableSeats() + booking.getNumberOfSeats());
        train.setUpdatedAt(LocalDateTime.now());
        trainRepository.save(train);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully");
        response.put("booking", savedBooking);
        response.put("refundAmount", savedBooking.getTotalAmount());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get user's booking by status
     */
    public ResponseEntity<Object> getUserBookingsByStatus(Users user, Booking.BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByUserAndStatusOrderByBookingDateDesc(user, status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", status + " bookings found: " + bookings.size());
        response.put("bookings", bookings);
        return ResponseEntity.ok(response);
    }

    /**
     * Search bookings by passenger details
     */
    public ResponseEntity<Object> searchBookingsByPassenger(String passengerEmail, String passengerPhone) {
        List<Booking> bookings;
        
        if (passengerEmail != null && !passengerEmail.trim().isEmpty()) {
            bookings = bookingRepository.findByPassengerEmailOrderByBookingDateDesc(passengerEmail);
        } else if (passengerPhone != null && !passengerPhone.trim().isEmpty()) {
            bookings = bookingRepository.findByPassengerPhoneOrderByBookingDateDesc(passengerPhone);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Either passenger email or phone is required"));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bookings found: " + bookings.size());
        response.put("bookings", bookings);
        return ResponseEntity.ok(response);
    }

    /**
     * Get booking statistics for admin
     */
    public ResponseEntity<Object> getBookingStatistics() {
        long totalBookings = bookingRepository.count();
        long confirmedBookings = bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED);
        long cancelledBookings = bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED);
        
        // Get recent bookings (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Booking> recentBookings = bookingRepository.findRecentBookings(thirtyDaysAgo);
        
        // Calculate total revenue (last 30 days)
        LocalDateTime startOfMonth = LocalDateTime.now().minusDays(30);
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue(startOfMonth, LocalDateTime.now());
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalBookings", totalBookings);
        response.put("confirmedBookings", confirmedBookings);
        response.put("cancelledBookings", cancelledBookings);
        response.put("recentBookings", recentBookings.size());
        response.put("totalRevenue", totalRevenue);
        response.put("period", "Last 30 days");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all bookings (Admin only)
     */
    public ResponseEntity<Object> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Total bookings: " + bookings.size());
        response.put("bookings", bookings);
        return ResponseEntity.ok(response);
    }

    /**
     * Get bookings by status (Admin only)
     */
    public ResponseEntity<Object> getBookingsByStatus(Booking.BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByStatusOrderByBookingDateDesc(status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", status + " bookings: " + bookings.size());
        response.put("bookings", bookings);
        return ResponseEntity.ok(response);
    }

    /**
     * Get bookings by train (Admin only)
     */
    public ResponseEntity<Object> getBookingsByTrain(Integer trainId) {
        Optional<Train> optionalTrain = trainRepository.findById(trainId);
        if (optionalTrain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Booking> bookings = bookingRepository.findByTrainOrderByBookingDateDesc(optionalTrain.get());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bookings for train: " + bookings.size());
        response.put("train", optionalTrain.get());
        response.put("bookings", bookings);
        return ResponseEntity.ok(response);
    }

    /**
     * Process refund for cancelled booking (Admin only)
     */
    public ResponseEntity<Object> processRefund(Integer bookingId) {
        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = optionalBooking.get();

        if (booking.getStatus() != Booking.BookingStatus.CANCELLED) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only cancelled bookings can be refunded"));
        }

        // Update booking status to refunded
        booking.setStatus(Booking.BookingStatus.REFUNDED);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Refund processed successfully");
        response.put("booking", savedBooking);
        response.put("refundAmount", savedBooking.getTotalAmount());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get bookings that can be cancelled
     */
    public ResponseEntity<Object> getCancellableBookings() {
        LocalDateTime cutoffTime = LocalDateTime.now().plusHours(24);
        List<Booking> cancellableBookings = bookingRepository.findCancellableBookings(cutoffTime);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cancellable bookings: " + cancellableBookings.size());
        response.put("bookings", cancellableBookings);
        return ResponseEntity.ok(response);
    }

    /**
     * Get revenue report for a date range
     */
    public ResponseEntity<Object> getRevenueReport(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Start date must be before end date"));
        }

        List<Booking> revenueBookings = bookingRepository.findRevenueBookings(startDate, endDate);
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue(startDate, endDate);
        
        Map<String, Object> response = new HashMap<>();
        response.put("startDate", startDate);
        response.put("endDate", endDate);
        response.put("totalBookings", revenueBookings.size());
        response.put("totalRevenue", totalRevenue);
        response.put("bookings", revenueBookings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Generate PDF ticket for booking
     */
    public ResponseEntity<byte[]> generateTicketPdf(Integer bookingId, Users user) {
        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = optionalBooking.get();

        // Check if user owns this booking
        if (!booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            byte[] pdfBytes = pdfService.generateTrainTicket(booking);
            
            return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=train-ticket-" + booking.getBookingReference() + ".pdf")
                .body(pdfBytes);
        } catch (Exception e) {
            System.err.println("Failed to generate PDF ticket: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
