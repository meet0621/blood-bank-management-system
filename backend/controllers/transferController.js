const BloodTransfer = require('../models/BloodTransfer');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');

/**
 * Get all transfers
 * @route GET /api/transfers
 */
exports.getAllTransfers = async (req, res, next) => {
    try {
        const transfers = await BloodTransfer.find()
            .populate('fromHospital', 'name location type')
            .populate('toHospital', 'name location type')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: transfers.length, data: transfers });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single transfer
 * @route GET /api/transfers/:id
 */
exports.getTransfer = async (req, res, next) => {
    try {
        const transfer = await BloodTransfer.findById(req.params.id)
            .populate('fromHospital', 'name location type contact')
            .populate('toHospital', 'name location type contact');

        if (!transfer) {
            res.status(404);
            throw new Error('Transfer not found');
        }

        res.status(200).json({ success: true, data: transfer });
    } catch (error) {
        next(error);
    }
};

/**
 * Create transfer request
 * @route POST /api/transfers
 */
exports.createTransfer = async (req, res, next) => {
    try {
        const transfer = await BloodTransfer.create(req.body);
        const populated = await BloodTransfer.findById(transfer._id)
            .populate('fromHospital', 'name location type')
            .populate('toHospital', 'name location type');

        res.status(201).json({ success: true, data: populated, message: 'Transfer request created' });
    } catch (error) {
        next(error);
    }
};

/**
 * Update transfer
 * @route PUT /api/transfers/:id
 */
exports.updateTransfer = async (req, res, next) => {
    try {
        const transfer = await BloodTransfer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('fromHospital', 'name location type')
            .populate('toHospital', 'name location type');

        if (!transfer) {
            res.status(404);
            throw new Error('Transfer not found');
        }

        res.status(200).json({ success: true, data: transfer, message: 'Transfer updated' });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete transfer
 * @route DELETE /api/transfers/:id
 */
exports.deleteTransfer = async (req, res, next) => {
    try {
        const transfer = await BloodTransfer.findByIdAndDelete(req.params.id);
        if (!transfer) {
            res.status(404);
            throw new Error('Transfer not found');
        }
        res.status(200).json({ success: true, data: {}, message: 'Transfer deleted' });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve transfer — decrements inventory for the blood group
 * @route PUT /api/transfers/:id/approve
 */
exports.approveTransfer = async (req, res, next) => {
    try {
        const transfer = await BloodTransfer.findById(req.params.id);
        if (!transfer) {
            res.status(404);
            throw new Error('Transfer not found');
        }

        if (transfer.status !== 'Pending') {
            res.status(400);
            throw new Error('Only pending transfers can be approved');
        }

        // Decrement inventory
        const bloodBank = await BloodBank.findOne();
        if (bloodBank) {
            const inventoryItem = bloodBank.inventory.find(i => i.bloodGroup === transfer.bloodGroup);
            if (inventoryItem) {
                if (inventoryItem.quantity < transfer.units) {
                    res.status(400);
                    throw new Error(`Insufficient inventory. Available: ${inventoryItem.quantity}, Requested: ${transfer.units}`);
                }
                inventoryItem.quantity -= transfer.units;
                await bloodBank.save();
            } else {
                res.status(400);
                throw new Error(`No inventory found for blood group ${transfer.bloodGroup}`);
            }
        }

        transfer.status = 'Approved';
        await transfer.save();

        const populated = await BloodTransfer.findById(transfer._id)
            .populate('fromHospital', 'name location type')
            .populate('toHospital', 'name location type');

        res.status(200).json({ success: true, data: populated, message: 'Transfer approved. Inventory updated.' });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject transfer
 * @route PUT /api/transfers/:id/reject
 */
exports.rejectTransfer = async (req, res, next) => {
    try {
        const transfer = await BloodTransfer.findById(req.params.id);
        if (!transfer) {
            res.status(404);
            throw new Error('Transfer not found');
        }

        if (transfer.status !== 'Pending') {
            res.status(400);
            throw new Error('Only pending transfers can be rejected');
        }

        transfer.status = 'Rejected';
        transfer.notes = req.body.notes || transfer.notes;
        await transfer.save();

        const populated = await BloodTransfer.findById(transfer._id)
            .populate('fromHospital', 'name location type')
            .populate('toHospital', 'name location type');

        res.status(200).json({ success: true, data: populated, message: 'Transfer rejected' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get pending transfers
 * @route GET /api/transfers/pending
 */
exports.getPendingTransfers = async (req, res, next) => {
    try {
        const transfers = await BloodTransfer.find({ status: 'Pending' })
            .populate('fromHospital', 'name location type')
            .populate('toHospital', 'name location type')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: transfers.length, data: transfers });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all hospitals
 * @route GET /api/transfers/hospitals
 */
exports.getHospitals = async (req, res, next) => {
    try {
        const hospitals = await Hospital.find({ status: 'Active' }).sort({ name: 1 });
        res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        next(error);
    }
};
