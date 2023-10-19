package com.adobe.sign.demo.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

import org.springframework.format.annotation.DateTimeFormat;

@Data
public class Applicant {
    private String insuredName;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate insuredBirthDate;
    private String insuredSex;
    private String purposeOfTrip;
    private String destination;
    private String email;
    private String certNumber;
    private String insuredEmail;
    private String insuranceType;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate periodOfInsuranceFrom;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate periodOfInsuranceTo;

    private String policyHolderName;
    private LocalDateTime dateOfIssue;
    private LocalDateTime dateOfContract;
    
}
