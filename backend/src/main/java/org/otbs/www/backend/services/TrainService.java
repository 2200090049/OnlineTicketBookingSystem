package org.otbs.www.backend.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.otbs.www.backend.models.Train;
import org.otbs.www.backend.repositories.TrainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
@Transactional
public class TrainService {

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private Validator validator;

    // Admin operations

    /**
     * Add a new train (Admin only)
     */
    public ResponseEntity<Object> addTrain(Train train) {
        // Validate train data
        Set<ConstraintViolation<Train>> violations = validator.validate(train);
        if (!violations.isEmpty()) {
            Map<String, String> errors = violations.stream()
                    .collect(Collectors.toMap(
                            violation -> violation.getPropertyPath().toString(),
                            ConstraintViolation::getMessage
                    ));
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        // Check if train number already exists
        if (trainRepository.existsByTrainNumberAndIdNot(train.getTrainNumber(), null)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Train number already exists"));
        }

        // Validate business logic
        if (train.getArrivalTime().isBefore(train.getDepartureTime())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Arrival time must be after departure time"));
        }

        // Set initial available seats equal to total seats
        train.setAvailableSeats(train.getTotalSeats());
        train.setStatus(Train.TrainStatus.ACTIVE);

        Train savedTrain = trainRepository.save(train);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Train added successfully");
        response.put("train", savedTrain);
        return ResponseEntity.ok(response);
    }

    /**
     * Update train details (Admin only)
     */
    public ResponseEntity<Object> updateTrain(Integer trainId, Train updatedTrain) {
        Optional<Train> optionalTrain = trainRepository.findById(trainId);
        if (optionalTrain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Train existingTrain = optionalTrain.get();

        // Validate updated train data
        Set<ConstraintViolation<Train>> violations = validator.validate(updatedTrain);
        if (!violations.isEmpty()) {
            Map<String, String> errors = violations.stream()
                    .collect(Collectors.toMap(
                            violation -> violation.getPropertyPath().toString(),
                            ConstraintViolation::getMessage
                    ));
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        // Check if train number already exists (excluding current train)
        if (trainRepository.existsByTrainNumberAndIdNot(updatedTrain.getTrainNumber(), trainId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Train number already exists"));
        }

        // Validate business logic
        if (updatedTrain.getArrivalTime().isBefore(updatedTrain.getDepartureTime())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Arrival time must be after departure time"));
        }

        // Preserve booking-related data
        updatedTrain.setId(trainId);
        updatedTrain.setAvailableSeats(existingTrain.getAvailableSeats());
        updatedTrain.setCreatedAt(existingTrain.getCreatedAt());
        updatedTrain.setUpdatedAt(LocalDateTime.now());

        Train savedTrain = trainRepository.save(updatedTrain);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Train updated successfully");
        response.put("train", savedTrain);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete train (Admin only)
     */
    public ResponseEntity<Object> deleteTrain(Integer trainId) {
        Optional<Train> optionalTrain = trainRepository.findById(trainId);
        if (optionalTrain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Train train = optionalTrain.get();

        // Check if train has any bookings
        // Note: In a real system, you might want to check for future bookings
        // and handle cancellation logic here

        trainRepository.delete(train);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Train deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Get all trains (Admin only)
     */
    public ResponseEntity<Object> getAllTrains() {
        List<Train> trains = trainRepository.findAll();
        return ResponseEntity.ok(Map.of("trains", trains));
    }

    /**
     * Get train by ID (Admin only)
     */
    public ResponseEntity<Object> getTrainById(Integer trainId) {
        Optional<Train> train = trainRepository.findById(trainId);
        if (train.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("train", train.get()));
    }

    /**
     * Update train status (Admin only)
     */
    public ResponseEntity<Object> updateTrainStatus(Integer trainId, Train.TrainStatus status) {
        Optional<Train> optionalTrain = trainRepository.findById(trainId);
        if (optionalTrain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Train train = optionalTrain.get();
        train.setStatus(status);
        train.setUpdatedAt(LocalDateTime.now());

        Train savedTrain = trainRepository.save(train);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Train status updated successfully");
        response.put("train", savedTrain);
        return ResponseEntity.ok(response);
    }

    // User operations

    /**
     * Search trains by route and date
     */
    public ResponseEntity<Object> searchTrains(String sourceStation, String destinationStation, 
                                             LocalDateTime departureDate) {
        if (sourceStation == null || destinationStation == null || departureDate == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Source, destination, and departure date are required"));
        }

        List<Train> trains = trainRepository.findAvailableTrainsByRouteAndDate(
            sourceStation, destinationStation, departureDate, Train.TrainStatus.ACTIVE);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Trains found: " + trains.size());
        response.put("trains", trains);
        response.put("searchCriteria", Map.of(
            "sourceStation", sourceStation,
            "destinationStation", destinationStation,
            "departureDate", departureDate
        ));
        return ResponseEntity.ok(response);
    }

    /**
     * Search trains with multiple criteria
     */
    public ResponseEntity<Object> searchTrainsAdvanced(String sourceStation, String destinationStation,
                                                      Train.TrainClass trainClass, BigDecimal minPrice,
                                                      BigDecimal maxPrice, Integer minSeats,
                                                      LocalDateTime startDate, LocalDateTime endDate) {
        List<Train> trains = trainRepository.findTrainsByMultipleCriteria(
            sourceStation, destinationStation, trainClass, minPrice, maxPrice,
            minSeats, startDate, endDate, Train.TrainStatus.ACTIVE);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Trains found: " + trains.size());
        response.put("trains", trains);
        response.put("searchCriteria", Map.of(
            "sourceStation", sourceStation,
            "destinationStation", destinationStation,
            "trainClass", trainClass,
            "minPrice", minPrice,
            "maxPrice", maxPrice,
            "minSeats", minSeats,
            "startDate", startDate,
            "endDate", endDate
        ));
        return ResponseEntity.ok(response);
    }

    /**
     * Get available trains
     */
    public ResponseEntity<Object> getAvailableTrains() {
        List<Train> trains = trainRepository.findByStatusOrderByDepartureTimeAsc(Train.TrainStatus.ACTIVE);
        
        // Filter only trains with available seats
        List<Train> availableTrains = trains.stream()
            .filter(Train::isAvailable)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Available trains: " + availableTrains.size());
        response.put("trains", availableTrains);
        return ResponseEntity.ok(response);
    }

    /**
     * Get train details by ID (for users)
     */
    public ResponseEntity<Object> getTrainDetails(Integer trainId) {
        Optional<Train> train = trainRepository.findById(trainId);
        if (train.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Train trainDetails = train.get();
        if (trainDetails.getStatus() != Train.TrainStatus.ACTIVE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Train is not available"));
        }

        return ResponseEntity.ok(Map.of("train", trainDetails));
    }

    /**
     * Get trains by class
     */
    public ResponseEntity<Object> getTrainsByClass(Train.TrainClass trainClass) {
        List<Train> trains = trainRepository.findByTrainClassAndStatus(trainClass, Train.TrainStatus.ACTIVE);
        
        // Filter only trains with available seats
        List<Train> availableTrains = trains.stream()
            .filter(Train::isAvailable)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Available " + trainClass + " trains: " + availableTrains.size());
        response.put("trains", availableTrains);
        return ResponseEntity.ok(response);
    }

    /**
     * Get trains by price range
     */
    public ResponseEntity<Object> getTrainsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice == null || maxPrice == null || minPrice.compareTo(maxPrice) > 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid price range"));
        }

        List<Train> trains = trainRepository.findByPriceBetweenAndStatus(minPrice, maxPrice, Train.TrainStatus.ACTIVE);
        
        // Filter only trains with available seats
        List<Train> availableTrains = trains.stream()
            .filter(Train::isAvailable)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Available trains in price range: " + availableTrains.size());
        response.put("trains", availableTrains);
        return ResponseEntity.ok(response);
    }

    /**
     * Check seat availability for a specific train
     */
    public ResponseEntity<Object> checkSeatAvailability(Integer trainId, Integer requestedSeats) {
        Optional<Train> optionalTrain = trainRepository.findById(trainId);
        if (optionalTrain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Train train = optionalTrain.get();
        boolean available = train.hasSeatsAvailable(requestedSeats);

        Map<String, Object> response = new HashMap<>();
        response.put("trainId", trainId);
        response.put("requestedSeats", requestedSeats);
        response.put("availableSeats", train.getAvailableSeats());
        response.put("isAvailable", available);
        response.put("message", available ? "Seats available" : "Not enough seats available");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Update available seats after booking
     */
    public ResponseEntity<Object> updateAvailableSeats(Integer trainId, Integer seatsToDeduct) {
        Optional<Train> optionalTrain = trainRepository.findById(trainId);
        if (optionalTrain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Train train = optionalTrain.get();
        if (train.getAvailableSeats() < seatsToDeduct) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough seats available"));
        }

        train.setAvailableSeats(train.getAvailableSeats() - seatsToDeduct);
        train.setUpdatedAt(LocalDateTime.now());
        
        Train savedTrain = trainRepository.save(train);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Seats updated successfully");
        response.put("train", savedTrain);
        return ResponseEntity.ok(response);
    }

    /**
     * Restore available seats after cancellation
     */
    public ResponseEntity<Object> restoreAvailableSeats(Integer trainId, Integer seatsToRestore) {
        Optional<Train> optionalTrain = trainRepository.findById(trainId);
        if (optionalTrain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Train train = optionalTrain.get();
        train.setAvailableSeats(train.getAvailableSeats() + seatsToRestore);
        train.setUpdatedAt(LocalDateTime.now());
        
        Train savedTrain = trainRepository.save(train);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Seats restored successfully");
        response.put("train", savedTrain);
        return ResponseEntity.ok(response);
    }
}
