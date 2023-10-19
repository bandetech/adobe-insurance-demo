package com.adobe.sign.demo.messages;

import lombok.Data;

@Data
public class ParticipantSetsInfo {
    private MemberInfo[] memberInfos;
    private Integer order;
    private String role;
}
