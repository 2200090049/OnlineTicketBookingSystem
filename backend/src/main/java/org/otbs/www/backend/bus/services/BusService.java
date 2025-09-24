package org.otbs.www.backend.bus.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.otbs.www.backend.bus.models.Bus;
import org.otbs.www.backend.bus.repositories.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
@Transactional
public class BusService {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private Validator validator;

    // Admin operations

    /**
     * Add a new bus
     */
    public ResponseEntity<Object> addBus(Bus bus) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate the bus entity
            Set<ConstraintViolation<Bus>> violations = validator.validate(bus);
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

            // Check if bus number already exists
            if (busRepository.existsByBusNumber(bus.getBusNumber())) {
                response.put("message", "Bus number already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate departure and arrival times
            if (bus.getDepartureTime().isAfter(bus.getArrivalTime())) {
                response.put("message", "Departure time cannot be after arrival time");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate departure time is in the future
            if (bus.getDepartureTime().isBefore(LocalDateTime.now().plusHours(1))) {
                response.put("message", "Departure time should be at least 1 hour from now");
                return ResponseEntity.badRequest().body(response);
            }

            // Set available seats equal to total seats for new bus
            if (bus.getAvailableSeats() == null) {
                bus.setAvailableSeats(bus.getTotalSeats());
            }

            // Save the bus
            Bus savedBus = busRepository.save(bus);
            
            response.put("message", "Bus added successfully");
            response.put("bus", savedBus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to add bus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update an existing bus
     */
    public ResponseEntity<Object> updateBus(Integer busId, Bus updatedBus) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Bus> existingBusOpt = busRepository.findById(busId);
            if (!existingBusOpt.isPresent()) {
                response.put("message", "Bus not found");
                return ResponseEntity.notFound().build();
            }

            Bus existingBus = existingBusOpt.get();

            // Validate the updated bus entity
            Set<ConstraintViolation<Bus>> violations = validator.validate(updatedBus);
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

            // Check if bus number already exists (excluding current bus)
            if (!existingBus.getBusNumber().equals(updatedBus.getBusNumber()) && 
                busRepository.existsByBusNumber(updatedBus.getBusNumber())) {
                response.put("message", "Bus number already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate departure and arrival times
            if (updatedBus.getDepartureTime().isAfter(updatedBus.getArrivalTime())) {
                response.put("message", "Departure time cannot be after arrival time");
                return ResponseEntity.badRequest().body(response);
            }

            // Update bus properties
            existingBus.setBusName(updatedBus.getBusName());
            existingBus.setBusNumber(updatedBus.getBusNumber());
            existingBus.setOperatorName(updatedBus.getOperatorName());
            existingBus.setSourceCity(updatedBus.getSourceCity());
            existingBus.setDestinationCity(updatedBus.getDestinationCity());
            existingBus.setDepartureTime(updatedBus.getDepartureTime());
            existingBus.setArrivalTime(updatedBus.getArrivalTime());
            existingBus.setPrice(updatedBus.getPrice());
            existingBus.setBusType(updatedBus.getBusType());
            existingBus.setAmenities(updatedBus.getAmenities());
            existingBus.setSeatRows(updatedBus.getSeatRows());
            existingBus.setSeatColumns(updatedBus.getSeatColumns());
            existingBus.setSeatLayout(updatedBus.getSeatLayout());

            // Only update total seats if no bookings exist or if increasing capacity
            if (updatedBus.getTotalSeats() != null) {
                int seatDifference = updatedBus.getTotalSeats() - existingBus.getTotalSeats();
                existingBus.setTotalSeats(updatedBus.getTotalSeats());
                existingBus.setAvailableSeats(existingBus.getAvailableSeats() + seatDifference);
            }

            Bus savedBus = busRepository.save(existingBus);
            
            response.put("message", "Bus updated successfully");
            response.put("bus", savedBus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to update bus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete a bus
     */
    public ResponseEntity<Object> deleteBus(Integer busId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Bus> busOpt = busRepository.findById(busId);
            if (!busOpt.isPresent()) {
                response.put("message", "Bus not found");
                return ResponseEntity.notFound().build();
            }

            Bus bus = busOpt.get();
            
            // Check if bus has future bookings - if so, don't delete, just mark as inactive
            if (bus.getDepartureTime().isAfter(LocalDateTime.now()) && 
                bus.getAvailableSeats() < bus.getTotalSeats()) {
                bus.setStatus(Bus.BusStatus.CANCELLED);
                busRepository.save(bus);
                response.put("message", "Bus marked as cancelled due to existing bookings");
            } else {
                busRepository.delete(bus);
                response.put("message", "Bus deleted successfully");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to delete bus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all buses for admin
     */
    public ResponseEntity<Object> getAllBuses() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Bus> buses = busRepository.findAll();
            response.put("message", "Buses retrieved successfully");
            response.put("buses", buses);
            response.put("count", buses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to retrieve buses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update bus status
     */
    public ResponseEntity<Object> updateBusStatus(Integer busId, Bus.BusStatus status) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Bus> busOpt = busRepository.findById(busId);
            if (!busOpt.isPresent()) {
                response.put("message", "Bus not found");
                return ResponseEntity.notFound().build();
            }

            Bus bus = busOpt.get();
            bus.setStatus(status);
            Bus savedBus = busRepository.save(bus);
            
            response.put("message", "Bus status updated successfully");
            response.put("bus", savedBus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to update bus status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // User operations

    /**
     * Search buses by route and date
     */
    public ResponseEntity<Object> searchBuses(String sourceCity, String destinationCity, 
                                            LocalDateTime departureDate) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Bus> buses;
            
            if (departureDate != null) {
                // Search with specific date
                buses = busRepository.findAvailableBusesByRouteAndDate(
                    sourceCity, destinationCity, departureDate, Bus.BusStatus.ACTIVE);
            } else {
                // Search without date filter - get all active buses for the route
                buses = busRepository.findBySourceCityAndDestinationCityAndStatus(
                    sourceCity, destinationCity, Bus.BusStatus.ACTIVE);
            }
            
            response.put("message", "Bus search completed");
            response.put("buses", buses);
            response.put("count", buses.size());
            Map<String, Object> searchCriteria = new HashMap<>();
            searchCriteria.put("sourceCity", sourceCity);
            searchCriteria.put("destinationCity", destinationCity);
            if (departureDate != null) {
                searchCriteria.put("departureDate", departureDate);
            }
            response.put("searchCriteria", searchCriteria);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to search buses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Advanced search with multiple criteria
     */
    public ResponseEntity<Object> searchBusesAdvanced(String sourceCity, String destinationCity,
                                                    Bus.BusType busType, String operatorName,
                                                    BigDecimal minPrice, BigDecimal maxPrice,
                                                    Integer minSeats, LocalDateTime startDate,
                                                    LocalDateTime endDate) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Bus> buses = busRepository.findBusesByMultipleCriteria(
                sourceCity, destinationCity, busType, operatorName,
                minPrice, maxPrice, minSeats, startDate, endDate, Bus.BusStatus.ACTIVE);
            
            response.put("message", "Advanced bus search completed");
            response.put("buses", buses);
            response.put("count", buses.size());
            response.put("searchCriteria", Map.of(
                "sourceCity", sourceCity != null ? sourceCity : "Any",
                "destinationCity", destinationCity != null ? destinationCity : "Any",
                "busType", busType != null ? busType.toString() : "Any",
                "operatorName", operatorName != null ? operatorName : "Any"
            ));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to perform advanced search: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get bus by ID
     */
    public ResponseEntity<Object> getBusById(Integer busId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Bus> busOpt = busRepository.findById(busId);
            if (!busOpt.isPresent()) {
                response.put("message", "Bus not found");
                return ResponseEntity.notFound().build();
            }

            Bus bus = busOpt.get();
            response.put("message", "Bus retrieved successfully");
            response.put("bus", bus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to retrieve bus: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get available buses (public endpoint)
     */
    public ResponseEntity<Object> getAvailableBuses() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get today's buses
            LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime todayEnd = todayStart.plusDays(1);
            List<Bus> buses = busRepository.findBusesDepartingToday(todayStart, todayEnd, Bus.BusStatus.ACTIVE);
            
            // Add tomorrow's buses
            LocalDateTime tomorrowStart = LocalDateTime.now().plusDays(1).toLocalDate().atStartOfDay();
            LocalDateTime tomorrowEnd = tomorrowStart.plusDays(1);
            buses.addAll(busRepository.findBusesDepartingTomorrow(tomorrowStart, tomorrowEnd, Bus.BusStatus.ACTIVE));
            
            response.put("message", "Available buses retrieved successfully");
            response.put("buses", buses);
            response.put("count", buses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to retrieve available buses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get bus routes (source and destination cities)
     */
    public ResponseEntity<Object> getBusRoutes() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<String> sourceCities = busRepository.findDistinctSourceCities(Bus.BusStatus.ACTIVE);
            List<String> destinationCities = busRepository.findDistinctDestinationCities(Bus.BusStatus.ACTIVE);
            
            response.put("message", "Bus routes retrieved successfully");
            response.put("sourceCities", sourceCities);
            response.put("destinationCities", destinationCities);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to retrieve bus routes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get bus operators
     */
    public ResponseEntity<Object> getBusOperators() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<String> operators = busRepository.findDistinctOperators(Bus.BusStatus.ACTIVE);
            
            response.put("message", "Bus operators retrieved successfully");
            response.put("operators", operators);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to retrieve bus operators: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get popular routes
     */
    public ResponseEntity<Object> getPopularRoutes() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Object[]> popularRoutes = busRepository.findPopularRoutes(Bus.BusStatus.ACTIVE);
            
            List<Map<String, Object>> formattedRoutes = popularRoutes.stream()
                .limit(10) // Top 10 popular routes
                .map(route -> {
                    Map<String, Object> routeMap = new HashMap<>();
                    routeMap.put("sourceCity", route[0]);
                    routeMap.put("destinationCity", route[1]);
                    routeMap.put("busCount", route[2]);
                    return routeMap;
                })
                .collect(Collectors.toList());
            
            response.put("message", "Popular routes retrieved successfully");
            response.put("routes", formattedRoutes);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to retrieve popular routes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get bus statistics
     */
    public ResponseEntity<Object> getBusStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long totalBuses = busRepository.count();
            Long activeBuses = busRepository.countBusesByStatus(Bus.BusStatus.ACTIVE);
            Long inactiveBuses = busRepository.countBusesByStatus(Bus.BusStatus.INACTIVE);
            Long cancelledBuses = busRepository.countBusesByStatus(Bus.BusStatus.CANCELLED);
            Long maintenanceBuses = busRepository.countBusesByStatus(Bus.BusStatus.MAINTENANCE);

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalBuses", totalBuses);
            statistics.put("activeBuses", activeBuses);
            statistics.put("inactiveBuses", inactiveBuses);
            statistics.put("cancelledBuses", cancelledBuses);
            statistics.put("maintenanceBuses", maintenanceBuses);

            // Bus type statistics
            Map<String, Long> typeStats = new HashMap<>();
            for (Bus.BusType type : Bus.BusType.values()) {
                typeStats.put(type.name(), busRepository.countBusesByTypeAndStatus(type, Bus.BusStatus.ACTIVE));
            }
            statistics.put("busTypeStats", typeStats);

            response.put("message", "Bus statistics retrieved successfully");
            response.put("statistics", statistics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to retrieve bus statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Check seat availability for a bus
     */
    public ResponseEntity<Object> checkSeatAvailability(Integer busId, Integer requestedSeats) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Bus> busOpt = busRepository.findById(busId);
            if (!busOpt.isPresent()) {
                response.put("message", "Bus not found");
                return ResponseEntity.notFound().build();
            }

            Bus bus = busOpt.get();
            boolean available = bus.canBookSeats(requestedSeats);
            
            response.put("message", "Seat availability checked");
            response.put("available", available);
            response.put("availableSeats", bus.getAvailableSeats());
            response.put("totalSeats", bus.getTotalSeats());
            response.put("requestedSeats", requestedSeats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Failed to check seat availability: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}