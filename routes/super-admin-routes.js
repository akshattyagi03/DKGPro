const express = require('express')
const { registerSuperAdmin, loginSuperAdmin } = require('../services/super-admin-services')
const { isSuperAdmin } = require('../middleware/auth')
const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const result = await registerSuperAdmin(req.body, res)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const result = await loginSuperAdmin(req.body, res)
    res.json(result)
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
})

router.get("/pending-admins", isSuperAdmin, async (req, res) => {
  try {
    const Admin = require('../models/admin-model')
    const pendingAdmins = await Admin.find({ isApproved: false })
    res.status(200).json({ pendingAdmins })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post("/approve-admin/:adminId", isSuperAdmin, async (req, res) => {
  try {
    const Admin = require('../models/admin-model')
    const admin = await Admin.findByIdAndUpdate(
      req.params.adminId,
      { 
        isApproved: true,
        approvedBy: req.superAdmin._id
      },
      { new: true }
    )
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }
    
    res.status(200).json({ message: 'Admin approved successfully', admin })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post("/reject-admin/:adminId", isSuperAdmin, async (req, res) => {
  try {
    const Admin = require('../models/admin-model')
    const admin = await Admin.findByIdAndDelete(req.params.adminId)
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }
    
    res.status(200).json({ message: 'Admin registration rejected and removed' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/products", isSuperAdmin, async (req, res) => {
  try {
    const Product = require('../models/product-model')
    const products = await Product.find()
      .populate('mainCategory')
      .populate('subCategory')
      .populate('thirdCategory')
      .populate('addedBy')
    res.status(200).json({ products })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put("/edit-product/:productId", isSuperAdmin, async (req, res) => {
  try {
    const Product = require('../models/product-model')
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true }
    )
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    res.status(200).json({ message: 'Product updated successfully', product })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete("/delete-product/:productId", isSuperAdmin, async (req, res) => {
  try {
    const Product = require('../models/product-model')
    const product = await Product.findByIdAndDelete(req.params.productId)
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    res.status(200).json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router