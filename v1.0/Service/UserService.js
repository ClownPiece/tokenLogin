const oracleDB = require('oracledb');
const jwt = require('jsonwebtoken');

// const sqlHelper = require('../../util/DateHelper');

exports.memberJoin = async function(userid, mobnum, userpw, usrnam, emladd, address, res) {
    try{
        const usrcod = "10";
        // userpw 암호화 해서 쿼리
        const insertSQL = `
        INSERT INTO USER_MST
        (USERID, MOBNUM, USERPW, USRNAM, EMLADD, REGDAT, ADDRESS, USRCOD, MODDAT)
        VALUES
        (:userid, :mobnum, :userpw, :usernam, :emladd, SYSDATE, :address, :usrcod, SYSDATE)`;

        const insertValues = [userid, mobnum, userpw, usrnam, emladd, address, usrcod];
        
        let conn = await oracleDB.getConnection();
        await conn.execute(insertSQL, insertValues);

        res.status(200).json({
            resultCode: 200, 
            message: "가입을 축하합니다."
        });
    }catch(e){
        console.log(e.stack);
        if(e.stack.indexOf("ORA-00001") != -1){
            return res.status(404).json({
                resultCode: 404, 
                message: "해당 아이디는 사용 할 수 없습니다."
            });
        }else{
            return res.status(500).json({
                resultCode: 500, 
                message : "에러가 발생하였습니다.\n잠시후 다시 시도 해 주세요."
            });
        }
    }
}



// 로그인
// 기본적으로 서버에서는 인증 토큰발급 -> 오토로그인이면 리플레시토큰 추가 발행 -> 디바이스에서 하이브에 저장
// 로그인 회원가입을 제외한 모든 서비스는 헤더에 발급된 토큰을 가지고 요청
exports.memberLoginByIdAndPw = async function(userid, userpw, autoLogin, res){
    try{
        // userpw 암호화 해서 쿼리
        const selectSQL = `
        SELECT USERID, MOBNUM, EMLADD, USRCOD, TO_CHAR(MODDAT, 'YYYY-MM-DD HH24:MI:SS')
        FROM USER_MST
        WHERE USERID = :userid
        AND USERPW = :userpw`;  
        const selectValues = [userid, userpw];

        let conn = await oracleDB.getConnection();
        const result = await conn.execute(selectSQL, selectValues);
        
        if (result.rows.length == 1) {      
            const authToken = jwt.sign({
                userid: result.rows[0].USERID,
                usrcod: result.rows[0].USRCOD,
                tokenType : "Auth"
            }, process.env.JWT_AUTH_TOKEN_SECRET, {
                expiresIn: '2h', // 유효기간 2시간
                issuer: 'study',
            });
            
            if(autoLogin){
                const refreshToken = jwt.sign({
                    userid: result.rows[0].USERID,
                    moddat: result.rows[0].MODDAT,
                    tokenType : "Refresh"
                }, process.env.JWT_REFRESH_TOKEN_SECRET, {
                    expiresIn: '365d', // 유효기간 1년
                    issuer: 'study',
                });

                return res.status(200).json({
                resultCode: 200,
                message: "로그인 성공",
                authToken,
                refreshToken
                });
            }

            return res.status(200).json({
            resultCode: 200,
            message: "로그인 성공",
            authToken,
            });        
        } else {
            res.status(404).json({
                resultCode: 404,
                message: "아이디 또는 비밀번호를 잘못 입력 하셨습니다."
            })
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ 
            resultCode: 500, 
            message: "에러가 발생하였습니다.\n잠시후 다시 시도 해 주세요." 
        });
    }
}

// // 토큰검증 로그인
exports.memberRefreshToken = async function(decodeData, res){
    try {
        const selectSQL = `
        SELECT USERID, MOBNUM, EMLADD, USRCOD, TO_CHAR(MODDAT, 'YYYY-MM-DD HH24:MI:SS')
        FROM USER_MST
        WHERE USERID = :userid`;
        const selectValues = [decodeData.userid];

        let conn = await oracleDB.getConnection();
        const result = await conn.execute(selectSQL, selectValues);

        if (result.rows.length == 1) {
            if (decodeData.moddat != result.rows[0].MODDAT) {
                console.log(decodeData.moddat);
                console.log(result.rows[0].MODDAT);
                return res.status(403).json({
                    resultCode: 403,
                    message: "회원정보가 변경되었습니다.\n다시 로그인 해 주세요.",
                });
            }

            const authToken = jwt.sign({
                userid: result.rows[0].USERID,
                usrcod: result.rows[0].USRCOD,
                tokenType: "Auth"
            }, process.env.JWT_AUTH_TOKEN_SECRET, {
                expiresIn: '2h', // 유효기간 2시간
                issuer: 'study',
            });

            return res.status(200).json({
                resultCode: 200,
                message: "로그인 성공",
                authToken,
            });
        } else {
            return res.status(403).json({
                resultCode: 403,
                message: "회원정보가 변경되었습니다.\n다시 로그인 해 주세요.",
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            resultCode: 500,
            message: "에러가 발생하였습니다.\n잠시후 다시 시도 해 주세요."
        });
    }
}

// // 아이디 찾기
// function findid(req, res){
//     const mobnum;
//     const emladd;
// }

// // 비밀번호 변경
// function replacePW(req, res){
//     const oldPW
//     const newPW;
// }
