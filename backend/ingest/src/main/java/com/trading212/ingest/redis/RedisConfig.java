package com.trading212.ingest.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading212.common.model.KrakenModel.Ticker;
import com.trading212.common.model.KrakenModel.TickerResponse;

@Configuration
class RedisConfig {

  @Bean
  RedisTemplate<String, TickerResponse> pubSubRedisTemplate(RedisConnectionFactory connectionFactory,
      ObjectMapper objectMapper) {

    RedisTemplate<String, TickerResponse> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);

    Jackson2JsonRedisSerializer<TickerResponse> serializer = new Jackson2JsonRedisSerializer<>(objectMapper,
        TickerResponse.class);
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(serializer);
    template.afterPropertiesSet();

    return template;
  }

  @Bean
  RedisTemplate<String, Ticker> simpleRedisTemplate(RedisConnectionFactory connectionFactory,
      ObjectMapper objectMapper) {

    RedisTemplate<String, Ticker> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);

    Jackson2JsonRedisSerializer<Ticker> serializer = new Jackson2JsonRedisSerializer<>(objectMapper, Ticker.class);
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(serializer);
    template.afterPropertiesSet();

    return template;
  }
}