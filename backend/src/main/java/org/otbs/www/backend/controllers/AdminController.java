package org.otbs.www.backend.controllers;

import java.util.Map;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.services.AdminService;
import org.otbs.www.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;


    @GetMapping("/users")
    public ResponseEntity<Object> getAllUsers(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.getAllUsers(page, size, search, status);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @GetMapping("/users/{id}")
    public ResponseEntity<Object> getUserById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.getUserById(id);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @DeleteMapping("/users/{id}")
    public ResponseEntity<Object> deleteUserById(
            @PathVariable Integer id,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.deleteUserById(id, admin.getId());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }



    @PutMapping("/users/{id}")
    public ResponseEntity<Object> updateUserById(
            @PathVariable Long id,
            @RequestBody Users updatedUser,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.updateUserById(id, updatedUser, admin.getId().longValue());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @GetMapping("/vendors")
    public ResponseEntity<Object> getAllVendors(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String vendorType) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.getAllVendors(page, size, search, vendorType);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @GetMapping("/vendors/{id}")
    public ResponseEntity<Object> getVendorById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.getVendorById(id);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @DeleteMapping("/vendors/{id}")
    public ResponseEntity<Object> deleteVendorById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.deleteVendorById(id, admin.getId().longValue());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @PutMapping("/vendors/{id}")
    public ResponseEntity<Object> updateVendorById(
            @PathVariable Long id,
            @RequestBody Users updatedVendor,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.updateVendorById(id, updatedVendor, admin.getId().longValue());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @PostMapping("/add/user")
    public ResponseEntity<Object> addUser(
            @RequestBody Users newUser,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.addUser(newUser, admin.getId().longValue());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @PostMapping("/add/vendor")
    public ResponseEntity<Object> addVendor(
            @RequestBody Users newVendor,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.addVendor(newVendor, admin.getId().longValue());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @GetMapping("/dashboard")
    public ResponseEntity<Object> getDashboardStats(
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            return adminService.getDashboardStats();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @PutMapping("/users/{id}/status")
    public ResponseEntity<Object> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            @RequestHeader("Authorization") String token) {
        try {
            Users admin = jwtUtil.getUserFromToken(token);
            if (!isAdmin(admin)) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin privileges required."));
            }
            String newStatus = statusUpdate.get("status");
            return adminService.updateUserStatus(id, newStatus, admin.getId().longValue());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }

    // Helper method to check if user is admin - FIXED
    private boolean isAdmin(Users user) {
        if (user == null || !"ACTIVE".equals(user.getStatus())) {
            return false;
        }

        if (user.getEmail().endsWith("@admin.com")) {
            return true;
        }

        if ("ADMIN".equals(user.getRole())) {
            return true;
        }

        if (user.isVendor() && user.getVendorType() != null &&
                "ADMIN".equals(user.getVendorType().toString())) {
            return true;
        }

        return false;
    }
}