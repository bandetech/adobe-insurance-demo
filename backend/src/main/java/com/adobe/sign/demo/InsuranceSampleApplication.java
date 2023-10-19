package com.adobe.sign.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class InsuranceSampleApplication {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(InsuranceSampleApplication.class, args);
    }

    @Bean 
    public RestTemplate restTemplate(RestTemplateBuilder builder){
        return builder.build();

    }
}