const mongoose = require('mongoose');

/**
 * ClinicalAnalyst Schema
 */
const clinicalAnalystSchema = new mongoose.Schema({
    analystId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide analyst name'],
        trim: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ClinicalAnalyst', clinicalAnalystSchema);
