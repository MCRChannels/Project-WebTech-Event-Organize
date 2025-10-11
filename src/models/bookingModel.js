const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    attendee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
},
    {
        timestamps: true
    })

bookingSchema.pre(/^find/, function (next) {
    this.populate('attendee').populate({
        path: 'event',
        select: 'name date location'
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking