const AuditLog = require('../models/AuditLog');

/**
 * Get audit logs with filtering and pagination
 * @route GET /api/audit
 * @query entity, action, page, limit, search
 */
exports.getAuditLogs = async (req, res, next) => {
    try {
        const { entity, action, page = 1, limit = 25, search } = req.query;
        const query = {};

        if (entity) query.entity = entity;
        if (action) query.action = action;
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { performedByName: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get audit log stats
 * @route GET /api/audit/stats
 */
exports.getAuditStats = async (req, res, next) => {
    try {
        const total = await AuditLog.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await AuditLog.countDocuments({ createdAt: { $gte: today } });

        const byAction = await AuditLog.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const byEntity = await AuditLog.aggregate([
            { $group: { _id: '$entity', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.status(200).json({
            success: true,
            data: { total, todayCount, byAction, byEntity },
        });
    } catch (error) {
        next(error);
    }
};
