const express = require('express');
const { registerAdmin, loginAdmin } = require('../services/admin-services');
const { isLoggedIn, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const result = await registerAdmin(req.body, res);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await loginAdmin(req.body, res);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.get("/home", isLoggedIn, (req, res)=>{
    res.status(200).json({user: req.user})
})

router.post("/addproducts", isAdmin, async (req, res)=>{
    
})

router.get("/logout", isLoggedIn, (req, res)=>{
    res.clearCookie('token')
    res.status(200).json({message: "You are logged out."})
})

module.exports = router;