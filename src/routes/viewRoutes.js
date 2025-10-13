const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

router.use(authController.isLoggedIn);

router.get('/', viewController.getHomepage);
router.get('/login', viewController.getLoginForm);

router.get(
  '/create-event', 
  authController.protectView, // 1. ต้องล็อกอินก่อน
  authController.restrictViewTo('organizer'), // 2. ต้องเป็น Organizer เท่านั้น
  viewController.getCreateEventForm // 3. ถ้าผ่านหมด ค่อย Render หน้าฟอร์ม
);

router.get('/profile', authController.protectView, viewController.getProfilePage);

router.get('/my-bookings', authController.protectView, viewController.getMyBookingsPage);

module.exports = router;