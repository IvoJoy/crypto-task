package com.trading212.api.controllers;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    @GetMapping
    public ResponseEntity<?> listUsers() {
        var users = jdbc.queryForList("SELECT id, username FROM users ORDER BY id");
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}/history")
    public ResponseEntity<?> getTransactionHistory(@PathVariable Integer userId) {
        var transactions = jdbc.queryForList("""
                    SELECT symbol, type, quantity, price, total, balance_after, profit_loss, created_at
                    FROM transactions
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                """, userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{userId}/balance")
    public ResponseEntity<?> getBalance(@PathVariable Integer userId) {
        BigDecimal balance = jdbc.queryForObject(
                "SELECT balance FROM account_balance WHERE user_id = ?", BigDecimal.class, userId);
        return ResponseEntity.ok(Map.of("balance", balance));
    }

    @PostMapping("/{userId}/reset")
    public ResponseEntity<?> resetAccount(@PathVariable Integer userId) {
        // Reset balance to $10,000
        jdbc.update("UPDATE account_balance SET balance = 10000.00, updated_at = NOW() WHERE user_id = ?", userId);
        // Clear holdings
        jdbc.update("DELETE FROM holdings WHERE user_id = ?", userId);
        // Optionally, clear transactions:
        // jdbc.update("DELETE FROM transactions WHERE user_id = ?", userId);
        return ResponseEntity.ok(Map.of("message", "Account reset", "balance", 10000.00));
    }

    @GetMapping("/{userId}/holdings")
    public ResponseEntity<?> getHoldings(@PathVariable Integer userId) {
        var holdings = jdbc.queryForList(
            "SELECT symbol, amount FROM holdings WHERE user_id = ? AND amount > 0 ORDER BY symbol", userId);
        return ResponseEntity.ok(holdings);
    }
}