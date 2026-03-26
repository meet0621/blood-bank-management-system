const AuditLog = require('../models/AuditLog');

/**
 * Audit middleware factory
 * Creates audit log entries for API actions and emits Socket.io events
 *
 * Usage: router.post('/', auditMiddleware('CREATE', 'Donor'), createDonor);
 * Must be placed AFTER auth middleware so req.user is available
 */
const auditMiddleware = (action, entity) => {
    return async (req, res, next) => {
        // Store original json method to intercept response
        const originalJson = res.json.bind(res);

        res.json = function (body) {
            // Only log successful operations
            if (body && body.success !== false && res.statusCode < 400) {
                const logEntry = {
                    action,
                    entity,
                    entityId: body.data?._id || body.data?.donorId || body.data?.patientId || req.params.id || '',
                    description: buildDescription(action, entity, body, req),
                    performedBy: req.user?._id,
                    performedByName: req.user?.name || 'System',
                    metadata: {
                        method: req.method,
                        path: req.originalUrl,
                        statusCode: res.statusCode,
                    },
                    ipAddress: req.ip || req.connection?.remoteAddress,
                };

                // Fire-and-forget audit log creation
                AuditLog.create(logEntry).catch(err => console.error('Audit log error:', err));

                // Emit Socket.io event
                const io = req.app.get('io');
                if (io) {
                    io.emit('audit', {
                        action,
                        entity,
                        description: logEntry.description,
                        performedBy: logEntry.performedByName,
                        timestamp: new Date(),
                    });

                    // Emit entity-specific events for dashboard refresh
                    if (entity === 'Donor') io.emit('donor:change', { action });
                    if (entity === 'Patient') io.emit('patient:change', { action });
                    if (entity === 'Inventory' || entity === 'BloodUnit') io.emit('inventory:change', { action });
                    if (entity === 'Transfer') io.emit('transfer:change', { action });
                    if (entity === 'Appointment') io.emit('appointment:change', { action });
                    if (entity === 'Camp') io.emit('camp:change', { action });
                }
            }

            return originalJson(body);
        };

        next();
    };
};

/**
 * Build human-readable description
 */
function buildDescription(action, entity, body, req) {
    const name = body.data?.name || body.data?.donorId || body.data?.patientId || '';
    switch (action) {
        case 'CREATE':
            return `Created ${entity.toLowerCase()}${name ? ': ' + name : ''}`;
        case 'UPDATE':
            return `Updated ${entity.toLowerCase()}${name ? ': ' + name : ''}`;
        case 'DELETE':
            return `Deleted ${entity.toLowerCase()} (ID: ${req.params.id || 'unknown'})`;
        case 'APPROVE':
            return `Approved ${entity.toLowerCase()} request${name ? ': ' + name : ''}`;
        case 'REJECT':
            return `Rejected ${entity.toLowerCase()} request`;
        case 'BLOOD_REQUEST':
            return `Blood request processed for ${name || 'patient'}`;
        case 'TRANSFER':
            return `Blood transfer processed`;
        case 'FLAG_EXPIRED':
            return `Flagged expired blood units`;
        default:
            return `${action} on ${entity}`;
    }
}

module.exports = auditMiddleware;
