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
        // ★★★ ใช้ Aggregation Pipeline เพื่อดึงและรวมข้อมูลในครั้งเดียว ★★★
        const eventsWithAttendees = await Event.aggregate([
            // 1. ค้นหาเฉพาะ Event ที่เป็นของ Organizer คนนี้
            {
                $match: { organizer: req.user._id }
            },
            // 2. ทำการ "LEFT JOIN" กับ Collection 'bookings'
            {
                $lookup: {
                    from: 'bookings', // ชื่อ collection ของ bookings ใน database (ปกติจะเป็นพหูพจน์ตัวเล็ก)
                    localField: '_id', // field จาก collection 'events'
                    foreignField: 'event', // field จาก collection 'bookings'
                    as: 'attendeeBookings' // ตั้งชื่อ field ใหม่ที่จะเก็บผลลัพธ์การ join
                }
            },
            // 3. (Optional but recommended) ทำการ "JOIN" อีกครั้งเพื่อดึงข้อมูลของ User
            {
                $lookup: {
                    from: 'users', // ชื่อ collection ของ users
                    localField: 'attendeeBookings.attendee',
                    foreignField: '_id',
                    as: 'attendeeDetails'
                }
            },
            // 4. จัดเรียงผลลัพธ์ตามวันที่
            {
                $sort: { date: -1 }
            }
        ]);
        
        // 5. จัดรูปแบบข้อมูลใหม่ให้ EJS ใช้งานง่าย
        // (เราต้องทำขั้นตอนนี้เพราะ $lookup จะคืนค่าโครงสร้างที่ซับซ้อน)
        eventsWithAttendees.forEach(event => {
            // attendeeDetails จะมีข้อมูล user ทั้งหมด เราจะ map เอาเฉพาะที่จำเป็น
            event.attendees = event.attendeeDetails.map(user => ({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }));
        });

        res.render('dashboard', {
            pageTitle: 'Organizer Dashboard',
            events: eventsWithAttendees // ส่งข้อมูลที่ผ่านการ Aggregate แล้วไป
        });

    } catch (error) {
        console.error("Error fetching dashboard data with aggregation:", error);
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
            pageTitle: `Editing: ${event.name}`,
            event: event
        });
    } catch (error) {
        res.status(500).send('Error loading the edit page.');
    }
};

exports.getHomepage = async (req, res) => {
    try {
        // 1. ค้นหาอีเวนต์ทั้งหมดที่ยังมาไม่ถึง (วันที่ >= วันนี้)
        const allUpcomingEvents = await Event.find({ date: { $gte: new Date() } })
                                             .sort({ date: 1 }) // 2. เรียงจากวันที่ใกล้ที่สุดไปไกลที่สุด
                                             .populate('organizer', 'firstName lastName');

        // 3. แยกอีเวนต์ที่ใกล้ที่สุด (ตัวแรก) ออกมา
        const nextEvent = allUpcomingEvents.shift(); // .shift() จะดึงตัวแรกออกจาก array

        // 4. ที่เหลือใน array คือ upcoming events
        const upcomingEvents = allUpcomingEvents;

        res.render('index', {
            pageTitle: 'Home',
            nextEvent: nextEvent, // ส่งอีเวนต์หลักไป
            upcomingEvents: upcomingEvents // ส่งลิสต์อีเวนต์ที่เหลือไป
        });
    } catch (error) {
        console.error("Error fetching events for homepage:", error);
        res.render('index', { pageTitle: 'Home', nextEvent: null, upcomingEvents: [] });
    }
};

exports.getSearchResults = async (req, res) => {
    try {
        const query = req.query.q || ''; // ดึงคำค้นหาจาก URL
        
        // ใช้ Regular Expression เพื่อค้นหาแบบ "contains" และไม่สนตัวพิมพ์เล็ก/ใหญ่
        const events = await Event.find({
            name: { $regex: query, $options: 'i' }
        }).sort({ date: 1 });

        res.render('search-results', {
            pageTitle: `Search results for "${query}"`,
            events: events,
            query: query
        });
    } catch (error) {
        // ... handle error ...
    }
};

exports.getCheckoutPage = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).send('Event not found');

        res.render('payment', {
            pageTitle: 'Checkout',
            event: event
        });
    } catch (error) {
        res.status(500).send('Error loading checkout page.');
    }
};