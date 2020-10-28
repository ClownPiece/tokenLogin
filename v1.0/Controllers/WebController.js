const DEVELOP = require('../../develop');
const express = require('express');
const router = express.Router();
module.exports = router;


// 인덱스 페이지
router.get('/index', function(req, res, next){
    // res.render('Web/index.html');
    res.json("Server Is Running...");
});

// 개인정보처리방침
router.get('/PrivacyPolicy', function(req, res, next){
    res.render('Web/PrivacyPolicy.html');  
});
