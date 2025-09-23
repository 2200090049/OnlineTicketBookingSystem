package org.otbs.www.backend.train.controllers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.train.models.Train;
import org.otbs.www.backend.train.services.TrainService;
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
@RequestMapping("/api/trains")
@CrossOrigin(origins = "*")
public class TrainController {

    @Autowired
    private TrainService trainService;

    @Autowired
    private JwtUtil jwtUtil;

    // Admin endpoints

    /**
     * Add new train (Admin only)
     * POST /api/trains/admin/add
     */
    @PostMapping("/admin/add")
    public ResponseEntity<Object> addTrain(@RequestBody Train train, 
                                         @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            System.out.println("DEBUG: User role from token: " + user.getRole());
            System.out.println("DEBUG: User email: " + user.getEmail());
            System.out.println("DEBUG: User ID: " + user.getId());
            System.out.println("DEBUG: User isVendor: " + user.isVendor());
            System.out.println("DEBUG: User vendorType: " + user.getVendorType());
            
            // Check if user is a vendor with TRAIN_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"TRAIN_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of(
                        "message", "Access denied. Train admin access required.",
                        "userRole", user.getRole(),
                        "userEmail", user.getEmail(),
                        "isVendor", user.isVendor(),
                        "vendorType", user.getVendorType() != null ? user.getVendorType().toString() : "null"
                    ));
                }
            }
            return trainService.addTrain(train);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }

    /**
     * Update train (Admin only)
     * PUT /api/trains/admin/update/{trainId}
     */
    @PutMapping("/admin/update/{trainId}")
    public ResponseEntity<Object> updateTrain(@PathVariable Integer trainId, 
                                            @RequestBody Train train,
                                            @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            // Check if user is a vendor with TRAIN_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"TRAIN_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Train admin access required."));
                }
            }
            return trainService.updateTrain(trainId, train);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Delete train (Admin only)
     * DELETE /api/trains/admin/delete/{trainId}
     */
    @DeleteMapping("/admin/delete/{trainId}")
    public ResponseEntity<Object> deleteTrain(@PathVariable Integer trainId,
                                            @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            // Check if user is a vendor with TRAIN_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"TRAIN_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Train admin access required."));
                }
            }
            return trainService.deleteTrain(trainId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get all trains (Admin only)
     * GET /api/trains/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<Object> getAllTrains(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            System.out.println("DEBUG getAllTrains - User role: " + user.getRole());
            System.out.println("DEBUG getAllTrains - User isVendor: " + user.isVendor());
            System.out.println("DEBUG getAllTrains - User vendorType: " + user.getVendorType());
            
            // Check if user is a vendor with TRAIN_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"TRAIN_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    System.out.println("DEBUG getAllTrains - Access denied. User isVendor: " + user.isVendor() + ", vendorType: " + user.getVendorType());
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Train admin access required."));
                }
            }
            System.out.println("DEBUG getAllTrains - Access granted, calling trainService.getAllTrains()");
            return trainService.getAllTrains();
        } catch (Exception e) {
            System.out.println("DEBUG getAllTrains - Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Get train by ID (Admin only)
     * GET /api/trains/admin/{trainId}
     */
    @GetMapping("/admin/{trainId}")
    public ResponseEntity<Object> getTrainByIdAdmin(@PathVariable Integer trainId,
                                                  @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            // Check if user is a vendor with TRAIN_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"TRAIN_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Train admin access required."));
                }
            }
            return trainService.getTrainById(trainId);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    /**
     * Update train status (Admin only)
     * PUT /api/trains/admin/status/{trainId}
     */
    @PutMapping("/admin/status/{trainId}")
    public ResponseEntity<Object> updateTrainStatus(@PathVariable Integer trainId,
                                                  @RequestBody Map<String, String> statusRequest,
                                                  @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            // Check if user is a vendor with TRAIN_ADMIN type or has ADMIN role
            if (!user.isVendor() || !"TRAIN_ADMIN".equals(user.getVendorType().toString())) {
                if (!"ADMIN".equals(user.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Access denied. Train admin access required."));
                }
            }
            
            Train.TrainStatus status = Train.TrainStatus.valueOf(statusRequest.get("status"));
            return trainService.updateTrainStatus(trainId, status);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }

    // User endpoints

    /**
     * Search trains by route and date
     * GET /api/trains/search
     */
    @GetMapping("/search")
    public ResponseEntity<Object> searchTrains(@RequestParam String sourceStation,
                                             @RequestParam String destinationStation,
                                             @RequestParam String departureDate) {
        try {
            LocalDateTime departureDateTime = LocalDateTime.parse(departureDate);
            return trainService.searchTrains(sourceStation, destinationStation, departureDateTime);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid date format. Use: yyyy-MM-ddTHH:mm:ss"));
        }
    }

    /**
     * Advanced search trains with multiple criteria
     * GET /api/trains/search/advanced
     */
    @GetMapping("/search/advanced")
    public ResponseEntity<Object> searchTrainsAdvanced(
            @RequestParam(required = false) String sourceStation,
            @RequestParam(required = false) String destinationStation,
            @RequestParam(required = false) String trainClass,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        Train.TrainClass trainClassEnum = null;
        if (trainClass != null) {
            try {
                trainClassEnum = Train.TrainClass.valueOf(trainClass);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid train class"));
            }
        }

        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;
        
        if (startDate != null) {
            try {
                startDateTime = LocalDateTime.parse(startDate);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid start date format"));
            }
        }
        
        if (endDate != null) {
            try {
                endDateTime = LocalDateTime.parse(endDate);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid end date format"));
            }
        }

        return trainService.searchTrainsAdvanced(sourceStation, destinationStation, trainClassEnum,
                minPrice, maxPrice, minSeats, startDateTime, endDateTime);
    }

    /**
     * Get available trains
     * GET /api/trains/available
     */
    @GetMapping("/available")
    public ResponseEntity<Object> getAvailableTrains() {
        return trainService.getAvailableTrains();
    }

    /**
     * Get train details by ID
     * GET /api/trains/{trainId}
     */
    @GetMapping("/{trainId}")
    public ResponseEntity<Object> getTrainDetails(@PathVariable Integer trainId) {
        return trainService.getTrainDetails(trainId);
    }

    /**
     * Get trains by class
     * GET /api/trains/class/{trainClass}
     */
    @GetMapping("/class/{trainClass}")
    public ResponseEntity<Object> getTrainsByClass(@PathVariable String trainClass) {
        try {
            Train.TrainClass trainClassEnum = Train.TrainClass.valueOf(trainClass);
            return trainService.getTrainsByClass(trainClassEnum);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid train class"));
        }
    }

    /**
     * Get trains by price range
     * GET /api/trains/price-range
     */
    @GetMapping("/price-range")
    public ResponseEntity<Object> getTrainsByPriceRange(@RequestParam BigDecimal minPrice,
                                                       @RequestParam BigDecimal maxPrice) {
        return trainService.getTrainsByPriceRange(minPrice, maxPrice);
    }

    /**
     * Check seat availability
     * GET /api/trains/{trainId}/availability
     */
    @GetMapping("/{trainId}/availability")
    public ResponseEntity<Object> checkSeatAvailability(@PathVariable Integer trainId,
                                                       @RequestParam Integer requestedSeats) {
        return trainService.checkSeatAvailability(trainId, requestedSeats);
    }

    /**
     * Get all train classes
     * GET /api/trains/classes
     */
    @GetMapping("/classes")
    public ResponseEntity<Object> getTrainClasses() {
        return ResponseEntity.ok(Map.of(
            "trainClasses", Train.TrainClass.values(),
            "message", "Available train classes"
        ));
    }

    /**
     * Get popular routes (mock data for now)
     * GET /api/trains/popular-routes
     */
    @GetMapping("/popular-routes")
    public ResponseEntity<Object> getPopularRoutes() {
        // This would typically come from database analytics
        return ResponseEntity.ok(Map.of(
            "popularRoutes", new String[][]{
                {"Delhi", "Mumbai"},
                {"Bangalore", "Chennai"},
                {"Mumbai", "Pune"},
                {"Delhi", "Jaipur"},
                {"Chennai", "Coimbatore"}
            },
            "message", "Popular train routes"
        ));
    }
}
