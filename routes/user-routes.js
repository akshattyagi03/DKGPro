const express = require('express')
const { registerUser, loginUser, getProducts, checkPincode, logoutUser } = require('../services/user-services')
const { isLoggedIn } = require('../middleware/auth')
const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const result = await registerUser(req.body, res)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const result = await loginUser(req.body, res)
    res.json(result)
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
})


//after login routes // to be placed in another file named user-functions-routes.js

router.get("/home", isLoggedIn,async (req, res)=>{
    try {
        const products = await getProducts()
        res.status(200).json({products})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get("/logout", isLoggedIn, async (req, res)=>{
  try {
    const refreshToken = req.cookies.refreshToken
    await logoutUser(refreshToken)
    
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(200).json({message: "You are logged out."})
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
router.get("/check/:pincode", async (req, res) => {
  try {
    const result = await checkPincode(req.params.pincode)
    res.status(200).json(result)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})
module.exports = router