const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinaryConfig.js');
const { promisify } = require('util');


const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};


const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN.replace('d', '') * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,

  };
  res.cookie('jwt', token, cookieOptions);

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
      firstName: req.body.firstName,
      lastName: req.body.lastName,   
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: 'attendee'
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
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide username and password!'
      });
    }
    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect username or password'
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

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1. Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2. Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      // ★★★ ส่งข้อมูล user ไปให้ทุก Template ที่จะ render ★★★
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next(); // ถ้า token ผิดพลาด ก็ไม่ต้องทำอะไร ให้ผ่านไปเฉยๆ
    }
  }
  // ถ้าไม่มี token ก็ผ่านไปเลย
  next();
};

exports.logout = (req, res) => {
  // สั่งให้ Browser ลบ Cookie โดยการส่ง Cookie ชื่อเดิมที่หมดอายุไปแล้ว
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // หมดอายุใน 10 วินาที
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protectView = (req, res, next) => {
  // เราจะใช้ข้อมูลจาก res.locals ที่ isLoggedIn สร้างไว้
  if (!res.locals.user) {
    // ถ้าไม่มี user ใน locals (แปลว่ายังไม่ login) ให้ redirect ไปหน้า login
    return res.redirect('/login');
  }
  next();
};

// Middleware สำหรับจำกัดการเข้าถึงหน้า View ตาม Role
exports.restrictViewTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(res.locals.user.role)) {
      // ถ้า role ของ user ไม่ตรงกับที่กำหนด, ให้ redirect ไปหน้าแรก
      // อาจจะแสดงข้อความว่า 'You do not have permission' ในอนาคต
      return res.redirect('/');
    }
    next();
  };
};