package org.otbs.[www.backend.controllers](http://www.backend.controllers);

import java.util.Map;

import org.otbs.[www.backend.models.Users](http://www.backend.models.Users);
import org.otbs.[www.backend.services.AuthService](http://www.backend.services.AuthService);
import org.springframework.http.HttpStatus;
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

```
private final AuthService authService;

public AuthController(AuthService authService) {
    this.authService = authService;
}

@PostMapping("/register")
public ResponseEntity<Object> registerUser(@RequestBody Users users) {

    if (users == null || users.getEmail() == null || users.getEmail().trim().isEmpty()) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Email is required");
    }

    users.setEmail(users.getEmail().trim().toLowerCase());

    return authService.initiateRegistration(users);
}

@PostMapping("/verify-otp")
public ResponseEntity<Object> verifyOTP(@RequestBody Map<String, String> payload) {

    String email = getEmail(payload);
    String otp = getValue(payload, "otp");

    if (email == null || otp == null) {
        return badRequest("Email and OTP are required");
    }

    return authService.verifyOTP(email, otp.trim());
}

@PostMapping("/login")
public ResponseEntity<Object> login(@RequestBody Map<String, String> credentials) {

    String email = getEmail(credentials);
    String password = getValue(credentials, "password");

    if (email == null || password == null) {
        return badRequest("Email and password are required");
    }

    return authService.login(email, password);
}

@PostMapping("/resend-otp")
public ResponseEntity<Object> resendOTP(@RequestBody Map<String, String> payload) {

    String email = getEmail(payload);

    if (email == null) {
        return badRequest("Email is required");
    }

    return authService.resendOTP(email);
}

@PostMapping("/forgot-password")
public ResponseEntity<Object> forgotPassword(@RequestBody Map<String, String> payload) {

    String email = getEmail(payload);

    if (email == null) {
        return badRequest("Email is required");
    }

    return authService.initiatePasswordReset(email);
}

@PostMapping("/reset-password")
public ResponseEntity<Object> resetPassword(@RequestBody Map<String, String> payload) {

    String email = getEmail(payload);
    String otp = getValue(payload, "otp");
    String newPassword = getValue(payload, "newPassword");

    if (email == null || otp == null || newPassword == null) {
        return badRequest("Email, OTP and new password are required");
    }

    if (newPassword.length() < 6) {
        return badRequest("New password must be at least 6 characters");
    }

    return authService.resetPassword(
            email,
            otp.trim(),
            newPassword
    );
}

@PostMapping("/validate-otp")
public ResponseEntity<Object> validateOTP(@RequestBody Map<String, String> payload) {

    String email = getEmail(payload);
    String otp = getValue(payload, "otp");

    if (email == null || otp == null) {
        return badRequest("Email and OTP are required");
    }

    return authService.validateOTP(email, otp.trim());
}

// Helper method for extracting and normalizing email
private String getEmail(Map<String, String> payload) {

    if (payload == null) {
        return null;
    }

    String email = payload.get("email");

    if (email == null || email.trim().isEmpty()) {
        return null;
    }

    return email.trim().toLowerCase();
}

// Helper method for reading request values
private String getValue(Map<String, String> payload, String key) {

    if (payload == null) {
        return null;
    }

    String value = payload.get(key);

    if (value == null || value.trim().isEmpty()) {
        return null;
    }

    return value.trim();
}

// Common response for invalid requests
private ResponseEntity<Object> badRequest(String message) {

    return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(message);
}
```

}
