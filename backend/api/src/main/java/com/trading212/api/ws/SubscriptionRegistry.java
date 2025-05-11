package com.trading212.api.ws;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SubscriptionRegistry {
  private final Map<String, Set<String>> tickerToSessions = new ConcurrentHashMap<>();
  private final Map<String, Set<String>> sessionToTickers = new ConcurrentHashMap<>();

  public void subscribe(String sessionId, String ticker) {
    tickerToSessions.computeIfAbsent(ticker, _ -> ConcurrentHashMap.newKeySet()).add(sessionId);
    sessionToTickers.computeIfAbsent(sessionId, _ -> ConcurrentHashMap.newKeySet()).add(ticker);
  }

  public void unsubscribe(String sessionId, String ticker) {
    tickerToSessions.getOrDefault(ticker, Set.of()).remove(sessionId);
    sessionToTickers.getOrDefault(sessionId, Set.of()).remove(ticker);
  }

  public void removeSession(String sessionId) {
    Set<String> tickers = sessionToTickers.remove(sessionId);
    if (tickers != null) {
      for (String ticker : tickers) {
        tickerToSessions.getOrDefault(ticker, Set.of()).remove(sessionId);
      }
    }
  }

  public Set<String> getSubscribers(String ticker) {
    return tickerToSessions.getOrDefault(ticker, Set.of());
  }
}
