const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel'); 

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

exports.getAdminPanelPage = async (req, res) => {
    try {
        const users = await User.find().sort({ firstName: 1 });
        const events = await Event.find().sort({ date: -1 }).populate('organizer', 'firstName lastName');

        res.render('admin-panel', {
            pageTitle: 'Admin Panel',
            users: users,
            events: events
        });
    } catch (error) {
        console.error("Error fetching data for admin panel:", error);
        res.render('admin-panel', {
            pageTitle: 'Admin Panel',
            users: [],
            events: []
        });
    }
};

exports.getDashboardPage = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id })
            .lean()
            .sort({ date: -1 });

        if (events.length === 0) {
            return res.render('dashboard', {
                pageTitle: 'My Dashboard',
                events: [],
                totalTicketsSold: 0,
                totalRevenue: 0
            });
        }

        const eventIds = events.map(event => event._id);

        const bookings = await Booking.find({ event: { $in: eventIds } })
            .populate({ path: 'attendee', select: 'firstName lastName email' });

        const bookingsByEvent = new Map();
        bookings.forEach(booking => {
            const eventIdString = booking.event.toString();
            if (!bookingsByEvent.has(eventIdString)) {
                bookingsByEvent.set(eventIdString, []);
            }
            bookingsByEvent.get(eventIdString).push(booking);
        });

        let totalTicketsSold = 0;
        let totalRevenue = 0;
        events.forEach(event => {
            const bookingsForThisEvent = event.bookings ?? [];
            totalTicketsSold += bookingsForThisEvent.length;
            totalRevenue += bookingsForThisEvent.length * event.price;
        });

        res.render('dashboard', {
            pageTitle: 'My Dashboard',
            events,
            totalTicketsSold,
            totalRevenue
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send("Error loading dashboard");
    }
}

exports.getEditEventForm = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send('Event not found');
        }

        // ตรวจสอบว่าเป็นเจ้าของอีเวนต์หรือไม่
        if (event.organizer.toString() !== req.user.id) {
            return res.status(403).send('You do not have permission to edit this event.');
        }

        res.render('edit-event', {
            pageTitle: `Edit: ${event.name}`,
            event: event
        });
    } catch (error) {
        res.status(500).send('Error loading the edit page.');
    }
};
