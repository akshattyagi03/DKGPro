const User = require('../models/user-model')
const jwt = require('jsonwebtoken')

const registerUser = async (userData, res) => {
  const { fullName, email, password, phoneNumber } = userData
  
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  const user = new User({ fullName, email, password, phoneNumber })
  await user.save()

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY)
  res.cookie('token', token, { httpOnly: true, secure: false })
  return { user: { id: user._id, fullName, email } }
}

const loginUser = async (userData, res) => {
  const { email, password } = userData
  
  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials')
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY)
  res.cookie('token', token, { httpOnly: true, secure: false })
  return { user: { id: user._id, fullName: user.fullName, email } }
}

const getProducts = async () => {
  const Product = require('../models/product-model')
  const products = await Product.find().populate('category addedBy')
  return products
}

const checkPincode = async (pincode) => {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
  const data = await response.json()
  const district = data[0]?.PostOffice?.[0]?.District || null
  
  if (!district) {
    throw new Error('District not found')
  }
  
  return { district }
}

module.exports = { registerUser, loginUser, getProducts, checkPincode }