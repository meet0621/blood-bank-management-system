const mongoose = require('mongoose');

/**
 * Patient Schema
 * Represents a patient requesting blood
 */
const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide patient name'],
        trim: true,
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
    component: {
        type: String,
        enum: {
            values: ['Whole Blood', 'Packed RBCs', 'Fresh Frozen Plasma', 'Platelets', 'Cryoprecipitate'],
            message: '{VALUE} is not a valid component',
        },
        default: 'Whole Blood',
    },
    contact: {
        type: String,
        required: [true, 'Please provide contact number'],
        match: [/^\d{10}$/, 'Please provide a valid 10-digit contact number'],
    },
    requestStatus: {
        type: String,
        default: 'Pending',
        enum: {
            values: ['Pending', 'Approved', 'Rejected'],
            message: '{VALUE} is not a valid request status',
        },
    },
    urgencyLevel: {
        type: String,
        enum: {
            values: ['Normal', 'Urgent', 'Critical'],
            message: '{VALUE} is not a valid urgency level',
        },
        default: 'Normal',
    },
    hospitalName: {
        type: String,
        trim: true,
    },
    source: {
        type: String,
        enum: {
            values: ['Staff', 'Public'],
            message: '{VALUE} is not a valid source',
        },
        default: 'Staff',
    },
    units: {
        type: Number,
        default: 1,
        min: [1, 'At least 1 unit must be requested'],
    },
}, {
    timestamps: true,
});

// Auto-generate patientId before saving (using timestamp + random for uniqueness)
patientSchema.pre('save', async function (next) {
    if (!this.patientId) {
        const timestamp = Date.now().toString(36);
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        this.patientId = `PAT${timestamp}${randomSuffix}`.toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Patient', patientSchema);
