// src/controllers/bookingController.js

const Booking = require('../models/bookingModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel'); // <-- ★★★ 1. เพิ่มบรรทัดนี้เข้ามา

// --- สำหรับ Attendee: สร้าง Booking ใหม่ ---
exports.createBooking = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'No event found with that ID' });
    }
    if (event.ticketAvailable <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Sorry, this event is sold out.' });
    }

    // ไม่มีการตรวจสอบ Wallet อีกต่อไป

    const newBooking = await Booking.create({
      event: eventId,
      attendee: req.user.id,
      price: event.price
    });

    event.ticketAvailable -= 1;
    await event.save();

    res.status(201).json({
      status: 'success',
      message: 'Booking successful!',
      data: {
        booking: newBooking
      }
    });
  } catch (error) {
    console.error('CREATE BOOKING ERROR:', error);
    res.status(500).json({ status: 'fail', message: 'Something went very wrong.' });
  }
};

// --- สำหรับ Attendee: ดูประวัติการจองของตัวเอง ---
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

exports.verifyTicket = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('event');

    if (!booking) {
      return res.status(404).json({ status: 'fail', message: 'Ticket not found.' });
    }
    if (booking.isCheckedIn) {
      return res.status(400).json({ status: 'fail', message: `This ticket has already been checked in on ${new Date().toLocaleString()}.` });
    }

    // อัปเดตสถานะ
    booking.isCheckedIn = true;
    await booking.save();

    res.status(200).json({ 
      status: 'success', 
      message: 'Check-in successful!',
      data: {
        eventName: booking.event.name,
        attendee: booking.attendee // อาจจะส่งข้อมูลผู้เข้าร่วมกลับไปด้วย
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error.' });
  }
};