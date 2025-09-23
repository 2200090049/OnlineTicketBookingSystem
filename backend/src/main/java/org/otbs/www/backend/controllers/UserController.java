package org.otbs.www.backend.controllers;

import java.util.Map;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<Object> getMe() {
        return userService.getMe();
    }

    @PutMapping("/update-me")
    public ResponseEntity<Object> updateMe(@RequestBody Users updatedUser) {
        return userService.updateMe(updatedUser);
    }

    @PostMapping("/delete-me")
    public ResponseEntity<Object> deleteMe(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        return userService.deleteMe(password);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Object> changePassword(@RequestBody Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");
        return userService.changePassword(currentPassword, newPassword, confirmPassword);
    }
}