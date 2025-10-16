const express = require('express');
const { registerUser, loginUser } = require('../services/user-services');
const { isLoggedIn } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const result = await registerUser(req.body, res)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await loginUser(req.body, res)
    res.json(result)
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
});
router.get("/home", async (req, res)=>{
    try {
        const Product = require('../models/product-model');
        const products = await Product.find().populate('category addedBy');
        res.status(200).json({products});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.get("/logout", isLoggedIn, (req, res)=>{
    res.clearCookie('token')
    res.status(200).json({message: "You are logged out."})
})
router.get("/check/:pincode", async (req, res) => {
  const pincode = req.params.pincode;
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json()
    const district = data[0]?.PostOffice?.[0]?.District || null
    if (district) {
      return res.status(200).json({ district })
    } else {
      return res.status(404).json({ error: "District not found" })
    }
  } catch (err) {
    return res.status(500).json({ error: "API Error", details: err.message })
  }
});
module.exports = router;