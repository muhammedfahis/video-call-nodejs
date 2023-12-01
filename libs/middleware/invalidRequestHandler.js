

const invalidRequestHandler = (req,res,next) => {
    if ((req.method == 'POST') && (!req.is('application/json') && !req.is('multipart/form-data'))) {
        res.status(400).send({
            status: "failed",
            message: "The request content type should be 'application/json' or 'multipart/form-data'"
        });
    } else {
        next();
    }
}


module.exports =  invalidRequestHandler;
