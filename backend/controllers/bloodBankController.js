const BloodBank = require('../models/BloodBank');
const Blood = require('../models/Blood');

/**
 * Get blood bank inventory
 * @route GET /api/bloodbank/inventory
 */
exports.getInventory = async (req, res, next) => {
    try {
        const bloodBank = await BloodBank.findOne();

        if (!bloodBank) {
            res.status(404);
            throw new Error('Blood Bank not found');
        }

        res.status(200).json({
            success: true,
            data: bloodBank,
            message: 'Inventory retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get component-level inventory details
 * @route GET /api/bloodbank/component-inventory
 */
exports.getComponentInventory = async (req, res, next) => {
    try {
        const bloodBank = await BloodBank.findOne();

        if (!bloodBank) {
            res.status(404);
            throw new Error('Blood Bank not found');
        }

        // Group inventory by blood group with component breakdown
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const components = ['Whole Blood', 'Packed RBCs', 'Fresh Frozen Plasma', 'Platelets', 'Cryoprecipitate'];

        const grouped = bloodGroups.map(bg => {
            const groupItems = bloodBank.inventory.filter(i => i.bloodGroup === bg);
            const componentBreakdown = components.map(comp => {
                const item = groupItems.find(i => i.component === comp);
                return {
                    component: comp,
                    quantity: item ? item.quantity : 0,
                };
            });
            const totalQuantity = componentBreakdown.reduce((sum, c) => sum + c.quantity, 0);

            return {
                bloodGroup: bg,
                totalQuantity,
                components: componentBreakdown,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                bankName: bloodBank.name,
                location: bloodBank.location,
                inventory: grouped,
            },
            message: 'Component inventory retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update blood bank inventory
 * @route PUT /api/bloodbank/inventory
 */
exports.updateInventory = async (req, res, next) => {
    try {
        const { inventory } = req.body;

        const bloodBank = await BloodBank.findOne();

        if (!bloodBank) {
            res.status(404);
            throw new Error('Blood Bank not found');
        }

        bloodBank.inventory = inventory;
        await bloodBank.save();

        res.status(200).json({
            success: true,
            data: bloodBank,
            message: 'Inventory updated successfully',
        });
    } catch (error) {
        next(error);
    }
};
