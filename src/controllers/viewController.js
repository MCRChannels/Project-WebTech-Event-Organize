const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');

exports.getHomepage = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.render('index', {
            pageTitle: 'Upcoming Events',
            events: events
        });
    } catch (error) {
        console.error("Error fetching events for homepage:", error);
        res.render('index', { pageTitle: 'Upcoming Events', events: [] });
    }
};

exports.getLoginForm = (req, res) => {
    res.render('login', {
        pageTitle: 'Login / Register'
    });
};

exports.getProfilePage = (req, res) => {
    res.render('profile', {
        pageTitle: 'My Profile'
    });
};

exports.getMyBookingsPage = async (req, res) => {
    const bookings = await Booking.find({ attendee: req.user.id }).populate('event');
    try {
        res.render('my-bookings', {
            pageTitle: 'My Bookings',
            bookings: bookings
        });
    } catch (error) {
        res.render('my-bookings', {
            pageTitle: 'My Bookings',
            booings: []
        })
    }
};

exports.getCreateEventForm = (req, res) => {
    res.render('create-event', {
        pageTitle: 'Create a New Event'
    });
};