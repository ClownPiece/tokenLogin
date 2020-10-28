const API_VERSION = __dirname.substring(__dirname.lastIndexOf('v'), __dirname.length - 12);
const DEVELOP = require('../../develop');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const AuthorizationInterceptor = require('../../Interceptor/AuthorizationInterceptor');
const parameterVaildInterceptor = require('../../Interceptor/ParameterValidInterceptor');
const productService = require('../Service/ProductService');

router.use(bodyParser.json());
router.use(AuthorizationInterceptor.checkAuthToken);
router.use(AuthorizationInterceptor.checkUsrcodOnStoreService);
router.use(AuthorizationInterceptor.checkUsrcodOnStoreService);
router.use(parameterVaildInterceptor.nullPropertyCheck);

exports.router = router;
exports.API_VERSION = API_VERSION;

