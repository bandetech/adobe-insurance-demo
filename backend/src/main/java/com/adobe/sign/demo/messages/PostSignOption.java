package com.adobe.sign.demo.messages;

import lombok.Data;

@Data
public class PostSignOption {
    private Integer redirectDelay;
    private String redirectUrl;
}
