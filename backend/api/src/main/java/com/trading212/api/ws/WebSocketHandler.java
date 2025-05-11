package com.trading212.api.ws;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final SubscriptionRegistry subscriptionRegistry;
    private final ObjectMapper objectMapper;

    WebSocketHandler(SubscriptionRegistry subscriptionRegistry, ObjectMapper objectMapper) {
        this.subscriptionRegistry = subscriptionRegistry;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) {
        String clientId = UUID.randomUUID().toString();
        session.getAttributes().put("clientId", clientId);
        sessions.put(clientId, session);
        System.out.println("Connected: " + clientId);
    }

    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        // Expecting JSON like: { "type": "subscribe", "topic": "BTC/USD" }
        // or { "type": "subscribe", "topics": ["BTC/USD", "ETH/USD"] }
        var msg = objectMapper.readTree(message.getPayload());

        if (msg.has("type") && "subscribe".equals(msg.get("type").asText())) {
            String clientId = (String) session.getAttributes().get("clientId");

            if (msg.has("topic")) {
                String topic = msg.get("topic").asText();
                subscriptionRegistry.subscribe(clientId, topic);
                System.out.println(clientId + " subscribed to " + topic);
            }
            if (msg.has("topics")) {
                msg.get("topics").elements().forEachRemaining(topic -> {
                    subscriptionRegistry.subscribe(clientId, topic.asText());
                    System.out.println(clientId + " subscribed to " + topic);
                });
            }
        }
    }

    public void broadcastToTopic(String topic, String message) {
        subscriptionRegistry.getSubscribers(topic).forEach(clientId -> {
            WebSocketSession session = sessions.get(clientId);
            if (session != null && session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) {
        String clientId = (String) session.getAttributes().get("clientId");
        sessions.remove(clientId);
        subscriptionRegistry.removeSession(clientId);
        System.out.println("Disconnected: " + clientId);
    }
}