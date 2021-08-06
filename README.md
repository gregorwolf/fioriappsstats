# CAP Implementation of SAP Fiori Apps Reference Library

This project was started just before SAP TechEd 2019 to create the ABAP but also CAP CDS data definitions based on the OData Service behind SAP Fiori Apps Reference Library. It's initial intent was to create an app that allows creating statistics for the apps published in the SAP Fiori Apps Reference Library. Thanks to the requirement of a customer I was able to develop this project into it's current state. It now allows to load the entities Details and RequiredODataServices from the SAP Fiori Apps Reference Library.

## Prerequisite

To run the setup steps you have cloned this repository either to the SAP Business Application Studio or you run VS Code with the REST Client Extension.

## Setup

Execute this commands:

```
npm i
cds deploy
npm run start
```

Now load the data from SAP Fiori Apps Reference Library with the POST request to loadAppsFromSAP and loadServicesFromSAP in the REST Client script test/details.http.

## Use

Now you can open:

http://localhost:4004/$fiori-preview/CatalogService/RequiredODataServices#preview-app
