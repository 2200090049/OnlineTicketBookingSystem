package org.otbs.www.backend.bus.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "buses")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Bus name is required")
    @Size(min = 2, max = 100, message = "Bus name must be between 2 and 100 characters")
    private String busName;

    @NotBlank(message = "Bus number is required")
    @Pattern(regexp = "^[A-Z]{2}-\\d{2}-[A-Z]-\\d{4}$", message = "Invalid bus number format. Use format: KA-01-F-1234")
    private String busNumber;

    @NotBlank(message = "Operator name is required")
    @Size(min = 2, max = 100, message = "Operator name must be between 2 and 100 characters")
    private String operatorName;

    @NotBlank(message = "Source city is required")
    @Size(min = 2, max = 50, message = "Source city must be between 2 and 50 characters")
    private String sourceCity;

    @NotBlank(message = "Destination city is required")
    @Size(min = 2, max = 50, message = "Destination city must be between 2 and 50 characters")
    private String destinationCity;

    @NotNull(message = "Departure time is required")
    private LocalDateTime departureTime;

    @NotNull(message = "Arrival time is required")
    private LocalDateTime arrivalTime;

    @NotNull(message = "Total seats is required")
    @Min(value = 10, message = "Total seats must be at least 10")
    @Max(value = 60, message = "Total seats cannot exceed 60")
    private Integer totalSeats;

    @NotNull(message = "Available seats is required")
    @Min(value = 0, message = "Available seats cannot be negative")
    private Integer availableSeats;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 6, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;

    @NotNull(message = "Bus type is required")
    @Enumerated(EnumType.STRING)
    private BusType busType;

    @Size(max = 500, message = "Amenities description cannot exceed 500 characters")
    private String amenities;

    @NotNull(message = "Bus status is required")
    @Enumerated(EnumType.STRING)
    private BusStatus status = BusStatus.ACTIVE;

    @Min(value = 8, message = "Seat rows must be at least 8")
    @Max(value = 15, message = "Seat rows cannot exceed 15")
    private Integer seatRows;

    @Min(value = 2, message = "Seat columns must be at least 2")
    @Max(value = 4, message = "Seat columns cannot exceed 4")
    private Integer seatColumns;

    @Size(max = 1000, message = "Seat layout cannot exceed 1000 characters")
    private String seatLayout; // JSON string representing seat configuration

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Enums
    public enum BusType {
        AC_SLEEPER("AC Sleeper"),
        NON_AC_SLEEPER("Non-AC Sleeper"),
        AC_SEMI_SLEEPER("AC Semi Sleeper"),
        NON_AC_SEMI_SLEEPER("Non-AC Semi Sleeper"),
        AC_SEATER("AC Seater"),
        NON_AC_SEATER("Non-AC Seater"),
        VOLVO_AC("Volvo AC"),
        VOLVO_MULTI_AXLE("Volvo Multi Axle"),
        ORDINARY("Ordinary");

        private final String displayName;

        BusType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum BusStatus {
        ACTIVE("Active"),
        INACTIVE("Inactive"),
        CANCELLED("Cancelled"),
        MAINTENANCE("Under Maintenance");

        private final String displayName;

        BusStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.availableSeats == null) {
            this.availableSeats = this.totalSeats;
        }
        if (this.seatRows == null) {
            this.seatRows = 10;
        }
        if (this.seatColumns == null) {
            this.seatColumns = 4;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Bus() {}

    public Bus(String busName, String busNumber, String operatorName, String sourceCity,
               String destinationCity, LocalDateTime departureTime, LocalDateTime arrivalTime,
               Integer totalSeats, BigDecimal price, BusType busType) {
        this.busName = busName;
        this.busNumber = busNumber;
        this.operatorName = operatorName;
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.totalSeats = totalSeats;
        this.availableSeats = totalSeats;
        this.price = price;
        this.busType = busType;
        this.status = BusStatus.ACTIVE;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getBusName() {
        return busName;
    }

    public void setBusName(String busName) {
        this.busName = busName;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public void setBusNumber(String busNumber) {
        this.busNumber = busNumber;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getSourceCity() {
        return sourceCity;
    }

    public void setSourceCity(String sourceCity) {
        this.sourceCity = sourceCity;
    }

    public String getDestinationCity() {
        return destinationCity;
    }

    public void setDestinationCity(String destinationCity) {
        this.destinationCity = destinationCity;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BusType getBusType() {
        return busType;
    }

    public void setBusType(BusType busType) {
        this.busType = busType;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public BusStatus getStatus() {
        return status;
    }

    public void setStatus(BusStatus status) {
        this.status = status;
    }

    public Integer getSeatRows() {
        return seatRows;
    }

    public void setSeatRows(Integer seatRows) {
        this.seatRows = seatRows;
    }

    public Integer getSeatColumns() {
        return seatColumns;
    }

    public void setSeatColumns(Integer seatColumns) {
        this.seatColumns = seatColumns;
    }

    public String getSeatLayout() {
        return seatLayout;
    }

    public void setSeatLayout(String seatLayout) {
        this.seatLayout = seatLayout;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods
    public long getDurationInMinutes() {
        if (departureTime != null && arrivalTime != null) {
            return java.time.Duration.between(departureTime, arrivalTime).toMinutes();
        }
        return 0;
    }

    public boolean isAvailable() {
        return status == BusStatus.ACTIVE && availableSeats > 0;
    }

    public double getOccupancyPercentage() {
        if (totalSeats == null || totalSeats == 0) {
            return 0.0;
        }
        int bookedSeats = totalSeats - (availableSeats != null ? availableSeats : 0);
        return (double) bookedSeats / totalSeats * 100.0;
    }

    public boolean canBookSeats(int requestedSeats) {
        return isAvailable() && availableSeats >= requestedSeats;
    }

    @Override
    public String toString() {
        return "Bus{" +
                "id=" + id +
                ", busName='" + busName + '\'' +
                ", busNumber='" + busNumber + '\'' +
                ", operatorName='" + operatorName + '\'' +
                ", sourceCity='" + sourceCity + '\'' +
                ", destinationCity='" + destinationCity + '\'' +
                ", departureTime=" + departureTime +
                ", arrivalTime=" + arrivalTime +
                ", totalSeats=" + totalSeats +
                ", availableSeats=" + availableSeats +
                ", price=" + price +
                ", busType=" + busType +
                ", status=" + status +
                '}';
    }
}