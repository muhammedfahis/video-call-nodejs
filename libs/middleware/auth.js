const jwt = require('../jwt/jwt');


module.exports = async function (req, res, next) {
    //takes token from request query
    let authHeader = req.header('Authorization');
    try {
        if (authHeader) {
            //if token removes the 'Bearer' keyword from its top
            let token = authHeader.split(" ").pop();
            //checks the token wether it is valid or not
            const verified = await jwt.jwtVerifyFunction(token);
            if(verified) {
                //if token valid the request is allowed
                let decoded = await jwt.jwtDecodeFunction(token);
                let user_id = decoded.payload._id;
                req.user_id = user_id;
                console.log(user_id,'decoded');
                return next()
            } else {
                //if token is not valid responds with 401 unauthorized error
                return res.status(401).send({
                    "status": 401,
                    "message": 'Unauthorized User'
                });
            }
        } else {
            //if token not found responds with 401 unauthorized error
            return res.status(401).send({
                "status": 401,
                "message": 'Unauthorized User'
            });
        }
    } catch (error) {
         //if something went wrong responds with 401 unauthorized error
         return res.status(401).send({
            "status": 401,
            "message": 'Unauthorized User'
        });
    }
}