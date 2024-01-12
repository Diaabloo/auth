require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const path = require('path')
const corsOptions = require('./config/cors')
const connectDb = require ('./config/dataBase')
const credentials = require('./middleware/credentials')
const errorHandler = require('./middleware/errorHandler')
const Routes = require('./routes/api/auth')

const app = express()

connectDb()


//Allow credentials
app.use(credentials)
// CORS
app.use(cors(corsOptions))
// parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: false }))
// application/json response
app.use(express.json())
// middleware for cookies
app.use(cookieParser())
// static files
app.use('/static', express.static(path.join(__dirname, 'public')))
//Default Error Handler
app.use(errorHandler)
//Routes
app.use('/api/auth',Routes)
// executed for all HTTP methods,catch-all undefined routes and responds with a 404 Not Found error.
app.all('*', (req,res)=>{
    res.status(404)

    if(req.accepts('json')){
        return res.json({error:'Not found'})
    }else{
        res.type('text').send('404 NOT FOUND')
    }
})


//PORT for Server
const PORT = 3000
mongoose.connection.once('open',()=>{
    console.log("DB connected")
    app.listen(PORT,()=>console.log(`listening on port ${PORT}`));

})
