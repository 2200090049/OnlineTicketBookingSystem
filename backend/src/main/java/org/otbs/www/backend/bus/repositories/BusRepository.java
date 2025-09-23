package org.otbs.www.backend.bus.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.otbs.www.backend.bus.models.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BusRepository extends JpaRepository<Bus, Integer> {
    
    // Find buses by source and destination cities
    List<Bus> findBySourceCityAndDestinationCityAndStatus(
        String sourceCity, String destinationCity, Bus.BusStatus status);
    
    // Find buses by source city only
    List<Bus> findBySourceCityAndStatus(String sourceCity, Bus.BusStatus status);
    
    // Find buses by destination city only
    List<Bus> findByDestinationCityAndStatus(String destinationCity, Bus.BusStatus status);
    
    // Find buses by operator name
    List<Bus> findByOperatorNameContainingIgnoreCaseAndStatus(String operatorName, Bus.BusStatus status);
    
    // Find buses by bus type
    List<Bus> findByBusTypeAndStatus(Bus.BusType busType, Bus.BusStatus status);
    
    // Find buses by bus number
    Optional<Bus> findByBusNumber(String busNumber);
    
    // Find buses departing between dates with available seats
    @Query("SELECT b FROM Bus b WHERE b.sourceCity = :source AND b.destinationCity = :destination " +
           "AND DATE(b.departureTime) = DATE(:departureDate) AND b.status = :status " +
           "AND b.availableSeats > 0 ORDER BY b.departureTime ASC")
    List<Bus> findAvailableBusesByRouteAndDate(
        @Param("source") String sourceCity,
        @Param("destination") String destinationCity,
        @Param("departureDate") LocalDateTime departureDate,
        @Param("status") Bus.BusStatus status);
    
    // Advanced search with multiple criteria
    @Query("SELECT b FROM Bus b WHERE " +
           "(:source IS NULL OR LOWER(b.sourceCity) LIKE LOWER(CONCAT('%', :source, '%'))) AND " +
           "(:destination IS NULL OR LOWER(b.destinationCity) LIKE LOWER(CONCAT('%', :destination, '%'))) AND " +
           "(:busType IS NULL OR b.busType = :busType) AND " +
           "(:operator IS NULL OR LOWER(b.operatorName) LIKE LOWER(CONCAT('%', :operator, '%'))) AND " +
           "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR b.price <= :maxPrice) AND " +
           "(:minSeats IS NULL OR b.availableSeats >= :minSeats) AND " +
           "(:startDate IS NULL OR b.departureTime >= :startDate) AND " +
           "(:endDate IS NULL OR b.departureTime <= :endDate) AND " +
           "b.status = :status " +
           "ORDER BY b.departureTime ASC")
    List<Bus> findBusesByMultipleCriteria(
        @Param("source") String sourceCity,
        @Param("destination") String destinationCity,
        @Param("busType") Bus.BusType busType,
        @Param("operator") String operatorName,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minSeats") Integer minSeats,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("status") Bus.BusStatus status);
    
    // Find buses with departure time in range
    @Query("SELECT b FROM Bus b WHERE b.departureTime BETWEEN :startTime AND :endTime " +
           "AND b.status = :status ORDER BY b.departureTime ASC")
    List<Bus> findBusesByDepartureTimeRange(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("status") Bus.BusStatus status);
    
    // Find buses by price range
    @Query("SELECT b FROM Bus b WHERE b.price BETWEEN :minPrice AND :maxPrice " +
           "AND b.status = :status ORDER BY b.price ASC")
    List<Bus> findBusesByPriceRange(
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("status") Bus.BusStatus status);
    
    // Get unique source cities
    @Query("SELECT DISTINCT b.sourceCity FROM Bus b WHERE b.status = :status ORDER BY b.sourceCity")
    List<String> findDistinctSourceCities(@Param("status") Bus.BusStatus status);
    
    // Get unique destination cities
    @Query("SELECT DISTINCT b.destinationCity FROM Bus b WHERE b.status = :status ORDER BY b.destinationCity")
    List<String> findDistinctDestinationCities(@Param("status") Bus.BusStatus status);
    
    // Get unique operators
    @Query("SELECT DISTINCT b.operatorName FROM Bus b WHERE b.status = :status ORDER BY b.operatorName")
    List<String> findDistinctOperators(@Param("status") Bus.BusStatus status);
    
    // Count buses by status
    @Query("SELECT COUNT(b) FROM Bus b WHERE b.status = :status")
    Long countBusesByStatus(@Param("status") Bus.BusStatus status);
    
    // Count buses by bus type
    @Query("SELECT COUNT(b) FROM Bus b WHERE b.busType = :busType AND b.status = :status")
    Long countBusesByTypeAndStatus(@Param("busType") Bus.BusType busType, @Param("status") Bus.BusStatus status);
    
    // Find buses with low availability (less than specified seats)
    @Query("SELECT b FROM Bus b WHERE b.availableSeats < :threshold AND b.status = :status " +
           "ORDER BY b.availableSeats ASC")
    List<Bus> findBusesWithLowAvailability(@Param("threshold") Integer threshold, @Param("status") Bus.BusStatus status);
    
    // Find popular routes (most frequently searched)
    @Query("SELECT b.sourceCity, b.destinationCity, COUNT(b) as routeCount " +
           "FROM Bus b WHERE b.status = :status " +
           "GROUP BY b.sourceCity, b.destinationCity " +
           "ORDER BY routeCount DESC")
    List<Object[]> findPopularRoutes(@Param("status") Bus.BusStatus status);
    
    // Find buses departing today
    @Query("SELECT b FROM Bus b WHERE DATE(b.departureTime) = CURRENT_DATE " +
           "AND b.status = :status ORDER BY b.departureTime ASC")
    List<Bus> findBusesDepartingToday(@Param("status") Bus.BusStatus status);
    
    // Find buses departing tomorrow
    @Query("SELECT b FROM Bus b WHERE DATE(b.departureTime) = DATE(CURRENT_DATE + 1) " +
           "AND b.status = :status ORDER BY b.departureTime ASC")
    List<Bus> findBusesDepartingTomorrow(@Param("status") Bus.BusStatus status);
    
    // Find buses by duration range (calculated field)
    @Query("SELECT b FROM Bus b WHERE " +
           "TIMESTAMPDIFF(MINUTE, b.departureTime, b.arrivalTime) BETWEEN :minMinutes AND :maxMinutes " +
           "AND b.status = :status ORDER BY b.departureTime ASC")
    List<Bus> findBusesByDurationRange(
        @Param("minMinutes") Long minMinutes,
        @Param("maxMinutes") Long maxMinutes,
        @Param("status") Bus.BusStatus status);
    
    // Find buses with specific amenities (JSON search)
    @Query("SELECT b FROM Bus b WHERE b.amenities LIKE %:amenity% AND b.status = :status")
    List<Bus> findBusesWithAmenity(@Param("amenity") String amenity, @Param("status") Bus.BusStatus status);
    
    // Check if bus number already exists
    @Query("SELECT COUNT(b) > 0 FROM Bus b WHERE b.busNumber = :busNumber")
    Boolean existsByBusNumber(@Param("busNumber") String busNumber);
    
    // Get bus occupancy statistics
    @Query("SELECT b.id, b.busName, b.totalSeats, b.availableSeats, " +
           "((b.totalSeats - b.availableSeats) * 100.0 / b.totalSeats) as occupancyPercentage " +
           "FROM Bus b WHERE b.status = :status " +
           "ORDER BY occupancyPercentage DESC")
    List<Object[]> getBusOccupancyStats(@Param("status") Bus.BusStatus status);
    
    // Find buses needing maintenance (based on some criteria)
    @Query("SELECT b FROM Bus b WHERE b.status = 'MAINTENANCE' OR " +
           "(b.status = 'ACTIVE' AND b.updatedAt < :maintenanceThreshold)")
    List<Bus> findBusesNeedingMaintenance(@Param("maintenanceThreshold") LocalDateTime maintenanceThreshold);
}