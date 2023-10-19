package com.adobe.sign.demo.messages;

import lombok.Data;

@Data
public class SendOptions {
    private String completionEmails;
    private String inFlightEmails;
    private String initEmails;
}
