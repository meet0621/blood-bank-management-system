const Blood = require('../models/Blood');
const BloodBank = require('../models/BloodBank');

/**
 * Get units expiring within N days
 * @route GET /api/expiry/expiring?days=7
 */
exports.getExpiringUnits = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const expiringUnits = await Blood.find({
            status: 'Available',
            expiryDate: { $gte: now, $lte: futureDate },
        })
            .populate('donorId', 'name donorId')
            .sort({ expiryDate: 1 });

        res.status(200).json({
            success: true,
            data: expiringUnits,
            message: `Found ${expiringUnits.length} units expiring within ${days} days`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get already expired units
 * @route GET /api/expiry/expired
 */
exports.getExpiredUnits = async (req, res, next) => {
    try {
        const expiredUnits = await Blood.find({
            status: 'Available',
            expiryDate: { $lt: new Date() },
        })
            .populate('donorId', 'name donorId')
            .sort({ expiryDate: 1 });

        res.status(200).json({
            success: true,
            data: expiredUnits,
            message: `Found ${expiredUnits.length} expired units`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Flag expired units — marks them as 'Expired' and decrements inventory
 * @route POST /api/expiry/flag-expired
 */
exports.flagExpiredUnits = async (req, res, next) => {
    try {
        const now = new Date();

        // Find all available units that have expired
        const expiredUnits = await Blood.find({
            status: 'Available',
            expiryDate: { $lt: now },
        });

        if (expiredUnits.length === 0) {
            return res.status(200).json({
                success: true,
                data: { flaggedCount: 0 },
                message: 'No expired units found to flag',
            });
        }

        // Update all expired units
        const bloodBank = await BloodBank.findOne();

        for (const unit of expiredUnits) {
            unit.status = 'Expired';
            await unit.save();

            // Decrement inventory
            if (bloodBank) {
                const invItem = bloodBank.inventory.find(
                    item => item.bloodGroup === unit.bloodGroup && item.component === unit.componentType
                );
                if (invItem && invItem.quantity > 0) {
                    invItem.quantity -= unit.quantity;
                    if (invItem.quantity < 0) invItem.quantity = 0;
                }
            }
        }

        if (bloodBank) {
            await bloodBank.save();
        }

        res.status(200).json({
            success: true,
            data: { flaggedCount: expiredUnits.length },
            message: `${expiredUnits.length} expired units flagged and inventory updated`,
        });
    } catch (error) {
        next(error);
    }
};
