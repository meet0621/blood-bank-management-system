const mongoose = require('mongoose');

/**
 * Manager Schema
 */
const managerSchema = new mongoose.Schema({
    managerId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide manager name'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Please provide location'],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Manager', managerSchema);
