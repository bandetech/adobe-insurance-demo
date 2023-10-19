# Adobe Sample Insurance Demo (Frontend)

This is a sample application that demonstrate Acrobat Sign API and Acrobat Services API.
Creating a travel contract according to form input by user and template file (Generation API of Acrobat Services API) in backend app.
Adobe PDF Embed API display the created contract and sign on it for the following way by Acrobat Sign API:
1.Send contract by email and sign back
or
2.Signature in person.

Adobe Sample Insurance Demp app consists of two parts, frontend and backend. This app is frontend.

## Demo
Demo movie is here, https://youtu.be/xSQE-1c6KAY?si=LORGZFngaM-BbnWR

## Build and Run
This frontend app run on localhost:3000 as default and communicates with backend app on localhost:8080.

Before starting this app, 
1. Get Embeded API Credential from [Adobe Developer Site] (https://developer.adobe.com/) and configure embedClientId in config.json.
2. start backend first.

Then, you can build and run this app:
```
npm install
npm start
```