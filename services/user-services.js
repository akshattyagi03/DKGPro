const User = require('../models/user-model');
const jwt = require('jsonwebtoken');

const registerUser = async (userData, res) => {
  const { fullName, email, password, phoneNumber } = userData;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = new User({ fullName, email, password, phoneNumber });
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
  res.cookie('token', token, { httpOnly: true, secure: false });
  return { user: { id: user._id, fullName, email } };
};

const loginUser = async (userData, res) => {
  const { email, password } = userData;
  
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
  res.cookie('token', token, { httpOnly: true, secure: false });
  return { user: { id: user._id, fullName: user.fullName, email } };
};

module.exports = { registerUser, loginUser };