const Event = require('../models/eventModel');

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

exports.getCreateEventForm = (req, res) => {
  res.render('create-event', {
    pageTitle: 'Create a New Event'
  });
};