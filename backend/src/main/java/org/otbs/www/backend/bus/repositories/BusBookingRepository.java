package org.otbs.www.backend.bus.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.otbs.www.backend.bus.models.Bus;
import org.otbs.www.backend.bus.models.BusBooking;
import org.otbs.www.backend.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BusBookingRepository extends JpaRepository<BusBooking, Integer> {
    
    // Find bookings by user
    List<BusBooking> findByUserOrderByBookingDateDesc(Users user);
    
    // Find bookings by user with EAGER loading
    @Query("SELECT b FROM BusBooking b JOIN FETCH b.bus JOIN FETCH b.user WHERE b.user = :user ORDER BY b.bookingDate DESC")
    List<BusBooking> findByUserWithBusAndUserOrderByBookingDateDesc(@Param("user") Users user);
    
    // Find bookings by bus
    List<BusBooking> findByBusOrderByBookingDateDesc(Bus bus);
    
    // Find bookings by booking reference
    Optional<BusBooking> findByBookingReference(String bookingReference);
    
    // Find bookings by status
    List<BusBooking> findByStatusOrderByBookingDateDesc(BusBooking.BookingStatus status);
    
    // Find bookings by user and status
    List<BusBooking> findByUserAndStatusOrderByBookingDateDesc(Users user, BusBooking.BookingStatus status);
    
    // Find bookings by user and status with EAGER loading
    @Query("SELECT b FROM BusBooking b JOIN FETCH b.bus JOIN FETCH b.user WHERE b.user = :user AND b.status = :status ORDER BY b.bookingDate DESC")
    List<BusBooking> findByUserAndStatusWithBusAndUserOrderByBookingDateDesc(@Param("user") Users user, @Param("status") BusBooking.BookingStatus status);
    
    // Find bookings by bus and status
    List<BusBooking> findByBusAndStatusOrderByBookingDateDesc(Bus bus, BusBooking.BookingStatus status);
    
    // Find bookings by date range
    @Query("SELECT b FROM BusBooking b WHERE b.bookingDate BETWEEN :startDate AND :endDate " +
           "ORDER BY b.bookingDate DESC")
    List<BusBooking> findBookingsByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Find bookings for today
    @Query("SELECT b FROM BusBooking b WHERE DATE(b.bookingDate) = CURRENT_DATE " +
           "ORDER BY b.bookingDate DESC")
    List<BusBooking> findTodaysBookings();
    
    // Find bookings for a specific date
    @Query("SELECT b FROM BusBooking b WHERE DATE(b.bookingDate) = DATE(:date) " +
           "ORDER BY b.bookingDate DESC")
    List<BusBooking> findBookingsByDate(@Param("date") LocalDateTime date);
    
    // Count bookings by status
    @Query("SELECT COUNT(b) FROM BusBooking b WHERE b.status = :status")
    Long countBookingsByStatus(@Param("status") BusBooking.BookingStatus status);
    
    // Count bookings by user
    @Query("SELECT COUNT(b) FROM BusBooking b WHERE b.user = :user")
    Long countBookingsByUser(@Param("user") Users user);
    
    // Count bookings by bus
    @Query("SELECT COUNT(b) FROM BusBooking b WHERE b.bus = :bus")
    Long countBookingsByBus(@Param("bus") Bus bus);
    
    // Calculate total revenue
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BusBooking b WHERE b.status = 'CONFIRMED'")
    BigDecimal calculateTotalRevenue();
    
    // Calculate revenue for a date range
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BusBooking b WHERE b.status = 'CONFIRMED' " +
           "AND b.bookingDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateRevenueByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Calculate revenue for today
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BusBooking b WHERE b.status = 'CONFIRMED' " +
           "AND DATE(b.bookingDate) = CURRENT_DATE")
    BigDecimal calculateTodaysRevenue();
    
    // Calculate revenue by bus
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BusBooking b WHERE b.bus = :bus " +
           "AND b.status = 'CONFIRMED'")
    BigDecimal calculateRevenueByBus(@Param("bus") Bus bus);
    
    // Calculate revenue by user
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BusBooking b WHERE b.user = :user " +
           "AND b.status = 'CONFIRMED'")
    BigDecimal calculateRevenueByUser(@Param("user") Users user);
    
    // Find recent bookings (last N days)
    @Query("SELECT b FROM BusBooking b WHERE b.bookingDate >= :sinceDate " +
           "ORDER BY b.bookingDate DESC")
    List<BusBooking> findRecentBookings(@Param("sinceDate") LocalDateTime sinceDate);
    
    // Find upcoming bookings (bookings for buses departing in the future)
    @Query("SELECT b FROM BusBooking b WHERE b.bus.departureTime > CURRENT_TIMESTAMP " +
           "AND b.status = 'CONFIRMED' ORDER BY b.bus.departureTime ASC")
    List<BusBooking> findUpcomingBookings();
    
    // Find upcoming bookings by user
    @Query("SELECT b FROM BusBooking b WHERE b.user = :user " +
           "AND b.bus.departureTime > CURRENT_TIMESTAMP " +
           "AND b.status = 'CONFIRMED' ORDER BY b.bus.departureTime ASC")
    List<BusBooking> findUpcomingBookingsByUser(@Param("user") Users user);
    
    // Find past bookings (bookings for buses that have already departed)
    @Query("SELECT b FROM BusBooking b WHERE b.bus.departureTime < CURRENT_TIMESTAMP " +
           "AND b.status = 'CONFIRMED' ORDER BY b.bus.departureTime DESC")
    List<BusBooking> findPastBookings();
    
    // Find past bookings by user
    @Query("SELECT b FROM BusBooking b WHERE b.user = :user " +
           "AND b.bus.departureTime < CURRENT_TIMESTAMP " +
           "AND b.status = 'CONFIRMED' ORDER BY b.bus.departureTime DESC")
    List<BusBooking> findPastBookingsByUser(@Param("user") Users user);
    
    // Find cancellable bookings (bookings that can still be cancelled)
    @Query("SELECT b FROM BusBooking b WHERE b.status = 'CONFIRMED' " +
           "AND b.bus.departureTime > :cutoffTime")
    List<BusBooking> findCancellableBookings(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find cancellable bookings by user
    @Query("SELECT b FROM BusBooking b WHERE b.user = :user AND b.status = 'CONFIRMED' " +
           "AND b.bus.departureTime > :cutoffTime")
    List<BusBooking> findCancellableBookingsByUser(
        @Param("user") Users user,
        @Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find bookings by passenger email
    List<BusBooking> findByPassengerEmailOrderByBookingDateDesc(String passengerEmail);
    
    // Find bookings by passenger phone
    List<BusBooking> findByPassengerPhoneOrderByBookingDateDesc(String passengerPhone);
    
    // Get booking statistics by date range
    @Query("SELECT DATE(b.bookingDate) as bookingDate, COUNT(b) as bookingCount, " +
           "SUM(b.numberOfSeats) as totalSeats, SUM(b.totalAmount) as totalRevenue " +
           "FROM BusBooking b WHERE b.bookingDate BETWEEN :startDate AND :endDate " +
           "AND b.status = 'CONFIRMED' " +
           "GROUP BY DATE(b.bookingDate) ORDER BY bookingDate DESC")
    List<Object[]> getBookingStatsByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Get popular routes by booking count
    @Query("SELECT b.bus.sourceCity, b.bus.destinationCity, COUNT(b) as bookingCount, " +
           "SUM(b.totalAmount) as totalRevenue " +
           "FROM BusBooking b WHERE b.status = 'CONFIRMED' " +
           "GROUP BY b.bus.sourceCity, b.bus.destinationCity " +
           "ORDER BY bookingCount DESC")
    List<Object[]> getPopularRoutesByBookingCount();
    
    // Get popular buses by booking count
    @Query("SELECT b.bus.id, b.bus.busName, b.bus.operatorName, COUNT(b) as bookingCount, " +
           "SUM(b.totalAmount) as totalRevenue " +
           "FROM BusBooking b WHERE b.status = 'CONFIRMED' " +
           "GROUP BY b.bus.id, b.bus.busName, b.bus.operatorName " +
           "ORDER BY bookingCount DESC")
    List<Object[]> getPopularBusesByBookingCount();
    
    // Find bookings with refunds
    List<BusBooking> findByStatusAndRefundAmountIsNotNullOrderByUpdatedAtDesc(BusBooking.BookingStatus status);
    
    // Calculate total refunds
    @Query("SELECT COALESCE(SUM(b.refundAmount), 0) FROM BusBooking b WHERE b.refundAmount IS NOT NULL")
    BigDecimal calculateTotalRefunds();
    
    // Calculate refunds by date range
    @Query("SELECT COALESCE(SUM(b.refundAmount), 0) FROM BusBooking b WHERE b.refundAmount IS NOT NULL " +
           "AND b.cancellationDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateRefundsByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    // Find bookings by payment method
    List<BusBooking> findByPaymentMethodOrderByBookingDateDesc(String paymentMethod);
    
    // Find bookings by payment reference
    Optional<BusBooking> findByPaymentReference(String paymentReference);
    
    // Get monthly booking statistics
    @Query("SELECT YEAR(b.bookingDate) as year, MONTH(b.bookingDate) as month, " +
           "COUNT(b) as bookingCount, SUM(b.totalAmount) as revenue " +
           "FROM BusBooking b WHERE b.status = 'CONFIRMED' " +
           "GROUP BY YEAR(b.bookingDate), MONTH(b.bookingDate) " +
           "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlyBookingStatistics();
    
    // Find duplicate bookings (same user, bus, and seats within a time window)
    @Query("SELECT b FROM BusBooking b WHERE b.user = :user AND b.bus = :bus " +
           "AND b.seatNumbers = :seatNumbers AND b.bookingDate >= :timeWindow " +
           "AND b.status != 'CANCELLED'")
    List<BusBooking> findPotentialDuplicateBookings(
        @Param("user") Users user,
        @Param("bus") Bus bus,
        @Param("seatNumbers") String seatNumbers,
        @Param("timeWindow") LocalDateTime timeWindow);
}