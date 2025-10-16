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

module.exports = { registerSuperAdmin, loginSuperAdmin }