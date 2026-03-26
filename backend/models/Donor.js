const mongoose = require('mongoose');

/**
 * Donor Schema
 * Represents a blood donor in the system
 */
const donorSchema = new mongoose.Schema({
    donorId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide donor name'],
        trim: true,
    },
    age: {
        type: Number,
        required: [true, 'Please provide age'],
        min: [18, 'Donor must be at least 18 years old'],
        max: [65, 'Donor must be under 65 years old'],
    },
    gender: {
        type: String,
        required: [true, 'Please specify gender'],
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: '{VALUE} is not a valid gender',
        },
    },
    bloodGroup: {
        type: String,
        required: [true, 'Please specify blood group'],
        enum: {
            values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            message: '{VALUE} is not a valid blood group',
        },
    },
    address: {
        type: String,
        required: [true, 'Please provide address'],
    },
    contact: {
        type: String,
        required: [true, 'Please provide contact number'],
        match: [/^\d{10}$/, 'Please provide a valid 10-digit contact number'],
    },
    dateOfDonation: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Auto-generate donorId before saving (using timestamp + random for uniqueness)
donorSchema.pre('save', async function (next) {
    if (!this.donorId) {
        const timestamp = Date.now().toString(36);
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        this.donorId = `DNR${timestamp}${randomSuffix}`.toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Donor', donorSchema);
