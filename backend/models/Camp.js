const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
    campId: {
        type: String,
        unique: true,
    },
    campName: {
        type: String,
        required: [true, 'Camp name is required'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    organizerName: {
        type: String,
        required: [true, 'Organizer name is required'],
        trim: true,
    },
    date: {
        type: Date,
        required: [true, 'Camp date is required'],
    },
    targetUnits: {
        type: Number,
        required: [true, 'Target units is required'],
        min: 1,
    },
    actualUnitsCollected: {
        type: Number,
        default: 0,
        min: 0,
    },
    donorIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
    }],
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed'],
        default: 'Upcoming',
    },
}, { timestamps: true });

// Auto-generate campId (using timestamp + random for uniqueness)
campSchema.pre('save', async function (next) {
    if (!this.campId) {
        const timestamp = Date.now().toString(36);
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        this.campId = `CMP${timestamp}${randomSuffix}`.toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Camp', campSchema);
