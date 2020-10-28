const oracleDB = require('oracledb');
const jwt = require('jsonwebtoken');

exports.storeJoin = async function(stonam, businessNum, telnum, address, stoLet, stoLon, vanCompanyCode, storeId, storePw, res) {
    try{

        // storePw 암호화 해서 쿼리
        const insertSQL = `
        INSERT INTO STORE_MST
        (STOSEQ, STONAM, BUSINESS_NUM, TELNUM, ADDRESS, REGDAT, STO_LAT, STO_LON, VAN_COMPANY_CODE, STORE_ID, STORE_PW, MODDAT)
        SELECT SEQ_STORE.NEXTVAL, :stonam, :businessNum, :telnum, :address, SYSDATE, :stoLet, :stoLon, :vanCompanyCode, :storeId, :storePw, SYSDATE
        FROM DUAL
        WHERE NOT EXISTS (SELECT STORE_ID FROM STORE_MST WHERE STORE_ID = :storeId)`;   
        const insertValues = [stonam, businessNum, telnum, address, stoLet, stoLon, vanCompanyCode, storeId, storePw];
        
        conn = await oracleDB.getConnection();
        let result = await conn.execute(insertSQL, insertValues);

        if(result.rowsAffected == 0){
            return res.status(404).json({
                resultCode: 404, 
                message: "해당 아이디는 사용 할 수 없습니다."
            });      
        }

        res.status(200).json({
            resultCode: 200, 
            message: "가입되었습니다."
        });

    }catch(e){
        console.log(e);
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



// 가맹점 로그인
// 기본적으로 서버에서는 인증 토큰발급 -> 오토로그인이면 리플레시토큰 추가 발행 -> 디바이스에서 하이브에 저장
// 로그인을 제외한 모든 서비스는 헤더에 발급된 토큰을 가지고 요청 해야 함
exports.storeLoginByIdAndPw = async function(storeId, storePw, autoLogin, res){
    try{
        // storePw 암호화 해서 쿼리
        const selectSQL = `
        SELECT STORE_ID, STOSEQ, TO_CHAR(MODDAT, 'YYYY-MM-DD HH24:MI:SS') MODDAT
        FROM STORE_MST
        WHERE STORE_ID = :storeId
        AND STORE_PW = :storePw`;  
        const selectValues = [storeId, storePw];

        let conn = await oracleDB.getConnection();
        const result = await conn.execute(selectSQL, selectValues);
        
        if (result.rows.length == 1) {      
            const authToken = jwt.sign({
                stoseq: result.rows[0].STOSEQ,
                usrcod: "30",
                tokenType : "Auth"
            }, process.env.JWT_AUTH_TOKEN_SECRET, {
                expiresIn: '2h', // 유효기간 2시간
                issuer: 'study',
            });
            
            if(autoLogin){
                const refreshToken = jwt.sign({
                    storeId: result.rows[0].STORE_ID,
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
exports.storeRefreshToken = async function(decodeData, res){
    try {
        const selectSQL = `
        SELECT STORE_ID, STOSEQ, TO_CHAR(MODDAT, 'YYYY-MM-DD HH24:MI:SS') MODDAT
        FROM STORE_MST
        WHERE STORE_ID = :storeId`;
        const selectValues = [decodeData.storeId];

        let conn = await oracleDB.getConnection();
        const result = await conn.execute(selectSQL, selectValues);

        if (result.rows.length == 1) {
            if (decodeData.moddat != result.rows[0].MODDAT) {
                return res.status(403).json({
                    resultCode: 403,
                    message: "회원정보가 변경되었습니다.\n다시 로그인 해 주세요.",
                });
            }

            const authToken = jwt.sign({
                stoseq: result.rows[0].STOSEQ,
                usrcod: "30",
                tokenType : "Auth"
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
