const express = require('express');
const authController = require('../controllers/authController');
const eventController = require('../controllers/eventController');
const bookingController = require('../controllers/bookingController')
const authMiddleware = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload');

const router = express.Router();

// For Auth (login)
router.post('/users/signup', upload.single('profileImage'), authController.signup);
router.post('/users/login', authController.login);
router.get('/users/logout', authController.logout);

// For Event (Create/Get/Update/Delete)
router.get('/events', eventController.getAllEvents);
router.get('/events/:id', eventController.getEvent);


router.post(
  '/events',
  authMiddleware.protect, 
  authMiddleware.restrictTo('organizer'), 
  upload.single('imageUrl'),
  eventController.createEvent 
);

router.patch(
  '/events/:id',
  authMiddleware.protect,                  
  authMiddleware.restrictTo('organizer'), 
  upload.single('imageUrl'),               
  eventController.updateEvent              
);

router.delete(
  '/events/:id',
  authMiddleware.protect,                  
  authMiddleware.restrictTo('organizer'),  
  eventController.deleteEvent           
);

//For Booking
router.use(authMiddleware.protect, authMiddleware.restrictTo('attendee'));
router.post('/bookings', bookingController.createBooking);
router.get('/bookings/my-bookings', bookingController.getMyBookings);


module.exports = router;