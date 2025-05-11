package com.trading212.ingest.json;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class JsonObjectMapper {

  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    final ObjectMapper mapper = new ObjectMapper();
    return mapper;
  }
}