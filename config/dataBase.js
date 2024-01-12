const mongoose = require('mongoose')
require('dotenv').config()


async function connect(){
    try {
        await mongoose.connect
        (
            process.env.MONGO_URI
        )
    }catch (e){
        console.log(e);
    }
}

module.exports = connect