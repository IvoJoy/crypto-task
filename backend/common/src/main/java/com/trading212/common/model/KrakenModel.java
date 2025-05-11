package com.trading212.common.model;

import java.math.BigDecimal;
import java.util.List;

public class KrakenModel {

  public static record TickerResponse(
      String channel,
      String type,
      List<Ticker> data) {
  };

  public static record Ticker(
      String symbol,
      BigDecimal bid,
      BigDecimal bid_qty,
      BigDecimal ask,
      BigDecimal ask_qty,
      BigDecimal last,
      BigDecimal volume,
      BigDecimal vwap,
      BigDecimal low,
      BigDecimal high,
      BigDecimal change,
      BigDecimal change_pct) {
  }

  public static record SubscribeEvent(String method, SubscribeParams params) {
  }

  public static record SubscribeParams(String channel, List<String> symbol) {
  }

}