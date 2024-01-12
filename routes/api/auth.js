const express = require ('express')
const router = express.Router()
const authController = require('../../controllers/authController')
const authMiddle = require('../../middleware/auth')

//Add all routes for auth
router.post('/register',authController.register)

router.post('/login',authController.login)

router.post('/logout',authController.logout)

router.post('/refresh',authController.refresh)

router.get('/user',authMiddle ,authController.user)


module.exports = router