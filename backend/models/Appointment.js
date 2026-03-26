const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        unique: true,
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
        required: [true, 'Donor is required'],
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required'],
        // e.g. "09:00-10:00"
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

// Auto-generate appointmentId (using timestamp + random for uniqueness)
appointmentSchema.pre('save', async function (next) {
    if (!this.appointmentId) {
        const timestamp = Date.now().toString(36);
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        this.appointmentId = `APT${timestamp}${randomSuffix}`.toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
