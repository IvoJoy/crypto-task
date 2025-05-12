package com.trading212.api.controllers;

import com.trading212.common.model.KrakenModel.Ticker;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/trade")
public class TradeController {
    private final JdbcTemplate jdbc;
    private final RedisTemplate<String, Ticker> redis;

    public TradeController(JdbcTemplate jdbc, RedisTemplate<String, Ticker> redis) {
        this.jdbc = jdbc;
        this.redis = redis;
    }

    @PostMapping("/buy")
    public ResponseEntity<?> buy(@RequestBody Map<String, Object> body) {
        Integer userId = (Integer) body.get("userId");
        String symbol = (String) body.get("symbol");
        BigDecimal quantity = new BigDecimal(body.get("quantity").toString());

        if (userId == null || symbol == null || quantity == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be positive"));
        }

        // Fetch ticker object from Redis
        Ticker ticker = redis.opsForValue().get(symbol);
        if (ticker == null || ticker.last() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Price not available for symbol"));
        }
        BigDecimal price = ticker.ask();

        // Check balance
        BigDecimal balance = jdbc.queryForObject(
            "SELECT balance FROM account_balance WHERE user_id = ?", BigDecimal.class, userId);
        if (balance == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Account balance not found for user"));
        }
        BigDecimal totalCost = quantity.multiply(price);

        if (balance.compareTo(totalCost) < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient balance"));
        }

        // Transactional update
        jdbc.update("UPDATE account_balance SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?",
                totalCost, userId);

        jdbc.update("""
            INSERT INTO holdings (user_id, symbol, amount, updated_at)
            VALUES (?, ?, ?, NOW())
            ON CONFLICT (user_id, symbol)
            DO UPDATE SET amount = holdings.amount + EXCLUDED.amount, updated_at = NOW()
        """, userId, symbol, quantity);

        BigDecimal balanceAfter = balance.subtract(totalCost);

        jdbc.update("""
            INSERT INTO transactions (user_id, symbol, type, quantity, price, total, balance_after, created_at)
            VALUES (?, ?, 'BUY', ?, ?, ?, ?, NOW())
        """, userId, symbol, quantity, price, totalCost, balanceAfter);

        return ResponseEntity.ok(Map.of(
            "message", "Purchase successful",
            "balance", balanceAfter,
            "price", price
        ));
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sell(@RequestBody Map<String, Object> body) {
        Integer userId = (Integer) body.get("userId");
        String symbol = (String) body.get("symbol");
        BigDecimal quantity = new BigDecimal(body.get("quantity").toString());

        if (userId == null || symbol == null || quantity == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be positive"));
        }

        // Fetch ticker object from Redis
        Ticker ticker = redis.opsForValue().get(symbol);
        if (ticker == null || ticker.last() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Price not available for symbol"));
        }
        BigDecimal price = ticker.bid();

        // Check holdings
        BigDecimal holdings;
        try {
            holdings = jdbc.queryForObject(
                "SELECT amount FROM holdings WHERE user_id = ? AND symbol = ?", BigDecimal.class, userId, symbol);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            holdings = BigDecimal.ZERO;
        }

        if (holdings == null || holdings.compareTo(quantity) < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient holdings"));
        }

        // --- Calculate average buy price for this symbol ---
        BigDecimal avgBuyPrice = jdbc.queryForObject("""
            SELECT 
                CASE WHEN SUM(quantity) = 0 THEN 0
                ELSE SUM(CASE WHEN type = 'BUY' THEN quantity * price ELSE 0 END) / NULLIF(SUM(CASE WHEN type = 'BUY' THEN quantity ELSE 0 END), 0)
                END as avg_buy_price
            FROM transactions
            WHERE user_id = ? AND symbol = ?
        """, BigDecimal.class, userId, symbol);

        if (avgBuyPrice == null) avgBuyPrice = BigDecimal.ZERO;

        // --- Calculate profit/loss for this sell ---
        BigDecimal profitLoss = price.subtract(avgBuyPrice).multiply(quantity);

        // Transactional update
        jdbc.update("UPDATE account_balance SET balance = balance + ?, updated_at = NOW() WHERE user_id = ?",
                quantity.multiply(price), userId);

        jdbc.update("""
            UPDATE holdings SET amount = amount - ?, updated_at = NOW()
            WHERE user_id = ? AND symbol = ?
        """, quantity, userId, symbol);

        BigDecimal balanceAfter = jdbc.queryForObject(
            "SELECT balance FROM account_balance WHERE user_id = ?", BigDecimal.class, userId);

        jdbc.update("""
            INSERT INTO transactions (user_id, symbol, type, quantity, price, total, balance_after, profit_loss, created_at)
            VALUES (?, ?, 'SELL', ?, ?, ?, ?, ?, NOW())
        """, userId, symbol, quantity.negate(), price, quantity.multiply(price).negate(), balanceAfter, profitLoss);

        return ResponseEntity.ok(Map.of(
            "message", "Sale successful",
            "balance", balanceAfter,
            "price", price,
            "profit_loss", profitLoss
        ));
    }
}



