package com.trading212.api.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading212.common.model.KrakenModel.Ticker;

@Configuration
public class RedisConfig {

  @Bean
  public MessageListenerAdapter messageListenerAdapter(RedisSubscriber subscriber) {
    return new MessageListenerAdapter(subscriber);
  }

  @Bean
  public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory,
      MessageListenerAdapter listenerAdapter) {
    RedisMessageListenerContainer container = new RedisMessageListenerContainer();
    container.setConnectionFactory(connectionFactory);
    container.addMessageListener(listenerAdapter, new PatternTopic("ticker:updates"));
    return container;
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
