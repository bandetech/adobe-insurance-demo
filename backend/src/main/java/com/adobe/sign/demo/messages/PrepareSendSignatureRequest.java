package com.adobe.sign.demo.messages;

import lombok.Data;

@Data
public class PrepareSendSignatureRequest {
    private String transientDocumentId;
    private String name;
    private String email;
    private String title;
    private boolean isEmailEnabled;
    private String redirectUrl;
}
