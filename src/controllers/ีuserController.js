const User = require('../models/userModel');
const cloudinary = require('../config/cloudinaryConfig');

// ฟังก์ชันสำหรับอัปเดตโปรไฟล์ของ User ที่ login อยู่
exports.updateMyProfile = async (req, res) => {
    try {
        const updates = {};
        // รับค่า firstName, lastName จาก body (ถ้ามี)
        if (req.body.firstName) updates.firstName = req.body.firstName;
        if (req.body.lastName) updates.lastName = req.body.lastName;

        // อัปโหลดรูปใหม่ (ถ้ามี)
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'event-ticketing/user_profiles'
            });
            updates.profileImage = result.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('UPDATE PROFILE ERROR:', error);
        res.status(500).json({ status: 'fail', message: 'Error updating profile.' });
    }
};

// Admin: Update a user's role
exports.updateUserRole = async (req, res) => {
    try {
        // ป้องกันไม่ให้ Admin เปลี่ยน Role ของ Admin คนอื่น หรือของตัวเอง
        const userToUpdate = await User.findById(req.params.id);
        if (userToUpdate.role === 'admin') {
            return res.status(403).json({ status: 'fail', message: 'Admins cannot change other admins roles.' });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Error updating user role.' });
    }
};

// Admin: Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
             return res.status(404).json({ status: 'fail', message: 'No user found with that ID.' });
        }
        if (userToDelete.role === 'admin') {
            return res.status(403).json({ status: 'fail', message: 'Cannot delete an admin account.' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Error deleting user.' });
    }
};