const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');


exports.protect = async (req, res, next) => {
  try {
    let token;
    // 1. ตรวจสอบหา Token จาก Header ก่อน (สำหรับ Mobile App หรือ SPA ในอนาคต)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // 2. ★★★ ถ้าไม่เจอใน Header, ให้ลองหาจาก Cookie ★★★
    else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
    }

    // 3. Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 4. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'The user belonging to this token does no longer exist.' });
    }
    
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'fail', message: 'Invalid token. Please log in again.' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['organizer']. role='attendee'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to perform this action' });
    }
    next();
  };
};