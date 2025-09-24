package org.otbs.www.backend.train.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.train.models.Booking;
import org.otbs.www.backend.train.models.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    // Find bookings by user
    List<Booking> findByUserOrderByBookingDateDesc(Users user);
    
    // Find bookings by user with train data eagerly loaded
    @Query("SELECT b FROM Booking b JOIN FETCH b.train WHERE b.user = :user ORDER BY b.bookingDate DESC")
    List<Booking> findByUserWithTrainOrderByBookingDateDesc(@Param("user") Users user);
    
    // Find all bookings with train data eagerly loaded (for admin/vendor)
    @Query("SELECT b FROM Booking b JOIN FETCH b.train ORDER BY b.bookingDate DESC")
    List<Booking> findAllWithTrainOrderByBookingDateDesc();
    
    // Find bookings by train
    List<Booking> findByTrainOrderByBookingDateDesc(Train train);
    
    // Find bookings by booking reference
    Optional<Booking> findByBookingReference(String bookingReference);
    
    // Find bookings by user and status
    List<Booking> findByUserAndStatusOrderByBookingDateDesc(Users user, Booking.BookingStatus status);
    
    // Find bookings by train and status
    List<Booking> findByTrainAndStatusOrderByBookingDateDesc(Train train, Booking.BookingStatus status);
    
    // Find bookings by passenger email
    List<Booking> findByPassengerEmailOrderByBookingDateDesc(String passengerEmail);
    
    // Find bookings by passenger phone
    List<Booking> findByPassengerPhoneOrderByBookingDateDesc(String passengerPhone);
    
    // Find bookings by booking date range
    List<Booking> findByBookingDateBetweenOrderByBookingDateDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find bookings by status
    List<Booking> findByStatusOrderByBookingDateDesc(Booking.BookingStatus status);
    
    // Find bookings by user and train
    List<Booking> findByUserAndTrain(Users user, Train train);
    
    // Find bookings by user and date range
    @Query("SELECT b FROM Booking b WHERE b.user = :user AND b.bookingDate BETWEEN :startDate AND :endDate ORDER BY b.bookingDate DESC")
    List<Booking> findByUserAndBookingDateRange(
        @Param("user") Users user,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Find confirmed bookings for a train (to calculate occupied seats)
    @Query("SELECT b FROM Booking b WHERE b.train = :train AND b.status = 'CONFIRMED'")
    List<Booking> findConfirmedBookingsByTrain(@Param("train") Train train);
    
    // Count confirmed bookings for a train
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.train = :train AND b.status = 'CONFIRMED'")
    long countConfirmedBookingsByTrain(@Param("train") Train train);
    
    // Sum of confirmed seats for a train
    @Query("SELECT COALESCE(SUM(b.numberOfSeats), 0) FROM Booking b WHERE b.train = :train AND b.status = 'CONFIRMED'")
    Integer sumConfirmedSeatsByTrain(@Param("train") Train train);
    
    // Find bookings that can be cancelled (more than 24 hours before departure)
    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.train.departureTime > :cutoffTime ORDER BY b.bookingDate DESC")
    List<Booking> findCancellableBookings(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find bookings that are past cancellation time (less than 24 hours before departure)
    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.train.departureTime <= :cutoffTime ORDER BY b.bookingDate DESC")
    List<Booking> findNonCancellableBookings(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find bookings by multiple criteria
    @Query("SELECT b FROM Booking b WHERE " +
           "(:user IS NULL OR b.user = :user) AND " +
           "(:train IS NULL OR b.train = :train) AND " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:passengerEmail IS NULL OR b.passengerEmail = :passengerEmail) AND " +
           "(:startDate IS NULL OR b.bookingDate >= :startDate) AND " +
           "(:endDate IS NULL OR b.bookingDate <= :endDate) " +
           "ORDER BY b.bookingDate DESC")
    List<Booking> findBookingsByMultipleCriteria(
        @Param("user") Users user,
        @Param("train") Train train,
        @Param("status") Booking.BookingStatus status,
        @Param("passengerEmail") String passengerEmail,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Find recent bookings for admin dashboard
    @Query("SELECT b FROM Booking b WHERE b.bookingDate >= :startDate ORDER BY b.bookingDate DESC")
    List<Booking> findRecentBookings(@Param("startDate") LocalDateTime startDate);
    
    // Count bookings by status
    long countByStatus(Booking.BookingStatus status);
    
    // Count bookings by user
    long countByUser(Users user);
    
    // Count bookings by train
    long countByTrain(Train train);
    
    // Find bookings with duplicate passenger information on same train
    @Query("SELECT b FROM Booking b WHERE b.train = :train AND b.passengerEmail = :email AND b.id != :excludeId")
    List<Booking> findDuplicatePassengerBookings(
        @Param("train") Train train,
        @Param("email") String email,
        @Param("excludeId") Integer excludeId);
    
    // Find bookings for revenue calculation
    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.bookingDate BETWEEN :startDate AND :endDate ORDER BY b.bookingDate DESC")
    List<Booking> findRevenueBookings(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Calculate total revenue for a period
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = 'CONFIRMED' AND b.bookingDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal calculateTotalRevenue(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Check if booking reference exists (for uniqueness)
    boolean existsByBookingReference(String bookingReference);
    
    // Find bookings by passenger name (fuzzy search)
    @Query("SELECT b FROM Booking b WHERE LOWER(b.passengerName) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY b.bookingDate DESC")
    List<Booking> findByPassengerNameContainingIgnoreCase(@Param("name") String name);
}
