package org.otbs.www.backend.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.models.Vendor_Type;
import org.otbs.www.backend.repositories.UserRepo;
import org.otbs.www.backend.train.models.Booking;
import org.otbs.www.backend.train.models.Train;
import org.otbs.www.backend.train.repositories.BookingRepository;
import org.otbs.www.backend.train.repositories.TrainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TrainRepository trainRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepo userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if trains already exist
        if (trainRepository.count() > 0) {
            System.out.println("Trains already exist, skipping data initialization");
            return;
        }

        System.out.println("Initializing sample train data...");

        // Create sample trains
        List<Train> sampleTrains = Arrays.asList(
            // Delhi to Mumbai
            new Train("Rajdhani Express", "RAJ001", "Delhi", "Mumbai", 
                LocalDateTime.now().plusDays(1).withHour(8).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(20).withMinute(0).withSecond(0),
                100, new BigDecimal("2500"), Train.TrainClass.FIRST_AC),
            
            new Train("Shatabdi Express", "SHAT001", "Delhi", "Mumbai",
                LocalDateTime.now().plusDays(1).withHour(14).withMinute(30).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(23).withMinute(30).withSecond(0),
                80, new BigDecimal("1800"), Train.TrainClass.SECOND_AC),
            
            new Train("Duronto Express", "DUR001", "Delhi", "Mumbai",
                LocalDateTime.now().plusDays(2).withHour(6).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(2).withHour(18).withMinute(0).withSecond(0),
                120, new BigDecimal("1200"), Train.TrainClass.THIRD_AC),

            // Bangalore to Chennai
            new Train("Brindavan Express", "BRIN001", "Bangalore", "Chennai",
                LocalDateTime.now().plusDays(1).withHour(7).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(13).withMinute(0).withSecond(0),
                90, new BigDecimal("800"), Train.TrainClass.SECOND_AC),
            
            new Train("Shatabdi Express", "SHAT002", "Bangalore", "Chennai",
                LocalDateTime.now().plusDays(1).withHour(15).withMinute(30).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(21).withMinute(30).withSecond(0),
                60, new BigDecimal("1200"), Train.TrainClass.FIRST_AC),

            // Mumbai to Pune
            new Train("Deccan Express", "DEC001", "Mumbai", "Pune",
                LocalDateTime.now().plusDays(1).withHour(9).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(12).withMinute(0).withSecond(0),
                70, new BigDecimal("500"), Train.TrainClass.SLEEPER),
            
            new Train("Intercity Express", "INT001", "Mumbai", "Pune",
                LocalDateTime.now().plusDays(1).withHour(16).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(19).withMinute(0).withSecond(0),
                50, new BigDecimal("600"), Train.TrainClass.SECOND_AC),

            // Delhi to Bangalore
            new Train("Karnataka Express", "KAR001", "Delhi", "Bangalore",
                LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(3).withHour(8).withMinute(0).withSecond(0),
                150, new BigDecimal("2000"), Train.TrainClass.SLEEPER),
            
            new Train("Rajdhani Express", "RAJ002", "Delhi", "Bangalore",
                LocalDateTime.now().plusDays(2).withHour(18).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(3).withHour(16).withMinute(0).withSecond(0),
                100, new BigDecimal("3000"), Train.TrainClass.FIRST_AC),

            // Chennai to Coimbatore
            new Train("Nilgiri Express", "NIL001", "Chennai", "Coimbatore",
                LocalDateTime.now().plusDays(1).withHour(11).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(18).withMinute(0).withSecond(0),
                80, new BigDecimal("700"), Train.TrainClass.SECOND_AC)
        );

        // Save all trains
        trainRepository.saveAll(sampleTrains);
        
        System.out.println("Sample train data initialized successfully! Created " + sampleTrains.size() + " trains.");
        
        // Create sample users and bookings
        createSampleUsersAndBookings(sampleTrains);
    }
    
    private void createSampleUsersAndBookings(List<Train> trains) {
        // Check if users already exist
        if (userRepository.count() > 0) {
            System.out.println("Users already exist, skipping user and booking initialization");
            return;
        }
        
        System.out.println("Creating sample users and bookings...");
        
        // Create sample users
        Users user1 = new Users();
        user1.setUsername("johndoe");
        user1.setEmail("john.doe@example.com");
        user1.setPassword(passwordEncoder.encode("password123"));
        user1.setPhone("9876543210");
        user1.setRole("USER");
        user1.setVendor(false);
        user1.setStatus("ACTIVE");
        userRepository.save(user1);
        
        Users user2 = new Users();
        user2.setUsername("janesmith");
        user2.setEmail("jane.smith@example.com");
        user2.setPassword(passwordEncoder.encode("password123"));
        user2.setPhone("9876543211");
        user2.setRole("USER");
        user2.setVendor(false);
        user2.setStatus("ACTIVE");
        userRepository.save(user2);
        
        Users user3 = new Users();
        user3.setUsername("mikejohnson");
        user3.setEmail("mike.johnson@example.com");
        user3.setPassword(passwordEncoder.encode("password123"));
        user3.setPhone("9876543212");
        user3.setRole("USER");
        user3.setVendor(false);
        user3.setStatus("ACTIVE");
        userRepository.save(user3);
        
        // Create train vendor admin
        Users trainVendor = new Users();
        trainVendor.setUsername("trainadmin");
        trainVendor.setEmail("train.admin@example.com");
        trainVendor.setPassword(passwordEncoder.encode("password123"));
        trainVendor.setPhone("9876543213");
        trainVendor.setRole("VENDOR");
        trainVendor.setVendor(true);
        trainVendor.setVendorType(Vendor_Type.TRAIN_ADMIN);
        trainVendor.setStatus("ACTIVE");
        userRepository.save(trainVendor);
        
        // Create sample bookings
        List<Booking> sampleBookings = Arrays.asList(
            // User 1 bookings
            createBooking(user1, trains.get(0), "John Doe", "john.doe@example.com", "9876543210", 2, Booking.BookingStatus.CONFIRMED),
            createBooking(user1, trains.get(1), "John Doe", "john.doe@example.com", "9876543210", 1, Booking.BookingStatus.CONFIRMED),
            
            // User 2 bookings
            createBooking(user2, trains.get(2), "Jane Smith", "jane.smith@example.com", "9876543211", 3, Booking.BookingStatus.CONFIRMED),
            createBooking(user2, trains.get(3), "Jane Smith", "jane.smith@example.com", "9876543211", 1, Booking.BookingStatus.CANCELLED),
            
            // User 3 bookings
            createBooking(user3, trains.get(4), "Mike Johnson", "mike.johnson@example.com", "9876543212", 2, Booking.BookingStatus.CONFIRMED),
            createBooking(user3, trains.get(5), "Mike Johnson", "mike.johnson@example.com", "9876543212", 1, Booking.BookingStatus.PENDING)
        );
        
        // Save all bookings
        bookingRepository.saveAll(sampleBookings);
        
        System.out.println("Sample users and bookings created successfully! Created " + sampleBookings.size() + " bookings.");
    }
    
    private Booking createBooking(Users user, Train train, String passengerName, String passengerEmail, 
                                String passengerPhone, int numberOfSeats, Booking.BookingStatus status) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setTrain(train);
        booking.setPassengerName(passengerName);
        booking.setPassengerEmail(passengerEmail);
        booking.setPassengerPhone(passengerPhone);
        booking.setNumberOfSeats(numberOfSeats);
        booking.setTotalAmount(train.getPrice().multiply(BigDecimal.valueOf(numberOfSeats)));
        booking.setStatus(status);
        booking.setBookingReference("BK" + System.currentTimeMillis() + (int)(Math.random() * 1000));
        booking.setBookingDate(LocalDateTime.now().minusDays((int)(Math.random() * 7))); // Random booking date within last week
        booking.setUpdatedAt(LocalDateTime.now());
        
        return booking;
    }
}
