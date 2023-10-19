package com.adobe.sign.demo.messages;

import lombok.Data;

@Data
public class TransientDocumentRequest {
    private String locationUrl;
    private String fileName;
}
