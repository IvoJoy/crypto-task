package com.trading212.api;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trading212.common.model.KrakenModel.Ticker;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}

@RestController
@RequestMapping("/api/v1")
class WebController {
	private final RedisTemplate<String, Ticker> simpleRedisTemplate;

	public WebController(
			RedisTemplate<String, Ticker> simpleRedisTemplate) {
		this.simpleRedisTemplate = simpleRedisTemplate;
	}

	@GetMapping("/tickers")
	@CrossOrigin(origins = "*")
	public Map<String, Ticker> getCryptoPrices() {
		return Optional.ofNullable(simpleRedisTemplate.opsForValue()
				.multiGet(simpleRedisTemplate.keys("*")))
				.orElse(Collections.emptyList())
				.stream()
				.collect(Collectors.toMap(Ticker::symbol, ticker -> ticker));
	}
}
