package com.adobe.sign.demo.controller;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;

import com.adobe.sign.demo.components.BaseUri;
import com.adobe.sign.demo.components.MyPdfUtil;
import com.adobe.sign.demo.messages.AgreementRequest;
import com.adobe.sign.demo.messages.AgreementResponse;
import com.adobe.sign.demo.messages.EmailOption;
import com.adobe.sign.demo.messages.FileInfo;
import com.adobe.sign.demo.messages.MemberInfo;
import com.adobe.sign.demo.messages.ParticipantSetsInfo;
import com.adobe.sign.demo.messages.PostSignOption;
import com.adobe.sign.demo.messages.PrepareSendSignatureRequest;
import com.adobe.sign.demo.messages.SendOptions;
import com.adobe.sign.demo.messages.SigningUrlResponse;
import com.adobe.sign.demo.messages.TransientDocumentRequest;
import com.adobe.sign.demo.messages.TransientDocumentResponse;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.io.IOUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;


@Slf4j
@RestController
@ConfigurationProperties("appservices")
public class ContractSignController {
    
    @Autowired
    MyPdfUtil pdfUtil;

    @Autowired
    RestTemplate restTemplate;

    @Autowired
    BaseUri baseUri;

    // signAccessKey for Acrobat Sign
    private String signAccessKey;

    // Get Base Uris
    @GetMapping("/sign/baseUris")
    public BaseUri getBaseUris(){
        RequestEntity<?> requestEntity = 
            RequestEntity
                .get("https://api.na1.adobesign.com:443/api/rest/v6/baseUris")
                .header("Authorization", "Bearer "+signAccessKey)
                .build();
        ResponseEntity<BaseUri> response = restTemplate.exchange(requestEntity, BaseUri.class);
        baseUri = response.getBody();
        return response.getBody();
    }

    // Transient Document
    @PostMapping("/sign/transientDocument")
    public TransientDocumentResponse postTransientDocument(@RequestBody TransientDocumentRequest request) throws IOException{
        // Check Base URI
        checkBaseUri();

        // Prepare Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("Authorization", "Bearer "+ signAccessKey);
        MultiValueMap<String, String> fileMap = new LinkedMultiValueMap<String, String>();

        // Get File
        Path path = pdfUtil.getTempDir().resolve(request.getFileName());
        log.info("Transient File Target Path : {}", path.toString());
        FileInputStream inputStream = new FileInputStream(path.toFile());
        ByteArrayResource fileResource = new ByteArrayResource(IOUtils.toByteArray(inputStream));
        

        ContentDisposition contentDisposition = ContentDisposition
            .builder("form-data")
            .name("File")
            .filename(request.getFileName())
            .build();

        fileMap.add(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString());
        HttpEntity<byte[]> fileEntity = new HttpEntity<>(fileResource.getByteArray(), fileMap);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("File", fileEntity);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        try{
            ResponseEntity<TransientDocumentResponse> response = restTemplate.exchange(
                baseUri.getApiAccessPoint()+"api/rest/v6/transientDocuments",
                HttpMethod.POST,
                requestEntity,
                TransientDocumentResponse.class
            );
            if(response != null){
                TransientDocumentResponse resp = response.getBody();
                if(resp != null){
                    log.info("Transient Document ID: {}", resp.getTransientDocumentId());
                }
                return resp;
            } else {
                log.error("TransientDocument returned null!!");
                return null;
            }

        } catch(HttpClientErrorException e){
            e.printStackTrace();
        }
        
        return new TransientDocumentResponse();
    }

    // PrepSendSignature
    @PostMapping("/sign/sendSignature")
    public AgreementResponse prepSendSignature(@RequestBody PrepareSendSignatureRequest req){
        // Check Request Arguments
        log.info("Requested email: {}", req.getEmail());
        log.info("Requested Name: {}", req.getName());
        log.info("Requested Tran ID: {}", req.getTransientDocumentId());
        log.info("Requested isEmaileEnabled: {}", req.isEmailEnabled());

        // EmailOption
        SendOptions sendOptions = null;
        EmailOption emailOption = null;
        if(!req.isEmailEnabled()){
            emailOption = new EmailOption();
            sendOptions = new SendOptions();
            sendOptions.setCompletionEmails("ALL");
            sendOptions.setInFlightEmails("NONE");
            sendOptions.setInitEmails("NONE");
            emailOption.setSendOptions(sendOptions);
        }

        // Redirect Option
        PostSignOption postSignOption = null;
        if(req.getRedirectUrl() != null){
            postSignOption = new PostSignOption();
            postSignOption.setRedirectDelay(2);
            postSignOption.setRedirectUrl(req.getRedirectUrl());
        }

        AgreementRequest request = new AgreementRequest();
        request.setName(req.getTitle());
        request.setState("IN_PROCESS");
        request.setSignatureType("ESIGN");

        MemberInfo memberInfo = new MemberInfo();
        memberInfo.setEmail(req.getEmail());
        memberInfo.setName(req.getName());
        ParticipantSetsInfo partInfo = new ParticipantSetsInfo();
        MemberInfo[] memberInfos = new MemberInfo[1];
        memberInfos[0] = memberInfo;
        partInfo.setMemberInfos(memberInfos);
        partInfo.setOrder(1);
        partInfo.setRole("SIGNER");
        ParticipantSetsInfo[] partInfos = new ParticipantSetsInfo[1];
        partInfos[0] = partInfo;

        FileInfo fileInfo = new FileInfo();
        fileInfo.setTransientDocumentId(req.getTransientDocumentId());
        FileInfo[] fileInfos = new FileInfo[1];
        fileInfos[0] = fileInfo;

        request.setParticipantSetsInfo(partInfos);
        request.setFileInfos(fileInfos);

        if(emailOption != null){
            request.setEmailOption(emailOption);
        }
        if(postSignOption != null){
            request.setPostSignOption(postSignOption);
        }

        return sendAgreement(request);
    }

    @PostMapping("/sign/sendAgreement")
    public AgreementResponse sendAgreement(@RequestBody AgreementRequest request){
        checkBaseUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer "+ signAccessKey);
        HttpEntity<AgreementRequest> entity = new HttpEntity<>(request, headers);
        
        ResponseEntity<AgreementResponse> response = restTemplate.exchange(baseUri.getApiAccessPoint()+"api/rest/v6/agreements",
                        HttpMethod.POST,
                        entity,
                        AgreementResponse.class);
        AgreementResponse resp = response.getBody();
        if(resp != null){
            log.info("Agreement ID:{}", resp.getId());
            return resp;
        }else{
            log.error("Send Agreement returned null!");
            return null;
        }

    }

    @GetMapping("/sign/signingUrl/{agreementId}")
    public SigningUrlResponse getSigningUrl(@PathVariable("agreementId") String agreementId){
        checkBaseUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer "+ signAccessKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<SigningUrlResponse> response = restTemplate.exchange(baseUri.getApiAccessPoint()+"api/rest/v6/agreements/"+agreementId+"/signingUrls",
                        HttpMethod.GET,
                        entity,
                        SigningUrlResponse.class);

        return response.getBody();

    }

    private void checkBaseUri(){
        if(baseUri.getApiAccessPoint() == null){
            getBaseUris();
        }
    }

    /*
     * Getter and Setter for application.properties
     */
    public String getSignAccessKey() {
        return signAccessKey;
    }

    public void setSignAccessKey(String signAccessKey) {
        this.signAccessKey = signAccessKey;
    }
}
