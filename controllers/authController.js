const User = require('../models/User')
//generate JWT (json web token)
const jwt = require('jsonwebtoken')
//for hashing the password
const bcrypt = require('bcrypt')

async function register(req,res){
    const {username, email, first_name, last_name, password, password_confirm} = req.body

    if(!username || !email || !password || !password_confirm || !first_name || !last_name) {
      return res.status(404).json({'message': 'Invalid fields'})
    }

    //check if password and password_conf are the same
    if(password !== password_confirm) return res.status(404).json({'message': 'Passwords do not match'})


    //check if user all ready exist
    const userExists = await User.exists({email}).exec()

    if(userExists){
        return res.status(404)
    }else{

            try {
            hashedPassword = await bcrypt.hash(password, 10)

            await User.create({email, username, password: hashedPassword, first_name, last_name})

            return res.sendStatus(201)
            } catch (error) {
            return res.status(400).json({message: "Could not register"})
            }
        }
}

async function login(req,res){
    const {email, password } = req.body

    //check email and password if not exist
    if(!email || !password){
        return res.status(404).json({'message': 'Invalid fields'})
    }

    //find the user in Db and check if the user exist in Db
    const user = await User.findOne({email}).exec()
    if(!user){
        return res.status(404).json({message: "Email or password is incorrect"})
    }


    //check if the password correct (matched)
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        return res.status(404).json({message: "Email or password is incorrect"})
    }

    //JWT
    const accessToken = jwt.sign(
      {
        id: user.id
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1800s'
      }
    )

    const refreshToken = jwt.sign(
      {
        id: user.id
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '1d'
      }
    )

    user.refresh_token = refreshToken
    //save the user
    await user.save()

    res.cookie('refresh_token', refreshToken, {httpOnly: true, maxAge: 24*60*60*1000})
    res.json({access_token: accessToken})
}

async function logout(req,res){
    const cookies = req.cookies

    //check if the cookies have refresh_token parm send (204) no content res
    if(!cookies.refresh_token) return res.status(204)


    //get the refreshToken
    const refreshToken = cookies.refresh_token
    //find the user in db by the refreshToken
    const user = await User.findOne({refresh_token: refreshToken}).exec()

    if(!user){
      res.clearCookie('refresh_token', {httpOnly: true})
      return res.status(204).send()
    }

    user.refresh_token = null
    await user.save()

    res.clearCookie('refresh_token', {httpOnly: true})
    res.status(204).send()
}

async function refresh(req,res){

      //if the cookies if not exist
      const cookies = req.cookies
      if(!cookies.refresh_token) return res.sendStatus(401)


      const refreshToken = cookies.refresh_token
      const user = await User.findOne({refresh_token: refreshToken}).exec()

      if(!user) return res.sendStatus(403)

      //verify refreshToken
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          //if the users not the same
          if(err || user.id !== decoded.id) return res.sendStatus(403)


          //if the user are the same
          const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1800s' }
          )

          res.json({access_token: accessToken})
        }
      )
}

async function user(req,res){

    try{
    const user = req.user

    return res.status(200).json(user)
    }catch(e){
      res.status(401).json({message:`error ${e}`})
    }

}

module.exports= {
                    register,
                    login,
                    logout,
                    refresh,
                    user
                }