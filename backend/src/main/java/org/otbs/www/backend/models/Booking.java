package org.otbs.www.backend.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "bookings")
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id", nullable = false)
    @NotNull(message = "Train is required")
    private Train train;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
    
    @NotBlank(message = "Passenger name is required")
    @Size(max = 100, message = "Passenger name must not exceed 100 characters")
    private String passengerName;
    
    @NotBlank(message = "Passenger email is required")
    @Email(message = "Invalid email format")
    private String passengerEmail;
    
    @NotBlank(message = "Passenger phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String passengerPhone;
    
    @NotNull(message = "Number of seats is required")
    @Min(value = 1, message = "Number of seats must be at least 1")
    @Max(value = 10, message = "Cannot book more than 10 seats at once")
    private Integer numberOfSeats;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Total amount must have at most 10 integer digits and 2 decimal places")
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Booking status is required")
    private BookingStatus status = BookingStatus.CONFIRMED;
    
    @Column(unique = true)
    private String bookingReference; // Unique booking reference number
    
    private LocalDateTime bookingDate = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Enums
    public enum BookingStatus {
        CONFIRMED, CANCELLED, REFUNDED
    }
    
    // Constructors
    public Booking() {}
    
    public Booking(Train train, Users user, String passengerName, String passengerEmail, 
                  String passengerPhone, Integer numberOfSeats, BigDecimal totalAmount) {
        this.train = train;
        this.user = user;
        this.passengerName = passengerName;
        this.passengerEmail = passengerEmail;
        this.passengerPhone = passengerPhone;
        this.numberOfSeats = numberOfSeats;
        this.totalAmount = totalAmount;
        this.bookingReference = generateBookingReference();
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Train getTrain() {
        return train;
    }
    
    public void setTrain(Train train) {
        this.train = train;
    }
    
    public Users getUser() {
        return user;
    }
    
    public void setUser(Users user) {
        this.user = user;
    }
    
    public String getPassengerName() {
        return passengerName;
    }
    
    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }
    
    public String getPassengerEmail() {
        return passengerEmail;
    }
    
    public void setPassengerEmail(String passengerEmail) {
        this.passengerEmail = passengerEmail;
    }
    
    public String getPassengerPhone() {
        return passengerPhone;
    }
    
    public void setPassengerPhone(String passengerPhone) {
        this.passengerPhone = passengerPhone;
    }
    
    public Integer getNumberOfSeats() {
        return numberOfSeats;
    }
    
    public void setNumberOfSeats(Integer numberOfSeats) {
        this.numberOfSeats = numberOfSeats;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public BookingStatus getStatus() {
        return status;
    }
    
    public void setStatus(BookingStatus status) {
        this.status = status;
    }
    
    public String getBookingReference() {
        return bookingReference;
    }
    
    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }
    
    public LocalDateTime getBookingDate() {
        return bookingDate;
    }
    
    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Helper methods
    public boolean isConfirmed() {
        return status == BookingStatus.CONFIRMED;
    }
    
    public boolean isCancelled() {
        return status == BookingStatus.CANCELLED;
    }
    
    public boolean canBeCancelled() {
        // Can cancel if booking is confirmed and train departure is more than 24 hours away
        return isConfirmed() && 
               train.getDepartureTime().isAfter(LocalDateTime.now().plusHours(24));
    }
    
    private String generateBookingReference() {
        // Generate a unique booking reference: TKT + timestamp + random 4 digits
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.format("%04d", (int)(Math.random() * 10000));
        return "TKT" + timestamp.substring(timestamp.length() - 8) + random;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    public void prePersist() {
        if (this.bookingReference == null) {
            this.bookingReference = generateBookingReference();
        }
    }
}


