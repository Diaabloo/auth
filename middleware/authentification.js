const jwt = require('jsonwebtoken')
const User = require('../models/User')
require('dotenv').config()

function authentication(req, res, next) {
    //test if the req has Authorization header
    const authHeader = req.headers['authorization'];

    //if the authorization exist and start with bearer
    if(authHeader?.startsWith('Bearer')) {

        // //grab Token from Header
        // const token = authHeader.split(' ')[1]

        // //verify the JWT
        // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        // if(err){
        //     // req.user = {}
        //     // return next()
        //     console.error(err);
        //     return res.status(401).json({ message: 'Unauthorized' });
        // }

        try{
            // verify a token symmetric - synchronous
            const token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token ,process.env.ACCESS_TOKEN_SECRET);
            req.userData = decoded;
            next();
        } catch{
            return res.status(401).json({
                message : "Auth Failed Try Again"
            })
        }

        //get the user
        const user = User.findById(decoded.id).exec()

        if(user){
            req.user = user.toObject({ getters: true })
        }else{
            // req.user = {}
            console.error('User not found');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return next()

        }else{
        req.user = {}
        return next()
    }
}

module.exports = authentication