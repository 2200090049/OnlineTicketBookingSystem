package org.otbs.www.backend.train.controllers;

import java.time.LocalDateTime;
import java.util.Map;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.train.models.Booking;
import org.otbs.www.backend.train.services.BookingService;
import org.otbs.www.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private JwtUtil jwtUtil;

    // User endpoints

    /**
     * Book train tickets
     * POST /api/bookings/book
     */
    @PostMapping("/book")
    public ResponseEntity<Object> bookTrainTickets(@RequestBody Booking bookingRequest,
                                                 @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return bookingService.bookTrainTickets(bookingRequest, user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get user's bookings
     * GET /api/bookings/my-bookings
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<Object> getMyBookings(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return bookingService.getUserBookings(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get booking by reference
     * GET /api/bookings/reference/{bookingReference}
     */
    @GetMapping("/reference/{bookingReference}")
    public ResponseEntity<Object> getBookingByReference(@PathVariable String bookingReference) {
        return bookingService.getBookingByReference(bookingReference);
    }

    /**
     * Get booking by ID
     * GET /api/bookings/{bookingId}
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<Object> getBookingById(@PathVariable Integer bookingId,
                                               @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return bookingService.getBookingById(bookingId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Cancel booking
     * PUT /api/bookings/cancel/{bookingId}
     */
    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<Object> cancelBooking(@PathVariable Integer bookingId,
                                             @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return bookingService.cancelBooking(bookingId, user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get user's bookings by status
     * GET /api/bookings/my-bookings/status/{status}
     */
    @GetMapping("/my-bookings/status/{status}")
    public ResponseEntity<Object> getMyBookingsByStatus(@PathVariable String status,
                                                      @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            return bookingService.getUserBookingsByStatus(user, bookingStatus);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid booking status"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Search bookings by passenger details (for users to find their bookings)
     * GET /api/bookings/search/passenger
     */
    @GetMapping("/search/passenger")
    public ResponseEntity<Object> searchBookingsByPassenger(@RequestParam(required = false) String passengerEmail,
                                                          @RequestParam(required = false) String passengerPhone) {
        return bookingService.searchBookingsByPassenger(passengerEmail, passengerPhone);
    }

    /**
     * Get cancellable bookings for user
     * GET /api/bookings/cancellable
     */
    @GetMapping("/cancellable")
    public ResponseEntity<Object> getCancellableBookings(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            // This would typically filter by user, but for now returning all cancellable bookings
            return bookingService.getCancellableBookings();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    // Admin endpoints

    /**
     * Get all bookings (Admin only)
     * GET /api/bookings/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<Object> getAllBookings(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin role required."));
            }
            return bookingService.getAllBookings();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get all train bookings (Train Vendor only)
     * GET /api/bookings/vendor/all
     */
    @GetMapping("/vendor/all")
    public ResponseEntity<Object> getAllTrainBookings(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            // Check if user is a vendor with TRAIN_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"TRAIN_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Train vendor access required."));
                }
            }
            return bookingService.getAllBookings();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get bookings by status (Admin only)
     * GET /api/bookings/admin/status/{status}
     */
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<Object> getBookingsByStatus(@PathVariable String status,
                                                    @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin role required."));
            }
            
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            return bookingService.getBookingsByStatus(bookingStatus);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid booking status"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get bookings by train (Admin only)
     * GET /api/bookings/admin/train/{trainId}
     */
    @GetMapping("/admin/train/{trainId}")
    public ResponseEntity<Object> getBookingsByTrain(@PathVariable Integer trainId,
                                                   @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin role required."));
            }
            return bookingService.getBookingsByTrain(trainId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Process refund for cancelled booking (Admin only)
     * PUT /api/bookings/admin/refund/{bookingId}
     */
    @PutMapping("/admin/refund/{bookingId}")
    public ResponseEntity<Object> processRefund(@PathVariable Integer bookingId,
                                             @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin role required."));
            }
            return bookingService.processRefund(bookingId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get booking statistics (Admin only)
     * GET /api/bookings/admin/statistics
     */
    @GetMapping("/admin/statistics")
    public ResponseEntity<Object> getBookingStatistics(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin role required."));
            }
            return bookingService.getBookingStatistics();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get revenue report (Admin only)
     * GET /api/bookings/admin/revenue-report
     */
    @GetMapping("/admin/revenue-report")
    public ResponseEntity<Object> getRevenueReport(@RequestParam String startDate,
                                                @RequestParam String endDate,
                                                @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin role required."));
            }
            
            LocalDateTime startDateTime = LocalDateTime.parse(startDate);
            LocalDateTime endDateTime = LocalDateTime.parse(endDate);
            return bookingService.getRevenueReport(startDateTime, endDateTime);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid date format or token"));
        }
    }

    /**
     * Get booking statuses
     * GET /api/bookings/statuses
     */
    @GetMapping("/statuses")
    public ResponseEntity<Object> getBookingStatuses() {
        return ResponseEntity.ok(Map.of(
            "bookingStatuses", Booking.BookingStatus.values(),
            "message", "Available booking statuses"
        ));
    }

    /**
     * Get booking summary for user
     * GET /api/bookings/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Object> getBookingSummary(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Get user's booking counts by status
            ResponseEntity<Object> confirmedResponse = bookingService.getUserBookingsByStatus(user, Booking.BookingStatus.CONFIRMED);
            ResponseEntity<Object> cancelledResponse = bookingService.getUserBookingsByStatus(user, Booking.BookingStatus.CANCELLED);
            
            Map<String, Object> confirmedData = (Map<String, Object>) confirmedResponse.getBody();
            Map<String, Object> cancelledData = (Map<String, Object>) cancelledResponse.getBody();
            
            int confirmedCount = confirmedData != null ? ((java.util.List<?>) confirmedData.get("bookings")).size() : 0;
            int cancelledCount = cancelledData != null ? ((java.util.List<?>) cancelledData.get("bookings")).size() : 0;
            
            return ResponseEntity.ok(Map.of(
                "totalBookings", confirmedCount + cancelledCount,
                "confirmedBookings", confirmedCount,
                "cancelledBookings", cancelledCount,
                "message", "Booking summary"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Download PDF ticket for booking
     * GET /api/bookings/{bookingId}/download
     */
    @GetMapping("/{bookingId}/download")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Integer bookingId,
                                               @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return bookingService.generateTicketPdf(bookingId, user);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
