# Adobe Sample Insurance Demo (Backend)

This is a sample application that demonstrate Acrobat Sign API and Acrobat Services API.
Creating a travel contract according to form input by user and template file (Generation API).
Adobe PDF Embed API display the created contract and sign on it for the following way by Sign API.

1.Send contract by email and sign back
or
2.Signature in person

Adobe Sample Insurance Demp app consists of two parts, frontend and backend. This app is backend.

## Configure application
Before starting this application, please get API credentials for both Acrobat Sign and Acrobat Services API from [Adobe Developer Site](https://developer.adobe.com)
and set credentials in src/resources/application.properties.

## Build & Run

This backend app run on localhost:8080 as default and communicates with frontend app on localhost:3000.
Start this app first.

You can run this app:

```
mvn spring-boot:run
```


