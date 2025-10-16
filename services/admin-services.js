const Admin = require('../models/admin-model');
const jwt = require('jsonwebtoken');

const registerAdmin = async (adminData, res) => {
  const { fullName, email, password } = adminData;
  
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new Error('Admin already exists');
  }
  const admin = new Admin({ fullName, email, password });
  await admin.save();

  const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET_KEY);
  res.cookie('adminToken', token, { httpOnly: true, secure: false });
  return { admin: { id: admin._id, fullName, email } };
};

const loginAdmin = async (adminData, res) => {
  const { email, password } = adminData;
  
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET_KEY);
  res.cookie('adminToken', token, { httpOnly: true, secure: false });
  return { admin: { id: admin._id, fullName: admin.fullName, email } };
};

const addProducts=async (req, res)=>{
  const {category, subCategory, name, description, price, quantity, image, addedBy}= req.body
  const Product = require('../models/product-model');
}

module.exports = { registerAdmin, loginAdmin };