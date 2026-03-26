const mongoose = require('mongoose');

/**
 * Hospital Schema
 */
const hospitalSchema = new mongoose.Schema({
    hospitalId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide hospital name'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Please provide location'],
    },
    contact: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        enum: ['Government', 'Private', 'Clinic'],
        default: 'Government',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Hospital', hospitalSchema);
