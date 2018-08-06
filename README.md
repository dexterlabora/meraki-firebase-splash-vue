meraki-firebase-splash-vue
WORK IN PROGRESS

# Meraki Captive Portal with Firebase

A demonstration project to build a powerful Wireless Captive Portal experience using Cisco Meraki APIs and Google Firebase.

## Features

- Firebase Hosting - VueJS Frontend
- Firebase Database - Session Storage
- Firebase Authentication - Email Account w/ self-registration
- Firebase Functions - Advanced Auth process with Group Policy Assignment

## Pre-requisites

- NodeJS
  - https://nodejs.org/en/download/
- Meraki Dashboard Account
  - https://meraki.cisco.com/
  - At least one MR Access Point
  - Dashboard API key
- Firebase Account
  - https://firebase.google.com/
  - Free version will not support the Dashboard API functions. They application will still work, but have limited functionality (Group Polices)
  - Pay-as-you-go "Blaze" is the recommended version. My tests show a cost of $0 after regular developlment and home use.

## How to Install

```bash
# get project code
git clone <this project> meraki-firebase-splash-vue
cd meraki-firebase-splash-vue

# install dependencies
npm install
```

## Initialize Firebase

First ensure that you have a Google firebase account. Then complete the initialization steps
https://firebase.google.com/

```bash
firebase init
- create a new project

- authentication
- database
- functions
- hosting

< ADDITIIONAL STEPS>
```

## Configure Settings

There are a few settings that must be configured to allow the application to talk to Google and Meraki.

### Firebase Configuration

Open https://console.firebase.com
Select the project you've just created (via `firebase init`).
Open the project overview (gear icon, top left of console)
Select "Add Firebase to your web app"
Copy the contents of the `config` object for use in the config file.

Open the following file in your editor and insert the provided app config.

`/src/firebaseConfigs.js`

```
const firebasConfigs = {
  apiKey: "123456789012345678901234567890",
  authDomain: "yourmerakiprojectname.firebaseapp.com",
  databaseURL: "https://yourmerakiprojectname.firebaseio.com",
  projectId: "yourmerakiprojectname",
  storageBucket: "yourmerakiprojectname.appspot.com",
  messagingSenderId: "1234567890"
};
```

### Meraki Configuration

First you must have a Wireless network configured in the Meraki Dashboard

- Wireless -> Access Control --> [select SSID]
  - Association Requirements: Open (or PSK if you want)
  - Splash Page: Click-through
  - Walled Garden: Enabled
    - \*.firebaseapp.com
    - \*.googleapis.com
- Wireless -> Splash Page --> [select SSID]
  - Custom splash URL:
    - https://yourmerakiprojectname.firebaseio.com

To quickly get the orgId, ssidNum and policyId, run the following script with your API key. It will iterate through all of the organizations to display the various SSID and Policy information.

```
API_KEY=123456789012345678901234567890 node meraki-summary-tool.js
```

```
export const configs = {
  apiKey: "123456789012345678901234567890", // Enter Your API Key as server default
  apiUrl: "https://n143.meraki.com/api/v0", // Enter your Meraki API base URL. Note the "Shard" number for your org `n###.meraki.com`
  orgId: "12345678", // ENter your Organization ID
  ssidNum: 4, // -- consider using name
  policyId: 102 // -- Consider using name
};
```

## Vue w/ Firebase Hosting, Authentication & Database

```bash
# serve with hot reload at localhost:8080
npm run dev

# webpack build Vue project into /dist folder
npm run build

# run local firebase dev server
firebase serve

# deploy firebase project to production
firebase deploy
```

## Meraki API handler w/ Firebase Functions

```bash
# change into functions folder
cd functions

# build the TypeScript files
npm run build

# dev server
cd..
firebase serve

# prod server
firebase deploy
```

### Special Thanks

This project was bootstrapped using the guidance from this project:
[Vue 2 + Firebase: How to build a Vue app with Firebase authentication system in 15 minutes](https://medium.com/@anas.mammeri/vue-2-firebase-how-to-build-a-vue-app-with-firebase-authentication-system-in-15-minutes-fdce6f289c3c)

# License

Apache-v2.0
