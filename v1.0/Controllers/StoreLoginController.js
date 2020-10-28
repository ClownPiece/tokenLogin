const API_VERSION = __dirname.substring(__dirname.lastIndexOf('v'), __dirname.length - 12);
const DEVELOP = require('../../develop');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const storeService = require('../Service/StoreService');
const paramInterceptor = require('../../Interceptor/ParameterValidInterceptor');
const AuthorizationInterceptor = require('../../Interceptor/AuthorizationInterceptor');
router.use(bodyParser.json()); 

exports.router = router;
exports.API_VERSION = API_VERSION;


router.put("/join", [AuthorizationInterceptor.checkAdminToken, paramInterceptor.nullPropertyCheck], function(req, res){
    const {stonam, businessNum, telnum, address, stoLet, stoLon, vanCompanyCode, storeId, storePw} = req.body;
    storeService.storeJoin(stonam, businessNum, telnum, address, stoLet, stoLon, vanCompanyCode, storeId, storePw, res);
});

router.post('/loginByIdAndPw', paramInterceptor.nullPropertyCheck, function (req, res) {
    try {
        const { storeid, storepw, autoLogin } = req.body;
        storeService.storeLoginByIdAndPw(storeid, storepw, autoLogin, res);
    }catch(e){
        console.log(e);
        res.status(500).json({ 
            resultCode: 500, 
            message: "에러가 발생하였습니다.\n잠시후 다시 시도 해 주세요." 
        });
    }
});

router.post('/refreshToken', AuthorizationInterceptor.checkRefreshToken, function(req, res){
    try {
        storeService.storeRefreshToken(req.decoded, res);
    }catch(e){
        console.log(e);
        res.status(500).json({ 
            resultCode: 500, 
            message: "에러가 발생하였습니다.\n잠시후 다시 시도 해 주세요." 
        });
    }
})