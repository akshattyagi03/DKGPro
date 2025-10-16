const SuperAdmin = require('../models/super-admin-model')
const jwt = require('jsonwebtoken')

const registerSuperAdmin = async (superAdminData, res) => {
  const { fullName, email, password } = superAdminData
  
  const existingSuperAdmin = await SuperAdmin.findOne({ email })
  if (existingSuperAdmin) {
    throw new Error('Super admin already exists')
  }
  const superAdmin = new SuperAdmin({ fullName, email, password })
  await superAdmin.save()

  const token = jwt.sign({ superAdminId: superAdmin._id }, process.env.JWT_SECRET_KEY)
  res.cookie('superAdminToken', token, { httpOnly: true, secure: false })
  return { superAdmin: { id: superAdmin._id, fullName, email } }
}

const loginSuperAdmin = async (superAdminData, res) => {
  const { email, password } = superAdminData
  
  const superAdmin = await SuperAdmin.findOne({ email })
  if (!superAdmin || !(await superAdmin.comparePassword(password))) {
    throw new Error('Invalid credentials')
  }

  const token = jwt.sign({ superAdminId: superAdmin._id }, process.env.JWT_SECRET_KEY)
  res.cookie('superAdminToken', token, { httpOnly: true, secure: false })
  return { superAdmin: { id: superAdmin._id, fullName: superAdmin.fullName, email } }
}

const getPendingAdmins = async () => {
  const Admin = require('../models/admin-model')
  const pendingAdmins = await Admin.find({ isApproved: false })
  return pendingAdmins
}

const approveAdmin = async (adminId, superAdminId) => {
  const Admin = require('../models/admin-model')
  const admin = await Admin.findByIdAndUpdate(
    adminId,
    { 
      isApproved: true,
      approvedBy: superAdminId
    },
    { new: true }
  )
  
  if (!admin) {
    throw new Error('Admin not found')
  }
  
  return admin
}

const rejectAdmin = async (adminId) => {
  const Admin = require('../models/admin-model')
  const admin = await Admin.findByIdAndDelete(adminId)
  
  if (!admin) {
    throw new Error('Admin not found')
  }
  
  return admin
}

const getAllProducts = async () => {
  const Product = require('../models/product-model')
  const products = await Product.find()
    .populate('mainCategory')
    .populate('subCategory')
    .populate('thirdCategory')
    .populate('addedBy')
  return products
}

const editProduct = async (productId, updateData) => {
  const Product = require('../models/product-model')
  const product = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true }
  )
  
  if (!product) {
    throw new Error('Product not found')
  }
  
  return product
}

const deleteProduct = async (productId) => {
  const Product = require('../models/product-model')
  const product = await Product.findByIdAndDelete(productId)
  
  if (!product) {
    throw new Error('Product not found')
  }
  
  return product
}

module.exports = { 
  registerSuperAdmin, 
  loginSuperAdmin, 
  getPendingAdmins, 
  approveAdmin, 
  rejectAdmin, 
  getAllProducts, 
  editProduct, 
  deleteProduct 
}