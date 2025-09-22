package org.otbs.www.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
public class ServerController {

    @GetMapping
    public ResponseEntity<Object> serverStatus() {
        Date now = new Date();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "Server is running");
        response.put("serverTime", now.toString());

        return ResponseEntity.ok(response);
    }
}
