package com.trading212.ingest.kraken.client;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading212.common.model.KrakenModel.SubscribeEvent;
import com.trading212.common.model.KrakenModel.SubscribeParams;
import com.trading212.common.model.KrakenModel.Ticker;
import com.trading212.common.model.KrakenModel.TickerResponse;

import jakarta.annotation.PostConstruct;

@Component
public class KrakenClient {

    private final RedisTemplate<String, TickerResponse> pubSubRedisTemplate;
    private final RedisTemplate<String, Ticker> simpleRedisTemplate;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, String> cryptoPairs = new ConcurrentHashMap<>() {
        {
            put("Bitcoin", "BTC/USD");
            put("Tether", "USDT/USD");
            put("Ethereum", "ETH/USD");
            put("Ripple", "XRP/USD");
            put("Cardano", "ADA/USD");
            put("Solana", "SOL/USD");
            put("Dogecoin", "DOGE/USD");
            put("Polkadot", "DOT/USD");
            put("Litecoin", "LTC/USD");
            put("Chainlink", "LINK/USD");
            put("Bitcoin Cash", "BCH/USD");
            put("Stellar", "XLM/USD");
            put("Filecoin", "FIL/USD");
            put("EOS", "EOS/USD");
            put("TRON", "TRX/USD");
            put("Ethereum Classic", "ETC/USD");
            put("Uniswap", "UNI/USD");
            put("Polygon", "MATIC/USD");
            put("Aave", "AAVE/USD");
            put("Algorand", "ALGO/USD");
        }
    };

    public KrakenClient(RedisTemplate<String, TickerResponse> pubSubRedisTemplate,
            RedisTemplate<String, Ticker> simpleRedisTemplate, ObjectMapper objectMapper) {
        this.pubSubRedisTemplate = pubSubRedisTemplate;
        this.simpleRedisTemplate = simpleRedisTemplate;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void connect() {
        StandardWebSocketClient client = new StandardWebSocketClient();
        client.execute(new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
                var subscriptionMessage = new SubscribeEvent("subscribe",
                        new SubscribeParams("ticker", new ArrayList<>(cryptoPairs.values())));
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(subscriptionMessage)));
            }

            @Override
            public void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) {
                try {
                    var payload = objectMapper.readTree(message.getPayload());
                    if (payload.has("channel") && payload.has("type")
                            && "ticker".equals(payload.get("channel").asText())
                            && ("update".equals(payload.get("type").asText())
                                    || "snapshot".equals(payload.get("type").asText()))) {
                        System.out.println(message.getPayload());
                        var tickerResponse = objectMapper.readValue(message.getPayload(), TickerResponse.class);
                        pubSubRedisTemplate.convertAndSend("ticker:updates", tickerResponse); // augment the response
                                                                                              // with names of
                                                                                              // cryptoPairs
                        tickerResponse.data().forEach(ticker -> {
                            simpleRedisTemplate.boundValueOps(ticker.symbol()).set(ticker); // listing the name of
                                                                                            // crypto
                        });
                    }
                } catch (JacksonException e) {
                    System.err.println("Ignored or unsupported response from Kraken: " + message.getPayload());
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, "wss://ws.kraken.com/v2");
    }
}
