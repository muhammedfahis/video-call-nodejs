const express = require('express');
const router = express.Router();
const auth = require('../libs/middleware/auth');

const { register,login,createRoom, getRooms } = require('../controllers/users');


router.post('/register',register);
router.post('/login',login);
router.post('/create-room',auth,createRoom);
router.get('/rooms',getRooms);



module.exports =router