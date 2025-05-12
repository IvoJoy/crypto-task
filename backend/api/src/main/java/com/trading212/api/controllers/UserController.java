package com.trading212.api.controllers;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/users")
public class UserController {
    private final JdbcTemplate jdbc;

    public UserController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }
        try {
            // Insert user and get id
            Integer userId = jdbc.queryForObject(
                "INSERT INTO users (username) VALUES (?) RETURNING id", Integer.class, username);

            // Initialize balance
            jdbc.update("INSERT INTO account_balance (user_id) VALUES (?)", userId);

            return ResponseEntity.ok(Map.of("id", userId, "username", username));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(409).body(Map.of("error", "Username already exists"));
        }
    }
}