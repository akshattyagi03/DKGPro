const express = require('express')
const { 
  registerSuperAdmin, 
  loginSuperAdmin, 
  getPendingAdmins, 
  approveAdmin, 
  rejectAdmin, 
  getAllProducts, 
  editProduct, 
  deleteProduct 
} = require('../services/super-admin-services')
const { isSuperAdmin } = require('../middleware/auth')
const router = express.Router()

router.post('/register', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Super admin creation only allowed in development environment' })
  }
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
    const pendingAdmins = await getPendingAdmins()
    res.status(200).json({ pendingAdmins })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post("/approve-admin/:adminId", isSuperAdmin, async (req, res) => {
  try {
    const admin = await approveAdmin(req.params.adminId, req.superAdmin._id)
    res.status(200).json({ message: 'Admin approved successfully', admin })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post("/reject-admin/:adminId", isSuperAdmin, async (req, res) => {
  try {
    await rejectAdmin(req.params.adminId)
    res.status(200).json({ message: 'Admin registration rejected and removed' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/products", isSuperAdmin, async (req, res) => {
  try {
    const products = await getAllProducts()
    res.status(200).json({ products })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put("/edit-product/:productId", isSuperAdmin, async (req, res) => {
  try {
    const product = await editProduct(req.params.productId, req.body)
    res.status(200).json({ message: 'Product updated successfully', product })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete("/delete-product/:productId", isSuperAdmin, async (req, res) => {
  try {
    await deleteProduct(req.params.productId)
    res.status(200).json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/logout", isSuperAdmin, (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ message: 'Logged out successfully' })
})

module.exports = router