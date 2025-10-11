const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinaryConfig.js');


const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};


const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};


// --- Controller Functions ---

exports.signup = async (req, res) => {
  try {

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    };

    if (req.file) {
      console.log('File received in memory. Preparing to upload to Cloudinary...');


      const b64 = Buffer.from(req.file.buffer).toString('base64');
      let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'event-ticketing/user_profiles'
      });
      
      console.log('Upload to Cloudinary successful. URL:', result.secure_url);

      userData.profileImage = result.secure_url;
    }

    const newUser = await User.create(userData);

    createSendToken(newUser, 201, res);

  } catch (error) {
    console.error(' SIGNUP CONTROLLER ERROR:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


exports.login = async (req, res) => {

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password!'
      });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }
    createSendToken(user, 200, res);
  } catch (error) {
    console.error('LOGIN CONTROLLER ERROR:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong during login.'
    });
  }
};