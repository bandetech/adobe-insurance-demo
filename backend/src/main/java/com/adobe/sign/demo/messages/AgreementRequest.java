package com.adobe.sign.demo.messages;

import lombok.Data;

@Data
public class AgreementRequest {
    private String name;
    private String signatureType;
    private String state;
    private FileInfo[] fileInfos;
    private ParticipantSetsInfo[] participantSetsInfo;
    private EmailOption emailOption;
    private PostSignOption postSignOption;
}
