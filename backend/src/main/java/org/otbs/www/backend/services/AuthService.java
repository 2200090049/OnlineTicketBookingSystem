package org.otbs.www.backend.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.repositories.AuthRepo;
import org.otbs.www.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
public class AuthService {

    @Autowired
    private AuthRepo authRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private Validator validator;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final Map<String, Users> pendingRegistrations = new ConcurrentHashMap<>();

    public ResponseEntity<Object> initiateRegistration(Users user) {
        // Validate all fields
        Set<ConstraintViolation<Users>> violations = validator.validate(user);
        if (!violations.isEmpty()) {
            Map<String, String> errors = violations.stream()
                    .collect(Collectors.toMap(
                            violation -> violation.getPropertyPath().toString(),
                            ConstraintViolation::getMessage
                    ));
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        // Check if email already exists
        if (authRepo.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        // Check if username already exists
        if (authRepo.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
        }

        // Check if phone number already exists
        if (authRepo.findByPhone(user.getPhone()) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number already registered"));
        }

        String otp = generateOTP();
        otpStore.put(user.getEmail(), otp);
        pendingRegistrations.put(user.getEmail(), user);

        try {
            emailService.sendOTP(user.getEmail(), otp);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent successfully");
            response.put("email", user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send OTP: " + e.getMessage()));
        }
    }

    public ResponseEntity<Object> verifyOTP(String email, String otp) {
        String storedOTP = otpStore.get(email);
        Users pendingUser = pendingRegistrations.get(email);

        if (storedOTP == null || pendingUser == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP request"));
        }

        if (!storedOTP.equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
        }

        // Hash password and save user
        pendingUser.setPassword(passwordEncoder.encode(pendingUser.getPassword()));
        pendingUser.setStatus("ACTIVE");
        Users savedUser = authRepo.save(pendingUser);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser);

        // Cleanup
        otpStore.remove(email);
        pendingRegistrations.remove(email);

        // Return response with user + token
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful");
        response.put("user", savedUser);
        response.put("token", token);

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Object> login(String email, String password) {
        Users user = authRepo.findByEmail(email);

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials"));
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Account is not active"));
        }

        String token = jwtUtil.generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("user", user);
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    private String generateOTP() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
}
