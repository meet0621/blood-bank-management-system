const Camp = require('../models/Camp');
const Donor = require('../models/Donor');

/**
 * @desc    Get all camps (with optional status filter)
 * @route   GET /api/camps
 */
const getAllCamps = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const camps = await Camp.find(filter)
            .populate('donorIds', 'name bloodGroup donorId')
            .sort({ date: -1 });

        res.json({ success: true, count: camps.length, data: camps });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get camp by ID
 * @route   GET /api/camps/:id
 */
const getCampById = async (req, res, next) => {
    try {
        const camp = await Camp.findById(req.params.id)
            .populate('donorIds', 'name bloodGroup contact donorId');

        if (!camp) {
            return res.status(404).json({ success: false, message: 'Camp not found' });
        }

        res.json({ success: true, data: camp });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a camp
 * @route   POST /api/camps
 */
const createCamp = async (req, res, next) => {
    try {
        const camp = await Camp.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Camp created successfully',
            data: camp,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a camp
 * @route   PUT /api/camps/:id
 */
const updateCamp = async (req, res, next) => {
    try {
        const camp = await Camp.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('donorIds', 'name bloodGroup donorId');

        if (!camp) {
            return res.status(404).json({ success: false, message: 'Camp not found' });
        }

        res.json({ success: true, message: 'Camp updated', data: camp });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a camp
 * @route   DELETE /api/camps/:id
 */
const deleteCamp = async (req, res, next) => {
    try {
        const camp = await Camp.findByIdAndDelete(req.params.id);
        if (!camp) {
            return res.status(404).json({ success: false, message: 'Camp not found' });
        }

        res.json({ success: true, message: 'Camp deleted', data: null });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a donor to a camp
 * @route   POST /api/camps/:id/add-donor
 */
const addDonorToCamp = async (req, res, next) => {
    try {
        const { donorId } = req.body;
        const camp = await Camp.findById(req.params.id);

        if (!camp) {
            return res.status(404).json({ success: false, message: 'Camp not found' });
        }

        // Verify donor exists
        const donor = await Donor.findById(donorId);
        if (!donor) {
            return res.status(404).json({ success: false, message: 'Donor not found' });
        }

        // Check if donor already added
        if (camp.donorIds.includes(donorId)) {
            return res.status(400).json({ success: false, message: 'Donor already added to this camp' });
        }

        camp.donorIds.push(donorId);
        camp.actualUnitsCollected += 1;
        await camp.save();

        const populated = await camp.populate('donorIds', 'name bloodGroup donorId');

        res.json({ success: true, message: 'Donor added to camp', data: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get camp report summary
 * @route   GET /api/camps/report/summary
 */
const getCampReport = async (req, res, next) => {
    try {
        const camps = await Camp.find().sort({ date: -1 });

        const report = {
            totalCamps: camps.length,
            totalTargetUnits: camps.reduce((sum, c) => sum + c.targetUnits, 0),
            totalCollected: camps.reduce((sum, c) => sum + c.actualUnitsCollected, 0),
            upcoming: camps.filter(c => c.status === 'Upcoming').length,
            ongoing: camps.filter(c => c.status === 'Ongoing').length,
            completed: camps.filter(c => c.status === 'Completed').length,
            camps: camps.map(c => ({
                campName: c.campName,
                date: c.date,
                targetUnits: c.targetUnits,
                actualUnitsCollected: c.actualUnitsCollected,
                status: c.status,
                donorCount: c.donorIds.length,
            })),
        };

        res.json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCamps,
    getCampById,
    createCamp,
    updateCamp,
    deleteCamp,
    addDonorToCamp,
    getCampReport,
};
