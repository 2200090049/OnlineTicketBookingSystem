package org.otbs.www.backend.controllers;


import java.util.Map;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Object> registerUser(@RequestBody Users users) {
        return authService.initiateRegistration(users);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Object> verifyOTP(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        return authService.verifyOTP(email, otp);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        return authService.login(email, password);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Object> resendOTP(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        return authService.resendOTP(email);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        return authService.initiatePasswordReset(email);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Object> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");
        return authService.resetPassword(email, otp, newPassword);
    }

    @PostMapping("/validate-otp")
    public ResponseEntity<Object> validateOTP(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        return authService.validateOTP(email, otp);
    }
}
