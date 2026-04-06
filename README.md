# Tenn-Tech-Equipment-Inventory

This is going to be a proof of concept build for camera data extraction using similar systems to MEASUR (the system developed by ORNL) to allow future incorporation to the full system.

# Dependencies

- Node.js
    - [Download from website for your system](https://nodejs.org/en/download)
- Angular
    - [Install Angular CLI via npm](#install-angular-cli-via-npm)
    - [Install directions on Angular website](https://angular.dev/installation)


## Running npm on windows (PowerShell)

NPM (Node Package Manager) will be installed as part of node.js.  
If you get an error that says running scripts is disabled on this system, then run this code in PowerShell
```PowerShell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Install Angular CLI via npm

To install Angular via npm run the following in PowerShell or Bash **after installing node.js**
```Bash
npm install -g @angular/cli
```

## Run Angular app

To run the Angular web app navigate to the [Equipment_initial](Equipment_initial/) directory in your terminal, then run
```Bash
npm install
npm start
```

### Running with network access

To run the Angular web app such that you can open it on a phone or other devices, navigate to the [Equipment_initial](Equipment_initial/) directory then run
```Bash
npm run start:ip
```