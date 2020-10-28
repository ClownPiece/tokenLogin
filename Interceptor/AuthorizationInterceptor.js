const jwt = require('jsonwebtoken');

exports.checkAuthToken = (req, res, next) => { // 로그인 토큰 검증
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_AUTH_TOKEN_SECRET);
        if(req.decoded.tokenType != "Auth"){
            return res.status(401).json({
                resultCode: 401,
                message: "토큰이 유효하지 않습니다."
            })
        }
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(419).json({
                resultCode: 419,
                message: "토큰이 만료되었습니다."
            });
        }
        return res.status(401).json({
            resultCode: 401,
            message: "토큰이 유효하지 않습니다."
        })
    }   
}

exports.checkRefreshToken = (req, res, next) => { // 리플레시 토큰 검증
    try {
        req.decoded = jwt.verify(req.body.authorization, process.env.JWT_REFRESH_TOKEN_SECRET);
        if(req.decoded.tokenType != "Refresh"){
            return res.status(401).json({
                resultCode: 401,
                message: "토큰이 유효하지 않습니다."
            })
        }
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(419).json({
                resultCode: 419,
                message: "토큰이 만료되었습니다."
            });
        }
        return res.status(401).json({
            resultCode: 401,
            message: "토큰이 유효하지 않습니다."
        })
    }   
}

exports.checkUsrcodOnStoreService = (req, res, next) => { // 가맹점 아이디인지 권한 체크
    try{
        if(req.decoded.usrcod != "30"){
            return res.status(401).json({
                resultCode: 401,
                message: "토큰이 유효하지 않습니다."
            })
        }
        return next();
    }catch(e){
        return res.status(401).json({
            resultCode: 401,
            message: "토큰이 유효하지 않습니다."
        })
    }
}


exports.checkAdminToken = (req, res, next) => { // 어드민인지 검증
    try {
        req.decoded = jwt.verify(req.body.authorization, process.env.JWT_ADMIN_TOKEN_SECRET);
        if(req.decoded.tokenType != "AdminToken"){
            return res.status(401).json({
                resultCode: 401,
                message: "토큰이 유효하지 않습니다."
            })
        }
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(419).json({
                resultCode: 419,
                message: "토큰이 만료되었습니다."
            });
        }
        return res.status(401).json({
            resultCode: 401,
            message: "토큰이 유효하지 않습니다."
        })
    }   
}