package org.otbs.www.backend.controllers;

import java.util.Map;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.services.UserService;
import org.otbs.www.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;


    @GetMapping("/me")
    public ResponseEntity<Object> getMe(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return userService.getMe();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }


    @PutMapping("/update-me")
    public ResponseEntity<Object> updateMe(@RequestBody Users updatedUser,
                                           @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return userService.updateMe(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete-me")
    public ResponseEntity<Object> deleteMe(@RequestBody Map<String, String> request,
                                           @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            String password = request.get("password");
            return userService.deleteMe(password);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<Object> changePassword(@RequestBody Map<String, String> request,
                                                 @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");
            return userService.changePassword(currentPassword, newPassword, confirmPassword);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Object> getUserStatus(@RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            return ResponseEntity.ok(Map.of(
                    "status", user.getStatus(),
                    "isVendor", user.isVendor(),
                    "vendorType", user.getVendorType() != null ? user.getVendorType().toString() : null,
                    "message", "User status retrieved successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }

    @PutMapping("/avatar")
    public ResponseEntity<Object> updateAvatar(@RequestBody Map<String, String> request,
                                               @RequestHeader("Authorization") String token) {
        try {
            Users user = jwtUtil.getUserFromToken(token);
            String avatarUrl = request.get("avatarUrl");
            if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Avatar URL is required"));
            }
            return userService.updateAvatar(avatarUrl);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token: " + e.getMessage()));
        }
    }
}