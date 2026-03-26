const mongoose = require('mongoose');

/**
 * RegistrationTeam Schema
 */
const registrationTeamSchema = new mongoose.Schema({
    teamId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide team name'],
        trim: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('RegistrationTeam', registrationTeamSchema);
