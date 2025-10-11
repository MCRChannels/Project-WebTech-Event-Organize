const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: validator.isEmail
    },
    profileImage: {
        type: String,
        required: true,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['attendee', 'organizer'],
        default: 'attendee'
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    }
},
    {
        timestamps: true
    })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema)
module.exports = User