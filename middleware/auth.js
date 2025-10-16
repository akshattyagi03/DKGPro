const jwt = require('jsonwebtoken')
const User = require('../models/user-model')
const Admin = require('../models/admin-model')
const SuperAdmin = require('../models/super-admin-model')

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' })
    }
    
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' })
  }
}

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. Admin token required.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const admin = await Admin.findById(decoded.adminId)
    
    if (!admin || !admin.isApproved) {
      return res.status(401).json({ message: 'Admin account not approved/Admin not found' })
    }

    req.admin = admin
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid admin token.' })
  }
}

const isSuperAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.superAdminToken
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. Super admin token required.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const superAdmin = await SuperAdmin.findById(decoded.superAdminId)
    
    if (!superAdmin) {
      return res.status(401).json({ message: 'Invalid super admin token.' })
    }

    req.superAdmin = superAdmin
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid super admin token.' })
  }
}

module.exports = { isLoggedIn, isAdmin, isSuperAdmin }