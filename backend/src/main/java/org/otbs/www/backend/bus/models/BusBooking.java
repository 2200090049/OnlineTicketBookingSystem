package org.otbs.www.backend.bus.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.otbs.www.backend.models.Users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Table(name = "bus_bookings")
public class BusBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bus_id", nullable = false)
    @NotNull(message = "Bus is required")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Bus bus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users user;

    @NotBlank(message = "Passenger name is required")
    @Size(min = 2, max = 100, message = "Passenger name must be between 2 and 100 characters")
    private String passengerName;

    @NotBlank(message = "Passenger email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String passengerEmail;

    @NotBlank(message = "Passenger phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    private String passengerPhone;

    @Min(value = 18, message = "Passenger must be at least 18 years old")
    @Max(value = 100, message = "Age cannot exceed 100 years")
    private Integer passengerAge;

    @Enumerated(EnumType.STRING)
    private Gender passengerGender;

    @NotNull(message = "Number of seats is required")
    @Min(value = 1, message = "At least one seat must be booked")
    @Max(value = 6, message = "Cannot book more than 6 seats at once")
    private Integer numberOfSeats;

    // Optional field - can be null/empty for now, will be implemented later
    @Size(max = 200, message = "Seat numbers cannot exceed 200 characters")
    private String seatNumbers; // JSON array of seat numbers like ["1A", "1B", "2A"]

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Total amount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid amount format")
    private BigDecimal totalAmount;

    @Column(unique = true)
    @Size(min = 8, max = 20, message = "Booking reference must be between 8 and 20 characters")
    private String bookingReference;

    @NotNull(message = "Booking status is required")
    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Size(max = 500, message = "Special requests cannot exceed 500 characters")
    private String specialRequests;

    private LocalDateTime bookingDate;
    private LocalDateTime updatedAt;

    // Cancellation details
    private LocalDateTime cancellationDate;
    private String cancellationReason;
    private BigDecimal refundAmount;

    // Payment details
    private String paymentMethod;
    private String paymentReference;
    private LocalDateTime paymentDate;

    // Enums
    public enum BookingStatus {
        PENDING("Pending"),
        CONFIRMED("Confirmed"),
        CANCELLED("Cancelled"),
        REFUNDED("Refunded"),
        COMPLETED("Completed");

        private final String displayName;

        BookingStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum Gender {
        MALE("Male"),
        FEMALE("Female"),
        OTHER("Other");

        private final String displayName;

        Gender(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        this.bookingDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.bookingReference == null || this.bookingReference.isEmpty()) {
            this.bookingReference = generateBookingReference();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public BusBooking() {}

    public BusBooking(Bus bus, Users user, String passengerName, String passengerEmail,
                      String passengerPhone, Integer numberOfSeats, String seatNumbers,
                      BigDecimal totalAmount) {
        this.bus = bus;
        this.user = user;
        this.passengerName = passengerName;
        this.passengerEmail = passengerEmail;
        this.passengerPhone = passengerPhone;
        this.numberOfSeats = numberOfSeats;
        this.seatNumbers = seatNumbers;
        this.totalAmount = totalAmount;
        this.status = BookingStatus.CONFIRMED;
    }

    // Helper methods
    private String generateBookingReference() {
        return "BUS" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }

    public boolean canBeCancelled() {
        if (this.status != BookingStatus.CONFIRMED) {
            return false;
        }
        
        // Check if bus departure is at least 2 hours away
        if (this.bus != null && this.bus.getDepartureTime() != null) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime cutoffTime = this.bus.getDepartureTime().minusHours(2);
            return now.isBefore(cutoffTime);
        }
        
        return false;
    }

    public BigDecimal calculateRefundAmount() {
        if (this.totalAmount == null || this.bus == null) {
            return BigDecimal.ZERO;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime departureTime = this.bus.getDepartureTime();
        
        if (departureTime == null) {
            return BigDecimal.ZERO;
        }

        long hoursUntilDeparture = java.time.Duration.between(now, departureTime).toHours();
        
        // Refund policy based on hours until departure
        if (hoursUntilDeparture >= 24) {
            return this.totalAmount.multiply(new BigDecimal("0.90")); // 90% refund
        } else if (hoursUntilDeparture >= 12) {
            return this.totalAmount.multiply(new BigDecimal("0.75")); // 75% refund
        } else if (hoursUntilDeparture >= 2) {
            return this.totalAmount.multiply(new BigDecimal("0.50")); // 50% refund
        } else {
            return BigDecimal.ZERO; // No refund
        }
    }

    public String getFormattedSeatNumbers() {
        if (seatNumbers == null || seatNumbers.isEmpty()) {
            return "";
        }
        // Remove JSON formatting and return clean seat numbers
        return seatNumbers.replaceAll("[\\[\\]\"]", "").replace(",", ", ");
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Bus getBus() {
        return bus;
    }

    public void setBus(Bus bus) {
        this.bus = bus;
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

    public Integer getPassengerAge() {
        return passengerAge;
    }

    public void setPassengerAge(Integer passengerAge) {
        this.passengerAge = passengerAge;
    }

    public Gender getPassengerGender() {
        return passengerGender;
    }

    public void setPassengerGender(Gender passengerGender) {
        this.passengerGender = passengerGender;
    }

    public Integer getNumberOfSeats() {
        return numberOfSeats;
    }

    public void setNumberOfSeats(Integer numberOfSeats) {
        this.numberOfSeats = numberOfSeats;
    }

    public String getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(String seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
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

    public LocalDateTime getCancellationDate() {
        return cancellationDate;
    }

    public void setCancellationDate(LocalDateTime cancellationDate) {
        this.cancellationDate = cancellationDate;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    @Override
    public String toString() {
        return "BusBooking{" +
                "id=" + id +
                ", bookingReference='" + bookingReference + '\'' +
                ", passengerName='" + passengerName + '\'' +
                ", numberOfSeats=" + numberOfSeats +
                ", totalAmount=" + totalAmount +
                ", status=" + status +
                ", bookingDate=" + bookingDate +
                '}';
    }
}