const Event = require('../models/eventModel');
const cloudinary = require('../config/cloudinaryConfig.js');

exports.createEvent = async (req, res) => {
    try {

        const eventData = {
            name: req.body.name,
            description: req.body.description,
            date: req.body.date,
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
        // 1. ค้นหาอีเวนต์จาก ID ที่ส่งมาใน URL
        const event = await Event.findById(req.params.id);

        // 2. ตรวจสอบว่ามีอีเวนต์นี้อยู่จริงหรือไม่
        if (!event) {
            return res.status(404).json({ status: 'fail', message: 'No event found with that ID' });
        }

        // 3. ★★★ ตรวจสอบความเป็นเจ้าของ ★★★
        // เช็คว่า ID ของ user ที่ล็อกอินอยู่ (req.user.id) ตรงกับ ID ของ organizer ที่สร้างอีเวนต์นี้หรือไม่
        if (event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ status: 'fail', message: 'You do not have permission to update this event.' });
        }

        // 4. (Optional) ถ้ามีการส่งไฟล์รูปภาพใหม่มาด้วย ให้อัปเดต imageUrl
        if (req.file) {
            req.body.imageUrl = req.file.path;
        }

        // 5. ทำการอัปเดตข้อมูล
        // req.body จะมีเฉพาะ field ที่เราต้องการแก้ไข
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // คืนค่า document ที่อัปเดตแล้ว
            runValidators: true // สั่งให้ Mongoose ตรวจสอบข้อมูลใหม่ตาม Schema ด้วย
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