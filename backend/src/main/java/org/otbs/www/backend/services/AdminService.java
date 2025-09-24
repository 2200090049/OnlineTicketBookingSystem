package org.otbs.www.backend.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.models.Vendor_Type;
import org.otbs.www.backend.repositories.AdminRepo;
import org.otbs.www.backend.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Transactional
@Service
public class AdminService {

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private Validator validator;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Helper method to create user response without sensitive information
    private Map<String, Object> createUserResponse(Users user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("phone", user.getPhone());
        userResponse.put("status", user.getStatus());
        userResponse.put("avatar", user.getAvatar());
        userResponse.put("isVendor", user.isVendor());
        userResponse.put("vendorType", user.getVendorType() != null ? user.getVendorType().toString() : null);
        userResponse.put("createdAt", user.getCreated_at());
        userResponse.put("updatedAt", user.getUpdated_at());
        return userResponse;
    }

    // Helper method to create paginated response
    private Map<String, Object> createPaginatedResponse(Page<?> page, List<Map<String, Object>> content) {
        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("totalElements", page.getTotalElements());
        response.put("totalPages", page.getTotalPages());
        response.put("currentPage", page.getNumber());
        response.put("size", page.getSize());
        response.put("hasNext", page.hasNext());
        response.put("hasPrevious", page.hasPrevious());
        return response;
    }

    /**
     * Get all users with pagination and filtering
     */
    public ResponseEntity<Object> getAllUsers(int page, int size, String search, String status) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("created_at").descending());
            Page<Users> userPage = adminRepo.findUsersWithFilters(search, status, pageable);

            List<Map<String, Object>> userList = userPage.getContent().stream()
                    .map(this::createUserResponse)
                    .collect(Collectors.toList());

            Map<String, Object> response = createPaginatedResponse(userPage, userList);
            response.put("message", "Users retrieved successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve users: " + e.getMessage()));
        }
    }

    /**
     * Get user by ID
     */
    public ResponseEntity<Object> getUserById(Long id) {
        try {
            Optional<Users> userOptional = adminRepo.findById(Math.toIntExact(id));
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            Users user = userOptional.get();
            if (user.isVendor()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Use vendor endpoint for vendor details"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User retrieved successfully");
            response.put("user", createUserResponse(user));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve user: " + e.getMessage()));
        }
    }

    /**
     * Delete user by ID
     */
    public ResponseEntity<Object> deleteUserById(Integer id, Integer adminId) {
        try {
            Optional<Users> userOptional = adminRepo.findById(Math.toIntExact(Long.valueOf(id)));
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            Users user = userOptional.get();
            if (user.isVendor()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Use vendor endpoint to delete vendors"));
            }

            // Prevent admin from deleting themselves
            if (user.getId().equals(adminId)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Cannot delete your own account"));
            }

            // Soft delete - mark as INACTIVE instead of hard delete
            user.setStatus("INACTIVE");
            adminRepo.save(user);

            // Send account deletion notification email
            try {
                emailService.sendAccountDeletionEmail(user.getEmail(), user.getUsername());
            } catch (Exception e) {
                System.err.println("Failed to send account deletion email: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete user: " + e.getMessage()));
        }
    }

    /**
     * Update user by ID
     */
    public ResponseEntity<Object> updateUserById(Long id, Users updatedUser, Long adminId) {
        try {
            Optional<Users> userOptional = adminRepo.findById(Math.toIntExact(id));
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            Users existingUser = userOptional.get();
            if (existingUser.isVendor()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Use vendor endpoint to update vendors"));
            }

            // Update allowed fields
            if (updatedUser.getUsername() != null && !updatedUser.getUsername().trim().isEmpty()) {
                Users existingUserByUsername = userRepo.findByUsername(updatedUser.getUsername());
                if (existingUserByUsername != null && !existingUserByUsername.getId().equals(Math.toIntExact(id))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Username already taken"));
                }
                existingUser.setUsername(updatedUser.getUsername().trim());
            }

            if (updatedUser.getEmail() != null && !updatedUser.getEmail().trim().isEmpty()) {
                Users existingUserByEmail = userRepo.findByEmail(updatedUser.getEmail());
                if (existingUserByEmail != null && !existingUserByEmail.getId().equals(Math.toIntExact(id))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Email already registered"));
                }
                existingUser.setEmail(updatedUser.getEmail().trim());
            }

            if (updatedUser.getPhone() != null && !updatedUser.getPhone().trim().isEmpty()) {
                Users existingUserByPhone = userRepo.findByPhone(updatedUser.getPhone());
                if (existingUserByPhone != null && !existingUserByPhone.getId().equals(Math.toIntExact(id))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Phone number already registered"));
                }
                existingUser.setPhone(updatedUser.getPhone().trim());
            }

            if (updatedUser.getStatus() != null) {
                existingUser.setStatus(updatedUser.getStatus());
            }

            // Validate updated user data
            Set<ConstraintViolation<Users>> violations = validator.validate(existingUser);
            if (!violations.isEmpty()) {
                Map<String, String> errors = violations.stream()
                        .collect(Collectors.toMap(
                                violation -> violation.getPropertyPath().toString(),
                                ConstraintViolation::getMessage
                        ));
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            Users savedUser = adminRepo.save(existingUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User updated successfully");
            response.put("user", createUserResponse(savedUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update user: " + e.getMessage()));
        }
    }

    /**
     * Get all vendors with pagination and filtering
     */
    public ResponseEntity<Object> getAllVendors(int page, int size, String search, String vendorType) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("created_at").descending());

            // Convert string vendorType to enum if provided
            Vendor_Type vendorTypeEnum = null;
            if (vendorType != null && !vendorType.trim().isEmpty()) {
                try {
                    vendorTypeEnum = Vendor_Type.valueOf(vendorType.trim());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Invalid vendor type: " + vendorType));
                }
            }

            Page<Users> vendorPage = adminRepo.findVendorsWithFilters(search, vendorTypeEnum, pageable);

            List<Map<String, Object>> vendorList = vendorPage.getContent().stream()
                    .map(this::createUserResponse)
                    .collect(Collectors.toList());

            Map<String, Object> response = createPaginatedResponse(vendorPage, vendorList);
            response.put("message", "Vendors retrieved successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve vendors: " + e.getMessage()));
        }
    }

    /**
     * Get vendor by ID
     */
    public ResponseEntity<Object> getVendorById(Long id) {
        try {
            Optional<Users> vendorOptional = adminRepo.findById(Math.toIntExact(id));
            if (vendorOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Vendor not found"));
            }

            Users vendor = vendorOptional.get();
            if (!vendor.isVendor()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Use user endpoint for user details"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Vendor retrieved successfully");
            response.put("vendor", createUserResponse(vendor));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve vendor: " + e.getMessage()));
        }
    }

    /**
     * Delete vendor by ID
     */
    public ResponseEntity<Object> deleteVendorById(Long id, Long adminId) {
        try {
            Optional<Users> vendorOptional = adminRepo.findById(Math.toIntExact(id));
            if (vendorOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Vendor not found"));
            }

            Users vendor = vendorOptional.get();
            if (!vendor.isVendor()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Use user endpoint to delete users"));
            }

            // Prevent admin from deleting themselves
            if (vendor.getId().equals(Math.toIntExact(adminId))) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Cannot delete your own account"));
            }

            // Soft delete - mark as INACTIVE
            vendor.setStatus("INACTIVE");
            adminRepo.save(vendor);

            // Send account deletion notification email
            try {
                emailService.sendAccountDeletionEmail(vendor.getEmail(), vendor.getUsername());
            } catch (Exception e) {
                System.err.println("Failed to send account deletion email: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Vendor deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete vendor: " + e.getMessage()));
        }
    }

    /**
     * Update vendor by ID
     */
    public ResponseEntity<Object> updateVendorById(Long id, Users updatedVendor, Long adminId) {
        try {
            Optional<Users> vendorOptional = adminRepo.findById(Math.toIntExact(id));
            if (vendorOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Vendor not found"));
            }

            Users existingVendor = vendorOptional.get();
            if (!existingVendor.isVendor()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Use user endpoint to update users"));
            }

            // Update allowed fields
            if (updatedVendor.getUsername() != null && !updatedVendor.getUsername().trim().isEmpty()) {
                Users existingUserByUsername = userRepo.findByUsername(updatedVendor.getUsername());
                if (existingUserByUsername != null && !existingUserByUsername.getId().equals(Math.toIntExact(id))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Username already taken"));
                }
                existingVendor.setUsername(updatedVendor.getUsername().trim());
            }

            if (updatedVendor.getEmail() != null && !updatedVendor.getEmail().trim().isEmpty()) {
                Users existingUserByEmail = userRepo.findByEmail(updatedVendor.getEmail());
                if (existingUserByEmail != null && !existingUserByEmail.getId().equals(Math.toIntExact(id))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Email already registered"));
                }
                existingVendor.setEmail(updatedVendor.getEmail().trim());
            }

            if (updatedVendor.getPhone() != null && !updatedVendor.getPhone().trim().isEmpty()) {
                Users existingUserByPhone = userRepo.findByPhone(updatedVendor.getPhone());
                if (existingUserByPhone != null && !existingUserByPhone.getId().equals(Math.toIntExact(id))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Phone number already registered"));
                }
                existingVendor.setPhone(updatedVendor.getPhone().trim());
            }

            if (updatedVendor.getStatus() != null) {
                existingVendor.setStatus(updatedVendor.getStatus());
            }

            if (updatedVendor.getVendorType() != null) {
                existingVendor.setVendorType(updatedVendor.getVendorType());
            }

            // Validate updated vendor data
            Set<ConstraintViolation<Users>> violations = validator.validate(existingVendor);
            if (!violations.isEmpty()) {
                Map<String, String> errors = violations.stream()
                        .collect(Collectors.toMap(
                                violation -> violation.getPropertyPath().toString(),
                                ConstraintViolation::getMessage
                        ));
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            Users savedVendor = adminRepo.save(existingVendor);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Vendor updated successfully");
            response.put("vendor", createUserResponse(savedVendor));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update vendor: " + e.getMessage()));
        }
    }

    /**
     * Add new user
     */
    public ResponseEntity<Object> addUser(Users newUser, Long adminId) {
        try {
            // Validate input
            if (newUser.getUsername() == null || newUser.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username is required"));
            }

            if (newUser.getEmail() == null || newUser.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }

            if (newUser.getPassword() == null || newUser.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password is required"));
            }

            // Check for existing username
            if (userRepo.findByUsername(newUser.getUsername()) != null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username already taken"));
            }

            // Check for existing email
            if (userRepo.findByEmail(newUser.getEmail()) != null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email already registered"));
            }

            // Check for existing phone if provided
            if (newUser.getPhone() != null && !newUser.getPhone().trim().isEmpty()) {
                if (userRepo.findByPhone(newUser.getPhone()) != null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Phone number already registered"));
                }
            }

            // Set defaults
            newUser.setVendor(false);
            newUser.setStatus("ACTIVE");
            newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

            // Validate user data
            Set<ConstraintViolation<Users>> violations = validator.validate(newUser);
            if (!violations.isEmpty()) {
                Map<String, String> errors = violations.stream()
                        .collect(Collectors.toMap(
                                violation -> violation.getPropertyPath().toString(),
                                ConstraintViolation::getMessage
                        ));
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            Users savedUser = adminRepo.save(newUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User created successfully");
            response.put("user", createUserResponse(savedUser));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create user: " + e.getMessage()));
        }
    }

    /**
     * Add new vendor
     */
    public ResponseEntity<Object> addVendor(Users newVendor, Long adminId) {
        try {
            // Validate input
            if (newVendor.getUsername() == null || newVendor.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username is required"));
            }

            if (newVendor.getEmail() == null || newVendor.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }

            if (newVendor.getPassword() == null || newVendor.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password is required"));
            }

            if (newVendor.getVendorType() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Vendor type is required"));
            }

            // Check for existing username
            if (userRepo.findByUsername(newVendor.getUsername()) != null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username already taken"));
            }

            // Check for existing email
            if (userRepo.findByEmail(newVendor.getEmail()) != null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email already registered"));
            }

            // Check for existing phone if provided
            if (newVendor.getPhone() != null && !newVendor.getPhone().trim().isEmpty()) {
                if (userRepo.findByPhone(newVendor.getPhone()) != null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Phone number already registered"));
                }
            }

            // Set defaults
            newVendor.setVendor(true);
            newVendor.setStatus("ACTIVE");
            newVendor.setPassword(passwordEncoder.encode(newVendor.getPassword()));

            // Validate vendor data
            Set<ConstraintViolation<Users>> violations = validator.validate(newVendor);
            if (!violations.isEmpty()) {
                Map<String, String> errors = violations.stream()
                        .collect(Collectors.toMap(
                                violation -> violation.getPropertyPath().toString(),
                                ConstraintViolation::getMessage
                        ));
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            Users savedVendor = adminRepo.save(newVendor);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Vendor created successfully");
            response.put("vendor", createUserResponse(savedVendor));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create vendor: " + e.getMessage()));
        }
    }

    /**
     * Get dashboard statistics
     */
    public ResponseEntity<Object> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // User statistics
            Long totalUsers = adminRepo.countAllUsers();
            Long activeUsers = adminRepo.countActiveUsers();
            List<Users> recentUsers = adminRepo.findRecentUsers();

            Map<String, Object> userStats = new HashMap<>();
            userStats.put("total", totalUsers);
            userStats.put("active", activeUsers);
            userStats.put("inactive", totalUsers - activeUsers);
            userStats.put("recentCount", recentUsers.size());

            // Vendor statistics
            Long totalVendors = adminRepo.countAllVendors();
            Long activeVendors = adminRepo.countActiveVendors();
            List<Users> recentVendors = adminRepo.findRecentVendors();

            Map<String, Object> vendorStats = new HashMap<>();
            vendorStats.put("total", totalVendors);
            vendorStats.put("active", activeVendors);
            vendorStats.put("inactive", totalVendors - activeVendors);
            vendorStats.put("recentCount", recentVendors.size());

            // Overall statistics
            stats.put("users", userStats);
            stats.put("vendors", vendorStats);
            stats.put("totalRegistrations", totalUsers + totalVendors);
            stats.put("totalActive", activeUsers + activeVendors);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Dashboard statistics retrieved successfully");
            response.put("statistics", stats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve dashboard statistics: " + e.getMessage()));
        }
    }

    /**
     * Update user status
     */
    public ResponseEntity<Object> updateUserStatus(Long id, String newStatus, Long adminId) {
        try {
            Optional<Users> userOptional = adminRepo.findById(Math.toIntExact(id));
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            Users user = userOptional.get();

            // Prevent admin from deactivating themselves
            if (user.getId().equals(Math.toIntExact(adminId)) && "INACTIVE".equals(newStatus)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Cannot deactivate your own account"));
            }

            // Validate status
            if (!"ACTIVE".equals(newStatus) && !"INACTIVE".equals(newStatus)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid status. Must be ACTIVE or INACTIVE"));
            }

            String oldStatus = user.getStatus();
            user.setStatus(newStatus);
            Users savedUser = adminRepo.save(user);

            // Send status change notification email
            try {
                if ("INACTIVE".equals(newStatus) && "ACTIVE".equals(oldStatus)) {
                    // Account deactivated
                    emailService.sendAccountDeletionEmail(user.getEmail(), user.getUsername());
                }
            } catch (Exception e) {
                System.err.println("Failed to send status change notification email: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User status updated successfully");
            response.put("user", createUserResponse(savedUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update user status: " + e.getMessage()));
        }
    }
}