package org.otbs.www.backend.bus.controllers;

import java.util.Map;

import org.otbs.www.backend.bus.models.BusBooking;
import org.otbs.www.backend.bus.services.BusBookingService;
import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.services.PdfService;
import org.otbs.www.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
@RequestMapping("/api/bus-bookings")
@CrossOrigin(origins = "*")
public class BusBookingController {

    @Autowired
    private BusBookingService busBookingService;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private JwtUtil jwtUtil;

    // User endpoints

    /**
     * Book bus tickets
     * POST /api/bus-bookings/book
     */
    @PostMapping("/book")
    public ResponseEntity<Object> bookBusTickets(@RequestBody BusBooking bookingRequest,
                                               @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            // Set the user for the booking
            bookingRequest.setUser(user);
            return busBookingService.createBooking(bookingRequest);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Cancel a booking
     * PUT /api/bus-bookings/{bookingId}/cancel
     */
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<Object> cancelBooking(@PathVariable Integer bookingId,
                                              @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return busBookingService.cancelBooking(bookingId, user.getId());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get booking by ID
     * GET /api/bus-bookings/{bookingId}
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<Object> getBookingById(@PathVariable Integer bookingId,
                                               @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return busBookingService.getBookingById(bookingId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get booking by reference number
     * GET /api/bus-bookings/reference/{bookingReference}
     */
    @GetMapping("/reference/{bookingReference}")
    public ResponseEntity<Object> getBookingByReference(@PathVariable String bookingReference) {
        return busBookingService.getBookingByReference(bookingReference);
    }

    /**
     * Get user's bookings
     * GET /api/bus-bookings/my-bookings
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<Object> getUserBookings(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return busBookingService.getUserBookings(user.getId());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get user's active bookings
     * GET /api/bus-bookings/my-bookings/active
     */
    @GetMapping("/my-bookings/active")
    public ResponseEntity<Object> getUserActiveBookings(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return busBookingService.getUserActiveBookings(user.getId());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Download ticket as PDF
     * GET /api/bus-bookings/{bookingId}/download
     */
    @GetMapping("/{bookingId}/download")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Integer bookingId,
                                               @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Get the booking directly from service
            BusBooking booking = busBookingService.getBookingEntityById(bookingId);
            
            // Check if booking exists
            if (booking == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verify booking belongs to user
            if (!booking.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
            
            // Generate PDF
            byte[] pdfData = pdfService.generateBusTicket(booking);
            
            // Set appropriate headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "bus-ticket-" + booking.getBookingReference() + ".pdf");
            headers.setContentLength(pdfData.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfData);
                    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Admin endpoints

    /**
     * Get all bookings (Admin only)
     * GET /api/bus-bookings/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<Object> getAllBookings(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is a vendor with BUSES_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"BUSES_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN vendor type or ADMIN role."));
                }
            }
            
            return busBookingService.getAllBookings();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get bookings by bus (Admin only)
     * GET /api/bus-bookings/admin/bus/{busId}
     */
    @GetMapping("/admin/bus/{busId}")
    public ResponseEntity<Object> getBookingsByBus(@PathVariable Integer busId,
                                                 @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is a vendor with BUSES_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"BUSES_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN vendor type or ADMIN role."));
                }
            }
            
            return busBookingService.getBookingsByBus(busId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get booking statistics (Admin only)
     * GET /api/bus-bookings/admin/statistics
     */
    @GetMapping("/admin/statistics")
    public ResponseEntity<Object> getBookingStatistics(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is a vendor with BUSES_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"BUSES_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN vendor type or ADMIN role."));
                }
            }
            
            return busBookingService.getBookingStatistics();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Update booking status (Admin only)
     * PUT /api/bus-bookings/admin/{bookingId}/status
     */
    @PutMapping("/admin/{bookingId}/status")
    public ResponseEntity<Object> updateBookingStatus(@PathVariable Integer bookingId,
                                                     @RequestParam BusBooking.BookingStatus status,
                                                     @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is a vendor with BUSES_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"BUSES_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN vendor type or ADMIN role."));
                }
            }
            
            return busBookingService.updateBookingStatus(bookingId, status);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get passenger manifest for a bus (Admin only)
     * GET /api/bus-bookings/admin/bus/{busId}/manifest
     */
    @GetMapping("/admin/bus/{busId}/manifest")
    public ResponseEntity<Object> getPassengerManifest(@PathVariable Integer busId,
                                                      @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is a vendor with BUSES_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"BUSES_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN vendor type or ADMIN role."));
                }
            }
            
            return busBookingService.getPassengerManifest(busId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Process refund (Admin only)
     * POST /api/bus-bookings/admin/{bookingId}/refund
     */
    @PostMapping("/admin/{bookingId}/refund")
    public ResponseEntity<Object> processRefund(@PathVariable Integer bookingId,
                                              @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is a vendor with BUSES_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"BUSES_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN vendor type or ADMIN role."));
                }
            }
            
            return busBookingService.processRefund(bookingId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Test endpoint to verify controller is working
     * GET /api/bus-bookings/test
     */
    @GetMapping("/test")
    public ResponseEntity<Object> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "Bus Booking Controller is working!",
            "timestamp", java.time.LocalDateTime.now()
        ));
    }
}