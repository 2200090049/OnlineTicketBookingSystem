package org.otbs.www.backend.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.models.Vendor_Type;
import org.otbs.www.backend.repositories.UserRepo;
import org.otbs.www.backend.train.models.Train;
import org.otbs.www.backend.train.repositories.TrainRepository;
import org.otbs.www.backend.bus.models.Bus;
import org.otbs.www.backend.bus.repositories.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TrainRepository trainRepository;
    
    @Autowired
    private BusRepository busRepository;
    
    @Autowired
    private UserRepo userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if trains already exist
        if (trainRepository.count() > 0) {
            System.out.println("Trains already exist, skipping train data initialization");
        } else {
            initializeTrainData();
        }
        
        // Check if buses already exist
        if (busRepository.count() > 0) {
            System.out.println("Buses already exist, skipping bus data initialization");
        } else {
            initializeBusData();
        }
        
        // Create sample users and bookings
        createSampleUsersAndBookings();
    }
    
    private void initializeTrainData() {
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
    }
    
    private void initializeBusData() {
        System.out.println("Initializing sample bus data...");

        // Create sample buses
        List<Bus> sampleBuses = Arrays.asList(
            // Bangalore to Chennai
            new Bus("Express Service", "KA-01-F-1001", "RedBus Express", "Bangalore", "Chennai", 
                LocalDateTime.now().plusDays(1).withHour(8).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(14).withMinute(0).withSecond(0),
                40, new BigDecimal("800"), Bus.BusType.AC_SLEEPER),
            
            new Bus("Luxury Coach", "KA-02-F-1002", "VRL Travels", "Bangalore", "Chennai",
                LocalDateTime.now().plusDays(1).withHour(22).withMinute(30).withSecond(0),
                LocalDateTime.now().plusDays(2).withHour(6).withMinute(30).withSecond(0),
                35, new BigDecimal("1200"), Bus.BusType.AC_SLEEPER),
            
            new Bus("Economy Service", "KA-03-F-1003", "SRS Travels", "Bangalore", "Chennai",
                LocalDateTime.now().plusDays(2).withHour(9).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(2).withHour(15).withMinute(0).withSecond(0),
                45, new BigDecimal("700"), Bus.BusType.NON_AC_SEATER),

            // Delhi to Mumbai
            new Bus("Premium Service", "DL-01-F-2001", "Volvo Service", "Delhi", "Mumbai",
                LocalDateTime.now().plusDays(1).withHour(20).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(2).withHour(8).withMinute(0).withSecond(0),
                50, new BigDecimal("1500"), Bus.BusType.VOLVO_AC),
            
            new Bus("Standard Service", "PB-01-F-2002", "Punjab Roadways", "Delhi", "Mumbai",
                LocalDateTime.now().plusDays(1).withHour(18).withMinute(30).withSecond(0),
                LocalDateTime.now().plusDays(2).withHour(6).withMinute(30).withSecond(0),
                40, new BigDecimal("1000"), Bus.BusType.AC_SLEEPER),

            // Mumbai to Pune
            new Bus("Government Service", "MH-01-F-3001", "Shivneri Bus", "Mumbai", "Pune",
                LocalDateTime.now().plusDays(1).withHour(7).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(10).withMinute(30).withSecond(0),
                35, new BigDecimal("300"), Bus.BusType.NON_AC_SEATER),
            
            new Bus("AC Service", "MH-02-F-3002", "Neeta Travels", "Mumbai", "Pune",
                LocalDateTime.now().plusDays(1).withHour(14).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(17).withMinute(30).withSecond(0),
                30, new BigDecimal("500"), Bus.BusType.AC_SEATER),

            // Delhi to Bangalore
            new Bus("Long Distance", "KL-01-F-4001", "Kallada Travels", "Delhi", "Bangalore",
                LocalDateTime.now().plusDays(2).withHour(19).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(3).withHour(15).withMinute(0).withSecond(0),
                45, new BigDecimal("2000"), Bus.BusType.AC_SLEEPER),
            
            new Bus("Sleeper Coach", "AP-01-F-4002", "Orange Travels", "Delhi", "Bangalore",
                LocalDateTime.now().plusDays(2).withHour(21).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(3).withHour(17).withMinute(0).withSecond(0),
                40, new BigDecimal("1800"), Bus.BusType.NON_AC_SLEEPER),

            // Chennai to Coimbatore
            new Bus("Night Service", "TN-01-F-5001", "Parveen Travels", "Chennai", "Coimbatore",
                LocalDateTime.now().plusDays(1).withHour(23).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(2).withHour(6).withMinute(0).withSecond(0),
                40, new BigDecimal("600"), Bus.BusType.AC_SLEEPER)
        );

        // Save all buses
        busRepository.saveAll(sampleBuses);
        
        System.out.println("Sample bus data initialized successfully! Created " + sampleBuses.size() + " buses.");
    }
    
    private void createSampleUsersAndBookings() {
        // Check if users already exist
        if (userRepository.count() > 0) {
            System.out.println("Users already exist, skipping user initialization");
            return;
        }
        
        System.out.println("Creating sample users...");
        
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
        trainVendor.setRole("USER");  // Role is USER for vendors
        trainVendor.setVendor(true);
        trainVendor.setVendorType(Vendor_Type.TRAIN_ADMIN);
        trainVendor.setStatus("ACTIVE");
        userRepository.save(trainVendor);
        
        // Create bus vendor admin
        Users busVendor = new Users();
        busVendor.setUsername("busadmin");
        busVendor.setEmail("bus.admin@example.com");
        busVendor.setPassword(passwordEncoder.encode("password123"));
        busVendor.setPhone("9876543214");
        busVendor.setRole("USER");  // Role is USER for vendors
        busVendor.setVendor(true);
        busVendor.setVendorType(Vendor_Type.BUSES_ADMIN);
        busVendor.setStatus("ACTIVE");
        userRepository.save(busVendor);
        
        System.out.println("Sample users created successfully!");
    }
}
