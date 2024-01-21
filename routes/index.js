const express = require('express');
const router = express.Router();

const { getRoomsDB } = require('../libs/db/users')

const userRouter = require('./users');
const invalidRequestHandler = require('../libs/middleware/invalidRequestHandler');

/* GET home page. */
router.get('/', async function (req, res, next) {
    let data = await getRoomsDB();
    if(data) {
        res.status(200).json({
            success:true,
            datas:data.data,
            title: 'Nodejs Task Project Test '
        });
    }
});
router.use(invalidRequestHandler);
router.use('/user', userRouter);
module.exports = router;