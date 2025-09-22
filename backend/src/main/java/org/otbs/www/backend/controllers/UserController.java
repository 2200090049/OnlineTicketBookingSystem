package org.otbs.www.backend.controllers;


import jakarta.persistence.Id;
import org.otbs.www.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("/me")
    public ResponseEntity<Object> getMe(){
        return userService.getMe();
    }

    @PutMapping("/update-me")
    public ResponseEntity<Object> updateMe(){
        return userService.updateMe();
    }

    @PostMapping("/delete-me")
    public ResponseEntity<Object> deleteMe(){
        return userService.deleteMe();
    }

    @PutMapping("/change-password")
    public ResponseEntity<Object> changePassword(){
        return userService.changePassword();
    }
}
