exports.nullPropertyCheck = (req, res, next) => {
    try{
        for(key in req.body) {
            if(req.body[key] == null){
                return res.status(404).json({
                    resultCode: 404, 
                    message: "잘못된 요청입니다."
                });
            }
        }
        return next();
    }catch(e){
        console.log(e);
        return res.status(500).json({
            resultCode: 500, 
            message: "에러가 발생하였습니다."
        });
    }
}