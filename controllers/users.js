const niv = require('node-input-validator');
const {
    encrypt,
    validate
} = require('../libs/crypto/crypto');
const {
    jwtSignInFunction
} = require('../libs/jwt/jwt');
const {
    registerUserDB,
    getSingleUserByEmailDB,
    createRoomDB,
    getRoomsDB
} = require("../libs/db/users");
const { v4: uuidv4 } = require("uuid");




const register = (req, res) => {

    const v = new niv.Validator(req.body, {
        name:'required',
        email: 'required|email',
        password: 'required'
    });
    const {
        name,
        email,
        password
    } = req.body;
    try {
        //check the inputs are valid or not. if they are not valid we immediately responds with invalid input error
        v.check().then(async matched => {
            if (!matched) {
                res.status(400).send({
                    "success": false,
                    "message": Object.values(v.errors)[0].message
                });
            } else {
                //if inputs are valid checks wether there is a user with same address
                let existingUser = await getSingleUserByEmailDB(email);
                if (!existingUser.data) {
                    let hashedPass = await encrypt(password);
                    const data = await registerUserDB({
                        name,
                        email,
                        password: hashedPass,
                    });
                    if (data.success) {
                        res.status(200).send(data);
                    } else {
                        res.status(500).send(data);
                    }
                } else {
                    res.status(409).send({
                        "success": false,
                        "message": 'User Already Exists'
                    });
                }

            }
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }

}

const login = (req, res) => {

    const v = new niv.Validator(req.body, {
        email: 'required|email',
        password: 'required'
    });
    const {
        email,
        password
    } = req.body;
    try {
        v.check().then(async matched => {
            if (!matched) {
                res.status(422).send({
                    "success": false,
                    "message": Object.values(v.errors)[0].message
                });
            } else {
                //gets user with email address with db to check wether email is valid or not
                const userData = await getSingleUserByEmailDB(email);
                if (userData.data) {
                    let hashedPass = userData.data.password;
                    let valid = await validate(password, hashedPass);
                    if (valid) {
                        const jwtToken = await jwtSignInFunction(userData.data._id);
                        delete userData.data.password;
                        userData.data.token = jwtToken
                        let resData = {
                            success: true,
                            message: 'User logined successfully',
                            userData: userData.data
                        }
                        res.status(200).send(resData);
                    } else {
                        res.status(400).send({
                            "success": false,
                            "message": 'Incorrect Password'
                        });
                    }
                } else {
                    res.status(400).send({
                        "success": false,
                        "message": 'Incorrect Email'
                    });
                }
            }
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

const createRoom = async (req,res) => {
  
    try {
        let room_id = uuidv4();
        let user_id = req.user_id
        const room = await createRoomDB({room_id,user_id});
        if(room.success) {
            res.status(200).send({...room,id:room_id})
        } else {
            res.status(500).send({
                success: false,
                message: error.message
            });
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }

}

const getRooms = async (req,res) => {
  
    try {
        const rooms = await getRoomsDB();
        if(rooms.success) {
            res.status(200).send(rooms)
        } else {
            res.status(500).send({
                success: false,
                message: error.message
            });
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }

}


module.exports = {
    register,
    login,
    createRoom,
    getRooms
}