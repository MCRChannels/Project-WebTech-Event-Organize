const Event = require('../models/eventModel');
const cloudinary = require('../config/cloudinaryConfig.js');

exports.createEvent = async (req, res) => {
    try {

        const eventData = {
            name: req.body.name,
            description: req.body.description,
            date: req.body.date,
            time: req.body.time,
            location: req.body.location,
            ticketAvailable: req.body.ticketAvailable, 
            price: req.body.price,
            organizer: req.user.id
        };


    if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'event-ticketing/event_images'
        });

        eventData.imageUrl = result.secure_url;
        } else {
            return res.status(400).json({ status: 'fail', message: 'Event image is required.' });
    }

    const newEvent = await Event.create(eventData);

    res.status(201).json({
        status: 'success',
        data: {
            event: newEvent
        }
    });
    } catch (error) {
        console.error('CREATE EVENT ERROR:', error);
        res.status(400).json({
        status: 'fail',
        message: error.message
        });
    }
};

// --- สำหรับทุกคน: ดูอีเวนต์ทั้งหมด ---
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('organizer', 'firstName lastName email'); // <-- ★★★ แก้ไข


        res.status(200).json({
            status: 'success',
            results: events.length,
            data: {
                events
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Something went wrong.' });
    }
};

// --- สำหรับทุกคน: ดูอีเวนต์เดียว ---
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'firstName lastName email profileImage');


        if (!event) {
            return res.status(404).json({ status: 'fail', message: 'No event found with that ID' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                event
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Something went wrong.' });
    }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'No event found with that ID' });
    }

    // ตรวจสอบความเป็นเจ้าของ
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to update this event.' });
    }

    // สร้าง object สำหรับเก็บข้อมูลที่จะอัปเดต
    const updates = { ...req.body };

    // ★★★ อัปเกรด Logic การอัปเดตรูปภาพ ★★★
    if (req.file) {
      // แปลง Buffer เป็น Data URI
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
      
      // สั่งอัปโหลดไปยัง Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'event-ticketing/event_images'
      });
      
      // นำ URL ที่ได้มาใส่ใน object ที่จะอัปเดต
      updates.imageUrl = result.secure_url;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        event: updatedEvent
      }
    });
  } catch (error) {
    console.error('UPDATE EVENT ERROR:', error);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// --- สำหรับ Organizer: ลบอีเวนต์ของตัวเอง ---
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ status: 'fail', message: 'No event found with that ID' });
        }

        // ★★★ ตรวจสอบความเป็นเจ้าของ ★★★
        if (event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ status: 'fail', message: 'You do not have permission to delete this event.' });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Something went wrong.' });
    }
};

// --- สำหรับ Organizer: ดูรายชื่อคนจองอีเวนต์ของตัวเอง ---
exports.getEventBookings = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // ★★★ ตรวจสอบความเป็นเจ้าของ ★★★
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the organizer of this event.' });
    }

    // ค้นหา booking ทั้งหมดของ event นี้ และ populate ข้อมูล attendee
    const bookings = await Booking.find({ event: req.params.id })
                                    .populate('attendee', 'firstName lastName email profileImage');

    res.status(200).json({
      status: 'success',
      data: {
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

exports.searchEventsAutocomplete = async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.json([]); // ส่ง array ว่างกลับไปถ้าไม่มี query
    }

    // ค้นหาอีเวนต์ที่ชื่อมีส่วนของ query (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
    const events = await Event.find({
      name: { $regex: query, $options: 'i' }
    }).select('name _id').limit(5); // ดึงมาแค่ name และ id, จำกัดที่ 5 ผลลัพธ์

    // เราจะส่งกลับไปแค่ array ของ events เพื่อให้ JS ทำงานง่ายขึ้น
    res.status(200).json(events);

  } catch (error) {
    console.error('AUTOCOMPLETE SEARCH ERROR:', error);
    res.status(500).json([]); // ถ้า error ให้ส่ง array ว่างกลับไป
  }
};