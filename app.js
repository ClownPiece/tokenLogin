const DEVELOP = require('./develop');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const env = require('dotenv');
const app = express();

const oracleConfig = require("./Oracle/OracleConfig");
const oracledb = require('oracledb');
const dateHelper = require('./util/DateHelper');

async function init() {
    try {
        await oracledb.createPool({
            user: oracleConfig.user,
            password: oracleConfig.password,
            connectString: oracleConfig.connectString,
            externalAuth: oracleConfig.externalAuth,
        });

        oracledb.outFormat = oracledb.OBJECT;
        oracledb.autoCommit = true;
        env.config();
        app.use(cors());
        app.use('/public', express.static(path.join(__dirname, '/public')));
        app.use('/node_modules', express.static(path.join(__dirname, "/node_modules")));

        const PORT = 8888;// Server

        //--------------------------- 컨트롤러 ---------------------------------------
        
        // 1.0
        const WebController = require('./v1.0/Controllers/WebController'); app.use('/web', WebController);
        const StoreProductController = require('./v1.0/Controllers/StoreProductController'); app.use("/" + StoreProductController.API_VERSION + '/mobile/storeProduct', StoreProductController.router);
        const UserLoginController = require('./v1.0/Controllers/UserLoginController'); app.use("/" + UserLoginController.API_VERSION + '/mobile/user', UserLoginController.router);
        const StoreLoginController = require('./v1.0/Controllers/StoreLoginController'); app.use("/" + StoreLoginController.API_VERSION + '/mobile/store', StoreLoginController.router);

        app.listen(PORT, function () {
            console.log('-------------------- Http Server listening: { port:%s}', PORT);
        });

    } catch (e) {
        console.log(e);
    }
}

async function closePoolAndExit() {
    console.log("\nTerminating");
    try {
      // Get the pool from the pool cache and close it when no
      // connections are in use, or force it closed after 10 seconds.
      // If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file.
      // This setting should not be needed if both Oracle Client and Oracle
      // Database are 19c (or later).
      await oracledb.getPool().close(10);
      console.log("Pool closed");
      process.exit(0);
    } catch(err) {
      console.error(err.message);
      process.exit(1);
    }
  }
  
  process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT',  closePoolAndExit);
  
  init();

// 인덱스 페이지
app.get('/', function(req, res, next){
    res.redirect('/web/index')
});

