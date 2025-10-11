const Booking = require('../models/bookingModel');
const Event = require('../models/eventModel');

// --- สำหรับ Attendee: สร้าง Booking ใหม่ ---
exports.createBooking = async (req, res) => {
  try {
    // 1. รับ Event ID มาจาก Request Body
    const { eventId } = req.body;
    // 2. หาข้อมูล Event จาก ID ที่ได้รับ
    const event = await Event.findById(eventId);


    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'No event found with that ID' });
    }
    if (event.ticketsAvailable <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Sorry, this event is sold out.' });
    }


    const newBooking = await Booking.create({
      event: eventId,
      attendee: req.user.id, 
      price: event.price    
    });


    event.ticketsAvailable -= 1;
    await event.save();

    res.status(201).json({
      status: 'success',
      data: {
        booking: newBooking
      }
    });
  } catch (error) {
    console.error('CREATE BOOKING ERROR:', error);
    res.status(500).json({ status: 'fail', message: 'Something went very wrong.' });
  }
};


exports.getMyBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({ attendee: req.user.id });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Something went wrong.' });
  }
};