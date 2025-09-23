package org.otbs.www.backend.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.repositories.UserRepo;
import org.otbs.www.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private Validator validator;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Helper method to get current authenticated user
    private Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String email = authentication.getName();
        return userRepo.findByEmail(email);
    }

    public ResponseEntity<Object> getMe() {
        try {
            Users currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not authenticated"));
            }

            // Create response without sensitive information
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", currentUser.getId());
            userResponse.put("username", currentUser.getUsername());
            userResponse.put("email", currentUser.getEmail());
            userResponse.put("phone", currentUser.getPhone());
            userResponse.put("status", currentUser.getStatus());
            userResponse.put("createdAt", currentUser.getCreated_at());
            userResponse.put("updatedAt", currentUser.getUpdated_at());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User profile retrieved successfully");
            response.put("user", userResponse);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve user profile: " + e.getMessage()));
        }
    }

    public ResponseEntity<Object> updateMe(Users updatedUser) {
        try {
            Users currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not authenticated"));
            }

            // Check if account is active
            if (!"ACTIVE".equals(currentUser.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Account is not active"));
            }

            // Only allow updating certain fields
            if (updatedUser.getUsername() != null && !updatedUser.getUsername().trim().isEmpty()) {
                // Check if username is already taken by another user
                Users existingUserByUsername = userRepo.findByUsername(updatedUser.getUsername());
                if (existingUserByUsername != null && !existingUserByUsername.getId().equals(currentUser.getId())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Username already taken"));
                }
                currentUser.setUsername(updatedUser.getUsername().trim());
            }

            if (updatedUser.getPhone() != null && !updatedUser.getPhone().trim().isEmpty()) {
                // Check if phone number is already taken by another user
                Users existingUserByPhone = userRepo.findByPhone(updatedUser.getPhone());
                if (existingUserByPhone != null && !existingUserByPhone.getId().equals(currentUser.getId())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Phone number already registered"));
                }
                currentUser.setPhone(updatedUser.getPhone().trim());
            }

            // Validate updated user data
            Set<ConstraintViolation<Users>> violations = validator.validate(currentUser);
            if (!violations.isEmpty()) {
                Map<String, String> errors = violations.stream()
                        .collect(Collectors.toMap(
                                violation -> violation.getPropertyPath().toString(),
                                ConstraintViolation::getMessage
                        ));
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            // Save updated user
            Users savedUser = userRepo.save(currentUser);

            // Create response without sensitive information
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", savedUser.getId());
            userResponse.put("username", savedUser.getUsername());
            userResponse.put("email", savedUser.getEmail());
            userResponse.put("phone", savedUser.getPhone());
            userResponse.put("status", savedUser.getStatus());
            userResponse.put("updatedAt", savedUser.getUpdated_at());
            userResponse.put("Avatar", savedUser.getAvatar());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", userResponse);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update profile: " + e.getMessage()));
        }
    }

    public ResponseEntity<Object> deleteMe(String password) {
        try {
            Users currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not authenticated"));
            }

            // Verify password for security
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password is required for account deletion"));
            }

            if (!passwordEncoder.matches(password, currentUser.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid password"));
            }

            // Instead of hard delete, mark account as DELETED
            currentUser.setStatus("InACTIVE");
            userRepo.save(currentUser);

            // Send account deletion confirmation email
            try {
                emailService.sendAccountDeletionEmail(currentUser.getEmail(), currentUser.getUsername());
            } catch (Exception e) {
                // Log but don't fail deletion if email fails
                System.err.println("Failed to send account deletion email: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete account: " + e.getMessage()));
        }
    }

    public ResponseEntity<Object> changePassword(String currentPassword, String newPassword, String confirmPassword) {
        try {
            Users currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not authenticated"));
            }

            // Check if account is active
            if (!"ACTIVE".equals(currentUser.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Account is not active"));
            }

            // Validate input
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Current password is required"));
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "New password is required"));
            }

            if (confirmPassword == null || !newPassword.equals(confirmPassword)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "New password and confirm password do not match"));
            }

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, currentUser.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Current password is incorrect"));
            }

            // Check if new password is different from current password
            if (passwordEncoder.matches(newPassword, currentUser.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "New password must be different from current password"));
            }

            // Validate new password strength (basic validation)
            if (newPassword.length() < 8) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "New password must be at least 8 characters long"));
            }

            // Update password
            currentUser.setPassword(passwordEncoder.encode(newPassword));
            userRepo.save(currentUser);

            // Send password change confirmation email
            try {
                emailService.sendPasswordChangeConfirmation(currentUser.getEmail(), currentUser.getUsername());
            } catch (Exception e) {
                // Log but don't fail password change if email fails
                System.err.println("Failed to send password change confirmation email: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password changed successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to change password: " + e.getMessage()));
        }
    }
}