package org.otbs.www.backend.train.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "trains")
public class Train {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @NotBlank(message = "Train name is required")
    @Size(max = 100, message = "Train name must not exceed 100 characters")
    private String trainName;
    
    @NotBlank(message = "Train number is required")
    @Pattern(regexp = "^[A-Z0-9]{3,10}$", message = "Train number must be 3-10 alphanumeric characters")
    private String trainNumber;
    
    @NotBlank(message = "Source station is required")
    @Size(max = 50, message = "Source station must not exceed 50 characters")
    private String sourceStation;
    
    @NotBlank(message = "Destination station is required")
    @Size(max = 50, message = "Destination station must not exceed 50 characters")
    private String destinationStation;
    
    @NotNull(message = "Departure time is required")
    private LocalDateTime departureTime;
    
    @NotNull(message = "Arrival time is required")
    private LocalDateTime arrivalTime;
    
    @NotNull(message = "Total seats is required")
    @Min(value = 1, message = "Total seats must be at least 1")
    @Max(value = 2000, message = "Total seats cannot exceed 2000")
    private Integer totalSeats;
    
    @NotNull(message = "Available seats is required")
    @Min(value = 0, message = "Available seats cannot be negative")
    private Integer availableSeats;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 10 integer digits and 2 decimal places")
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Train class is required")
    private TrainClass trainClass;
    
    @Enumerated(EnumType.STRING)
    private TrainStatus status = TrainStatus.ACTIVE;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Enums
    public enum TrainClass {
        FIRST_AC, SECOND_AC, THIRD_AC, SLEEPER, GENERAL
    }
    
    public enum TrainStatus {
        ACTIVE, INACTIVE, CANCELLED
    }
    
    // Constructors
    public Train() {}
    
    public Train(String trainName, String trainNumber, String sourceStation, 
                String destinationStation, LocalDateTime departureTime, 
                LocalDateTime arrivalTime, Integer totalSeats, BigDecimal price, 
                TrainClass trainClass) {
        this.trainName = trainName;
        this.trainNumber = trainNumber;
        this.sourceStation = sourceStation;
        this.destinationStation = destinationStation;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.totalSeats = totalSeats;
        this.availableSeats = totalSeats; // Initially available seats = total seats
        this.price = price;
        this.trainClass = trainClass;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getTrainName() {
        return trainName;
    }
    
    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }
    
    public String getTrainNumber() {
        return trainNumber;
    }
    
    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }
    
    public String getSourceStation() {
        return sourceStation;
    }
    
    public void setSourceStation(String sourceStation) {
        this.sourceStation = sourceStation;
    }
    
    public String getDestinationStation() {
        return destinationStation;
    }
    
    public void setDestinationStation(String destinationStation) {
        this.destinationStation = destinationStation;
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
    
    public TrainClass getTrainClass() {
        return trainClass;
    }
    
    public void setTrainClass(TrainClass trainClass) {
        this.trainClass = trainClass;
    }
    
    public TrainStatus getStatus() {
        return status;
    }
    
    public void setStatus(TrainStatus status) {
        this.status = status;
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
    public boolean isAvailable() {
        return status == TrainStatus.ACTIVE && availableSeats > 0;
    }
    
    public boolean hasSeatsAvailable(int requestedSeats) {
        return isAvailable() && availableSeats >= requestedSeats;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
