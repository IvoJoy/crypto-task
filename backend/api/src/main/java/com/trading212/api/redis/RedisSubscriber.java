package com.trading212.api.redis;

import java.nio.charset.StandardCharsets;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading212.common.model.KrakenModel.TickerResponse;
import com.trading212.api.ws.WebSocketHandler;

@Component
public class RedisSubscriber implements MessageListener {

  private final ObjectMapper objectMapper;
  private final WebSocketHandler wsHandler;

  public RedisSubscriber(ObjectMapper objectMapper, WebSocketHandler wsHandler) {
    this.objectMapper = objectMapper;
    this.wsHandler = wsHandler;
  }

  @Override
  public void onMessage(@NonNull Message message, @Nullable byte[] pattern) {
    try {
      String payload = new String(message.getBody(), StandardCharsets.UTF_8);
      var parsedPayload = objectMapper.readValue(payload, TickerResponse.class);

      parsedPayload.data().forEach(ticker -> {
        try {
          wsHandler.broadcastToTopic(ticker.symbol(), objectMapper.writeValueAsString(ticker));
        } catch (Exception e) {
          e.printStackTrace();
        }
      });
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
