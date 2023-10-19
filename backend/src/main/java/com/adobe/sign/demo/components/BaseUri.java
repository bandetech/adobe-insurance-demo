package com.adobe.sign.demo.components;

import org.springframework.stereotype.Component;

import lombok.Data;


@Component
@Data
public class BaseUri {
    private String apiAccessPoint;
    private String webAccessPoint;
}
