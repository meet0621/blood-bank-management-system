const mongoose = require('mongoose');

/**
 * Shelf life constants (in days) for each blood component
 */
const SHELF_LIFE = {
    'Whole Blood': 42,
    'Packed RBCs': 42,
    'Fresh Frozen Plasma': 365,
    'Platelets': 5,
    'Cryoprecipitate': 365,
};

/**
 * Blood Schema
 * Represents individual blood units with component type and expiry tracking
 */
const bloodSchema = new mongoose.Schema({
    bloodId: {
        type: String,
        unique: true,
    },
    bloodGroup: {
        type: String,
        required: [true, 'Please specify blood group'],
        enum: {
            values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            message: '{VALUE} is not a valid blood group',
        },
    },
    componentType: {
        type: String,
        required: [true, 'Please specify component type'],
        enum: {
            values: ['Whole Blood', 'Packed RBCs', 'Fresh Frozen Plasma', 'Platelets', 'Cryoprecipitate'],
            message: '{VALUE} is not a valid component type',
        },
        default: 'Whole Blood',
    },
    quantity: {
        type: Number,
        required: [true, 'Please specify quantity'],
        min: [0, 'Quantity cannot be negative'],
        default: 1,
    },
    collectedDate: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: {
            values: ['Available', 'Expired', 'Used', 'Transferred'],
            message: '{VALUE} is not a valid status',
        },
        default: 'Available',
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
    },
}, {
    timestamps: true,
});

// Auto-compute expiryDate from collectedDate + shelf life before saving
bloodSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('collectedDate') || this.isModified('componentType')) {
        const shelfLifeDays = SHELF_LIFE[this.componentType] || 42;
        const collected = this.collectedDate || new Date();
        this.expiryDate = new Date(collected.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000);
    }
    next();
});

// Auto-generate bloodId before saving (using timestamp + random for uniqueness)
bloodSchema.pre('save', async function (next) {
    if (!this.bloodId) {
        // Use timestamp + random suffix to avoid race conditions
        const timestamp = Date.now().toString(36);
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        this.bloodId = `BLD${timestamp}${randomSuffix}`.toUpperCase();
    }
    next();
});

// Static: Get shelf life constants
bloodSchema.statics.SHELF_LIFE = SHELF_LIFE;

module.exports = mongoose.model('Blood', bloodSchema);
