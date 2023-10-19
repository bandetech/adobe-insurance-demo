package com.adobe.sign.demo.controller;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import com.adobe.pdfservices.operation.ExecutionContext;
import com.adobe.pdfservices.operation.auth.Credentials;
import com.adobe.pdfservices.operation.exception.SdkException;
import com.adobe.pdfservices.operation.exception.ServiceApiException;
import com.adobe.pdfservices.operation.exception.ServiceUsageException;
import com.adobe.pdfservices.operation.io.FileRef;
import com.adobe.pdfservices.operation.pdfops.DocumentMergeOperation;
import com.adobe.pdfservices.operation.pdfops.options.documentmerge.DocumentMergeOptions;
import com.adobe.pdfservices.operation.pdfops.options.documentmerge.OutputFormat;
import com.adobe.sign.demo.components.MyPdfUtil;
import com.adobe.sign.demo.messages.FileLocation;
import com.adobe.sign.demo.models.Applicant;

import com.fasterxml.jackson.core.json.JsonWriteFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.extern.slf4j.Slf4j;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;


@Slf4j
@RestController
@ConfigurationProperties("appservices")
public class ContractCreateController {
    
    @Autowired
    MyPdfUtil pdfUtil;

    @Autowired
    RestTemplate restTemplate;

    // client id and client secret for Acrobat Services API
    private String clientId;
    private String clientSecret;

    private static boolean ENABLE_PDF_GENERATION = true;
    
    @PostMapping(value="/createPdf")
    private FileLocation createPdf(@ModelAttribute Applicant applicant){

        OutputStream out = null;
        FileLocation fileLocation = new FileLocation();

        // Set Fake Cert Number
        long currentMills = System.currentTimeMillis();
        String certNumber = String.valueOf(currentMills).substring(4);
        applicant.setCertNumber(certNumber);

        try{
            Credentials credentials = Credentials.servicePrincipalCredentialsBuilder()
                    .withClientId(clientId)
                    .withClientSecret(clientSecret)
                    .build();
            if(credentials != null){
                log.info("Got credentials!");
            }

            // Create json from data
            ObjectMapper mapper = new ObjectMapper();

            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            mapper.configure(JsonWriteFeature.ESCAPE_NON_ASCII.mappedFeature(), true);
            
            String encodedJson = mapper.writeValueAsString(applicant);

            JSONObject jsonObj = new JSONObject(encodedJson);
            log.info("JSON :{}", jsonObj);
            // Create execution context
            ExecutionContext executionContext = ExecutionContext.create(credentials);
            
            DocumentMergeOptions documentMergeOptions = new DocumentMergeOptions(jsonObj, OutputFormat.PDF);
            DocumentMergeOperation documentMergeOperation = DocumentMergeOperation.createNew(documentMergeOptions);

            FileRef documentTemplate = FileRef.createFromLocalFile("src/main/resources/insuranceTemplate.docx");
            documentMergeOperation.setInput(documentTemplate);

            // prepare store file location
            Path tmpDir = pdfUtil.getTempDir();
            Path tempFile = Files.createTempFile(tmpDir, "gen-", ".pdf");
            log.info("Temp File: {}", tempFile);

            // Execute embeded pdf generation
            if(ENABLE_PDF_GENERATION){
                FileRef result = documentMergeOperation.execute(executionContext);
                out = Files.newOutputStream(tempFile);
                result.saveAs(out);
            }
            
            // Return path
            String tmpFileName = tempFile.getFileName().toString();
            fileLocation.setFileName(tempFile.getFileName().toString());
            fileLocation.setLocationUrl("/getPdf/"+tmpFileName);

        } catch(IOException|SdkException|ServiceUsageException|ServiceApiException ex){
            log.error("Exception occured : ", ex);
        } finally{
            if(out != null){
                try{
                    out.close();
                } catch(IOException ex){
                    log.error("Got Error while closing the temporaly file");
                }
            }

        }

        return fileLocation;
        
    }
    
    @GetMapping("/getPdf/{fileName:.+}")
    public ResponseEntity<Resource> getPdfFile(@PathVariable String fileName) throws Exception{
        
        Path path = pdfUtil.getTempDir().resolve(fileName);
        log.info("Target Path : {}", path.toString());
        Resource resource = new PathResource(path);

        return ResponseEntity.ok()
            .contentType(getContentType(path))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filenam=\"" + resource.getFilename() + "\"")
            .body(resource);

    }

    private MediaType getContentType(Path path) throws IOException {
        try {
          return MediaType.parseMediaType(Files.probeContentType(path));
        } catch (IOException e) {
          log.info("Could not determine file type.");

          return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    /*
     * Getter and Setter for application.properties
     */
    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
}
