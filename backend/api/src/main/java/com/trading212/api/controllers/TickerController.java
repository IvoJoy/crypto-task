package com.trading212.api.controllers;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trading212.common.model.KrakenModel.Ticker;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/tickers")
class TickerController {
	private final RedisTemplate<String, Ticker> simpleRedisTemplate;

	public TickerController(
			RedisTemplate<String, Ticker> simpleRedisTemplate) {
		this.simpleRedisTemplate = simpleRedisTemplate;
	}

	@GetMapping
	public Map<String, Ticker> getCryptoPrices() {
		return Optional.ofNullable(simpleRedisTemplate.opsForValue()
				.multiGet(simpleRedisTemplate.keys("*")))
				.orElse(Collections.emptyList())
				.stream()
				.collect(Collectors.toMap(Ticker::symbol, ticker -> ticker));
	}
}
