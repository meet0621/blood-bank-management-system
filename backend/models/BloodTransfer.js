const mongoose = require('mongoose');

/**
 * Blood Transfer Schema
 * Tracks inter-hospital blood unit transfers
 */
const bloodTransferSchema = new mongoose.Schema({
    transferId: {
        type: String,
        unique: true,
    },
    fromHospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Source hospital is required'],
    },
    toHospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Destination hospital is required'],
    },
    bloodGroup: {
        type: String,
        required: [true, 'Blood group is required'],
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    component: {
        type: String,
        enum: ['Whole Blood', 'Packed RBCs', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate'],
        default: 'Whole Blood',
    },
    units: {
        type: Number,
        required: [true, 'Number of units is required'],
        min: 1,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'In Transit', 'Delivered', 'Rejected'],
        default: 'Pending',
    },
    requestedBy: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Auto-generate transferId (using timestamp + random for uniqueness)
bloodTransferSchema.pre('save', async function (next) {
    if (!this.transferId) {
        const timestamp = Date.now().toString(36);
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        this.transferId = `TRF${timestamp}${randomSuffix}`.toUpperCase();
    }
    next();
});

module.exports = mongoose.model('BloodTransfer', bloodTransferSchema);
