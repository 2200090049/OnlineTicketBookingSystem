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
    private JwtUtil jwtUtil;

    @Autowired
    private Validator validator;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Random random = new Random();

    // OTP storage with expiration time (5 minutes)
    private final Map<String, OTPData> otpStore = new ConcurrentHashMap<>();
    private final Map<String, Users> pendingRegistrations = new ConcurrentHashMap<>();
    
    // OTP data class to store OTP and timestamp
    private static class OTPData {
        private final String otp;
        private final long timestamp;
        
        public OTPData(String otp) {
            this.otp = otp;
            this.timestamp = System.currentTimeMillis();
        }
        
        public String getOtp() { return otp; }
        public long getTimestamp() { return timestamp; }
        
        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > 300000; // 5 minutes
        }
    }

    private String generateOTP() {
        return String.format("%06d", random.nextInt(1000000));
    }

    private void cleanupExpiredOTPs() {
        otpStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }

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

        // Cleanup expired OTPs
        cleanupExpiredOTPs();
        
        String otp = generateOTP();
        otpStore.put(user.getEmail(), new OTPData(otp));
        pendingRegistrations.put(user.getEmail(), user);

        try {
            emailService.sendOTP(user.getEmail(), otp);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent successfully to " + user.getEmail());
            response.put("email", user.getEmail());
            response.put("expiresIn", "5 minutes");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Cleanup on failure
            otpStore.remove(user.getEmail());
            pendingRegistrations.remove(user.getEmail());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send OTP: " + e.getMessage()));
        }
    }

    public ResponseEntity<Object> verifyOTP(String email, String otp) {
        // Cleanup expired OTPs first
        cleanupExpiredOTPs();
        
        OTPData otpData = otpStore.get(email);
        Users pendingUser = pendingRegistrations.get(email);

        if (otpData == null || pendingUser == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP request"));
        }

        if (otpData.isExpired()) {
            // Cleanup expired data
            otpStore.remove(email);
            pendingRegistrations.remove(email);
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired. Please request a new one."));
        }

        if (!otpData.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
        }

        // Hash password and save user
        pendingUser.setPassword(passwordEncoder.encode(pendingUser.getPassword()));
        pendingUser.setStatus("ACTIVE");
        Users savedUser = authRepo.save(pendingUser);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getUsername());
        } catch (Exception e) {
            // Log but don't fail registration if welcome email fails
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

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

    public ResponseEntity<Object> resendOTP(String email) {
        // Cleanup expired OTPs first
        cleanupExpiredOTPs();
        
        Users pendingUser = pendingRegistrations.get(email);
        if (pendingUser == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No pending registration found for this email"));
        }

        String otp = generateOTP();
        otpStore.put(email, new OTPData(otp));

        try {
            emailService.sendOTP(email, otp);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP resent successfully to " + email);
            response.put("email", email);
            response.put("expiresIn", "5 minutes");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to resend OTP: " + e.getMessage()));
        }
    }

    public ResponseEntity<Object> initiatePasswordReset(String email) {
        Users user = authRepo.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        // Cleanup expired OTPs first
        cleanupExpiredOTPs();
        
        String otp = generateOTP();
        otpStore.put(email, new OTPData(otp));

        try {
            emailService.sendPasswordResetOTP(email, otp);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password reset OTP sent successfully to " + email);
            response.put("email", email);
            response.put("expiresIn", "5 minutes");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Cleanup on failure
            otpStore.remove(email);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send password reset OTP: " + e.getMessage()));
        }
    }

    public ResponseEntity<Object> resetPassword(String email, String otp, String newPassword) {
        // Cleanup expired OTPs first
        cleanupExpiredOTPs();
        
        OTPData otpData = otpStore.get(email);
        if (otpData == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP request"));
        }

        if (otpData.isExpired()) {
            // Cleanup expired data
            otpStore.remove(email);
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired. Please request a new one."));
        }

        if (!otpData.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
        }

        Users user = authRepo.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        authRepo.save(user);

        // Cleanup OTP
        otpStore.remove(email);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset successful");
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Object> validateOTP(String email, String otp) {
        // Cleanup expired OTPs first
        cleanupExpiredOTPs();
        
        OTPData otpData = otpStore.get(email);
        if (otpData == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP request"));
        }

        if (otpData.isExpired()) {
            // Cleanup expired data
            otpStore.remove(email);
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired. Please request a new one."));
        }

        if (!otpData.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP is valid");
        response.put("email", email);
        return ResponseEntity.ok(response);
    }

}
