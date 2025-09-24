package org.otbs.www.backend.train.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.otbs.www.backend.train.models.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainRepository extends JpaRepository<Train, Integer> {
    
    // Find trains by source and destination stations
    List<Train> findBySourceStationAndDestinationStationAndStatus(
        String sourceStation, String destinationStation, Train.TrainStatus status);
    
    // Find trains by source station only
    List<Train> findBySourceStationAndStatus(String sourceStation, Train.TrainStatus status);
    
    // Find trains by destination station only
    List<Train> findByDestinationStationAndStatus(String destinationStation, Train.TrainStatus status);
    
    // Find trains by train number
    Optional<Train> findByTrainNumber(String trainNumber);
    
    // Find trains by train class
    List<Train> findByTrainClassAndStatus(Train.TrainClass trainClass, Train.TrainStatus status);
    
    // Find trains with available seats
    List<Train> findByAvailableSeatsGreaterThanAndStatus(Integer minSeats, Train.TrainStatus status);
    
    // Find trains departing after a specific time
    List<Train> findByDepartureTimeAfterAndStatus(LocalDateTime departureTime, Train.TrainStatus status);
    
    // Find trains departing between two times
    List<Train> findByDepartureTimeBetweenAndStatus(
        LocalDateTime startTime, LocalDateTime endTime, Train.TrainStatus status);
    
    // Find trains by price range
    List<Train> findByPriceBetweenAndStatus(
        java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, Train.TrainStatus status);
    
    // Find trains by source, destination, and date range (case-insensitive)
    @Query("SELECT t FROM Train t WHERE LOWER(t.sourceStation) = LOWER(:source) AND LOWER(t.destinationStation) = LOWER(:destination) " +
           "AND t.departureTime >= :startDate AND t.departureTime <= :endDate AND t.status = :status " +
           "AND t.availableSeats > 0 ORDER BY t.departureTime ASC")
    List<Train> findAvailableTrainsByRouteAndDateRange(
        @Param("source") String sourceStation,
        @Param("destination") String destinationStation,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("status") Train.TrainStatus status);
    
    // Find trains by source, destination, and specific date (case-insensitive)
    @Query("SELECT t FROM Train t WHERE LOWER(t.sourceStation) = LOWER(:source) AND LOWER(t.destinationStation) = LOWER(:destination) " +
           "AND DATE(t.departureTime) = DATE(:departureDate) AND t.status = :status " +
           "AND t.availableSeats > 0 ORDER BY t.departureTime ASC")
    List<Train> findAvailableTrainsByRouteAndDate(
        @Param("source") String sourceStation,
        @Param("destination") String destinationStation,
        @Param("departureDate") LocalDateTime departureDate,
        @Param("status") Train.TrainStatus status);
    
    // Find all active trains
    List<Train> findByStatusOrderByDepartureTimeAsc(Train.TrainStatus status);
    
    // Find trains by multiple criteria (advanced search)
    @Query("SELECT t FROM Train t WHERE " +
           "(:source IS NULL OR t.sourceStation = :source) AND " +
           "(:destination IS NULL OR t.destinationStation = :destination) AND " +
           "(:trainClass IS NULL OR t.trainClass = :trainClass) AND " +
           "(:minPrice IS NULL OR t.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR t.price <= :maxPrice) AND " +
           "(:minSeats IS NULL OR t.availableSeats >= :minSeats) AND " +
           "(:startDate IS NULL OR t.departureTime >= :startDate) AND " +
           "(:endDate IS NULL OR t.departureTime <= :endDate) AND " +
           "t.status = :status " +
           "ORDER BY t.departureTime ASC")
    List<Train> findTrainsByMultipleCriteria(
        @Param("source") String sourceStation,
        @Param("destination") String destinationStation,
        @Param("trainClass") Train.TrainClass trainClass,
        @Param("minPrice") java.math.BigDecimal minPrice,
        @Param("maxPrice") java.math.BigDecimal maxPrice,
        @Param("minSeats") Integer minSeats,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("status") Train.TrainStatus status);
    
    // Find trains by source and destination with fuzzy matching (case-insensitive, partial match)
    @Query("SELECT t FROM Train t WHERE " +
           "LOWER(t.sourceStation) LIKE LOWER(CONCAT('%', :source, '%')) AND " +
           "LOWER(t.destinationStation) LIKE LOWER(CONCAT('%', :destination, '%')) AND " +
           "t.status = :status AND t.availableSeats > 0 " +
           "ORDER BY t.departureTime ASC")
    List<Train> findTrainsByRouteFuzzy(
        @Param("source") String sourceStation,
        @Param("destination") String destinationStation,
        @Param("status") Train.TrainStatus status);
    
    // Count trains by status
    long countByStatus(Train.TrainStatus status);
    
    // Check if train number already exists (excluding current train for updates)
    @Query("SELECT COUNT(t) > 0 FROM Train t WHERE t.trainNumber = :trainNumber AND (:id IS NULL OR t.id != :id)")
    boolean existsByTrainNumberAndIdNot(@Param("trainNumber") String trainNumber, @Param("id") Integer id);
    
    // Find trains departing soon (for notifications)
    @Query("SELECT t FROM Train t WHERE t.departureTime BETWEEN :now AND :nextHour AND t.status = :status")
    List<Train> findTrainsDepartingSoon(
        @Param("now") LocalDateTime now,
        @Param("nextHour") LocalDateTime nextHour,
        @Param("status") Train.TrainStatus status);
}
