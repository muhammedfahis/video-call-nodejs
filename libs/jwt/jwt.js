const jwt = require('jsonwebtoken');
const JwtConfig = require('../../config/jwt.json');


async function jwtSignInFunction(payload) {
    //declaring data for payload including user id
    let data = {
        date : new Date(),
        _id  : payload
    }
    try {
        //creates new token valid for 5 min and returning it including 'Bearer' as it perfix
        const strToken = await jwt.sign(data, JwtConfig.secretKey, {
            expiresIn: "30days"
        });
        return strToken;
    } catch (error) {
        new Error(error)
    }
}

const jwtVerifyFunction = async (strToken) => {
    try {
        //verfies a token wether it is valid or invalid
        return await jwt.verify(strToken, JwtConfig.secretKey)
    } catch (error) {
        new Error(error)
    }
}

const jwtDecodeFunction = async (token) => {
    try {
        //decods a JWT token string
        return jwt.decode(token, {
            complete: true
        })
    } catch (error) {
        new Error(error)
    }
}


module.exports = {
    jwtSignInFunction,
    jwtVerifyFunction,
    jwtDecodeFunction
}