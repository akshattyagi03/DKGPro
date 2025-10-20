const User = require('../models/user-model')
const RefreshToken = require('../models/refresh-token-model')
const jwt = require('jsonwebtoken')

const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '15m' }
  )
  
  const refreshTokenValue = require('crypto').randomBytes(64).toString('hex')
  const refreshToken = new RefreshToken({
    token: refreshTokenValue,
    userId,
    userType: 'User',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  })
  
  await refreshToken.save()
  return { accessToken, refreshToken: refreshTokenValue }
}

const registerUser = async (userData, res) => {
  const { fullName, email, password, phoneNumber } = userData
  
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  const user = new User({ fullName, email, password, phoneNumber })
  await user.save()

  const { accessToken, refreshToken } = await generateTokens(user._id)
  
  res.cookie('accessToken', accessToken, { httpOnly: true, secure: false, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 })
  
  return { user: { id: user._id, fullName, email } }
}

const loginUser = async (userData, res) => {
  const { email, password } = userData
  
  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials')
  }
  
  const { accessToken, refreshToken } = await generateTokens(user._id)
  
  res.cookie('accessToken', accessToken, { httpOnly: true, secure: false, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 })
  
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

const refreshAccessToken = async (refreshTokenValue) => {
  const refreshToken = await RefreshToken.findOne({ 
    token: refreshTokenValue, 
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  })
  
  if (!refreshToken) {
    throw new Error('Invalid or expired refresh token')
  }
  
  const accessToken = jwt.sign(
    { userId: refreshToken.userId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '15m' }
  )
  
  return { accessToken }
}

const logoutUser = async (refreshTokenValue) => {
  if (refreshTokenValue) {
    await RefreshToken.findOneAndUpdate(
      { token: refreshTokenValue },
      { isRevoked: true }
    )
  }
}

module.exports = { registerUser, loginUser, getProducts, checkPincode, refreshAccessToken, logoutUser }