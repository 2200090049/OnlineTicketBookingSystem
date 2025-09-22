package org.otbs.www.backend.services;

import org.otbs.www.backend.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    UserRepo userRepo;

    public ResponseEntity<Object> getMe() {
        return ResponseEntity.ok("getMe");
    }

    public ResponseEntity<Object> updateMe() {
        return ResponseEntity.ok("updateMe");
    }

    public ResponseEntity<Object> deleteMe() {
        return ResponseEntity.ok("deleteMe");
    }

    public ResponseEntity<Object> changePassword() {
        return ResponseEntity.ok("changePassword");
    }
}
