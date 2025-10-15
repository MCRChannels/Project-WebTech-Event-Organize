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

router.get(
  '/admin-panel',
  authController.protectView,
  authController.restrictViewTo('admin'),
  viewController.getAdminPanelPage
);

router.get(
  '/dashboard',
  authController.protectView,
  authController.restrictViewTo('organizer'),
  viewController.getDashboardPage
);

router.get(
  '/edit-event/:id',
  authController.protectView,
  authController.restrictViewTo('organizer'),
  viewController.getEditEventForm
);

router.get(
  '/scanner',
  authController.protectView,
  authController.restrictViewTo('organizer', 'admin'),
  (req, res) => { res.render('scanner', { pageTitle: 'Ticket Scanner' }); }
);

router.get('/search', viewController.getSearchResults);
router.get('/checkout/:eventId', authController.protectView, viewController.getCheckoutPage);
module.exports = router;