package com.appointment.scheduler_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appointment.scheduler_api.dto.AuthResponse;
import com.appointment.scheduler_api.dto.LoginRequest;
import com.appointment.scheduler_api.entity.User;
import com.appointment.scheduler_api.service.AuthService;

@RestController
@RequestMapping("/api/auth")
//@CrossOrigin(origins = "*") // Allow React to connect
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = authService.register(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getEmail(), request.getPassword());
            User user = authService.getUserByToken(token);
            
            return ResponseEntity.ok(new AuthResponse(
                token, 
                user.getRole().name(), 
                user.getId(), 
                user.getFullName()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
