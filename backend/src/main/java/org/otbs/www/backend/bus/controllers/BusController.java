package org.otbs.www.backend.bus.controllers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import org.otbs.www.backend.bus.models.Bus;
import org.otbs.www.backend.bus.services.BusService;
import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/buses")
@CrossOrigin(origins = "*")
public class BusController {

    @Autowired
    private BusService busService;

    @Autowired
    private JwtUtil jwtUtil;

    // Public endpoints for users

    /**
     * Search buses by route and date
     */
    @GetMapping("/search")
    public ResponseEntity<Object> searchBuses(
            @RequestParam String sourceCity,
            @RequestParam String destinationCity,
            @RequestParam LocalDateTime departureDate) {
        return busService.searchBuses(sourceCity, destinationCity, departureDate);
    }

    /**
     * Advanced search with multiple criteria
     */
    @GetMapping("/search/advanced")
    public ResponseEntity<Object> searchBusesAdvanced(
            @RequestParam(required = false) String sourceCity,
            @RequestParam(required = false) String destinationCity,
            @RequestParam(required = false) Bus.BusType busType,
            @RequestParam(required = false) String operatorName,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return busService.searchBusesAdvanced(sourceCity, destinationCity, busType, 
                                             operatorName, minPrice, maxPrice, 
                                             minSeats, startDate, endDate);
    }

    /**
     * Get bus by ID
     */
    @GetMapping("/{busId}")
    public ResponseEntity<Object> getBusById(@PathVariable Integer busId) {
        return busService.getBusById(busId);
    }

    /**
     * Get available buses (today and tomorrow)
     */
    @GetMapping("/available")
    public ResponseEntity<Object> getAvailableBuses() {
        return busService.getAvailableBuses();
    }

    /**
     * Get bus routes (source and destination cities)
     */
    @GetMapping("/routes")
    public ResponseEntity<Object> getBusRoutes() {
        return busService.getBusRoutes();
    }

    /**
     * Get bus operators
     */
    @GetMapping("/operators")
    public ResponseEntity<Object> getBusOperators() {
        return busService.getBusOperators();
    }

    /**
     * Get popular routes
     */
    @GetMapping("/routes/popular")
    public ResponseEntity<Object> getPopularRoutes() {
        return busService.getPopularRoutes();
    }

    /**
     * Check seat availability for a bus
     */
    @GetMapping("/{busId}/availability")
    public ResponseEntity<Object> checkSeatAvailability(
            @PathVariable Integer busId,
            @RequestParam Integer requestedSeats) {
        return busService.checkSeatAvailability(busId, requestedSeats);
    }

    // Admin endpoints - require BUSES_ADMIN or ADMIN role

    /**
     * Add a new bus (Admin only)
     */
    @PostMapping("/admin")
    public ResponseEntity<Object> addBus(@RequestBody Bus bus, 
                                       @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is BUSES_ADMIN or ADMIN
            if (!user.getRole().equals("BUSES_ADMIN") && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN or ADMIN role."));
            }
            
            return busService.addBus(bus);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Update an existing bus (Admin only)
     */
    @PutMapping("/admin/{busId}")
    public ResponseEntity<Object> updateBus(@PathVariable Integer busId, 
                                          @RequestBody Bus bus,
                                          @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is BUSES_ADMIN or ADMIN
            if (!user.getRole().equals("BUSES_ADMIN") && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN or ADMIN role."));
            }
            
            return busService.updateBus(busId, bus);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Delete a bus (Admin only)
     */
    @DeleteMapping("/admin/{busId}")
    public ResponseEntity<Object> deleteBus(@PathVariable Integer busId,
                                          @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is BUSES_ADMIN or ADMIN
            if (!user.getRole().equals("BUSES_ADMIN") && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN or ADMIN role."));
            }
            
            return busService.deleteBus(busId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get all buses (Admin only)
     */
    @GetMapping("/admin")
    public ResponseEntity<Object> getAllBuses(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is BUSES_ADMIN or ADMIN
            if (!user.getRole().equals("BUSES_ADMIN") && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN or ADMIN role."));
            }
            
            return busService.getAllBuses();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Update bus status (Admin only)
     */
    @PutMapping("/admin/{busId}/status")
    public ResponseEntity<Object> updateBusStatus(
            @PathVariable Integer busId,
            @RequestParam Bus.BusStatus status,
            @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is BUSES_ADMIN or ADMIN
            if (!user.getRole().equals("BUSES_ADMIN") && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN or ADMIN role."));
            }
            
            return busService.updateBusStatus(busId, status);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get bus statistics (Admin only)
     */
    @GetMapping("/admin/statistics")
    public ResponseEntity<Object> getBusStatistics(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            
            // Check if user is BUSES_ADMIN or ADMIN
            if (!user.getRole().equals("BUSES_ADMIN") && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Requires BUSES_ADMIN or ADMIN role."));
            }
            
            return busService.getBusStatistics();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Test endpoint to verify controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<Object> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "Bus Controller is working!",
            "timestamp", LocalDateTime.now()
        ));
    }
}