const mongoose = require('mongoose');

/**
 * Audit Log Schema
 * Tracks all significant actions in the system
 */
const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE', 'UPDATE', 'DELETE',
            'APPROVE', 'REJECT',
            'LOGIN', 'REGISTER',
            'BLOOD_REQUEST', 'TRANSFER',
            'FLAG_EXPIRED',
        ],
    },
    entity: {
        type: String,
        required: true,
        enum: ['Donor', 'Patient', 'BloodUnit', 'Inventory', 'Appointment', 'Camp', 'Transfer', 'User', 'System'],
    },
    entityId: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    performedByName: {
        type: String,
        default: 'System',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
        type: String,
    },
}, {
    timestamps: true,
});

// Index for efficient queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entity: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
