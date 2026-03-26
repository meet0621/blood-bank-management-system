const Patient = require('../models/Patient');
const Blood = require('../models/Blood');
const BloodBank = require('../models/BloodBank');

/**
 * Get all patients with optional filtering
 * @route GET /api/patients
 * @query bloodGroup, search (name)
 */
exports.getAllPatients = async (req, res, next) => {
    try {
        const { bloodGroup, search } = req.query;

        let query = {};

        // Filter by blood group
        if (bloodGroup) {
            query.bloodGroup = bloodGroup;
        }

        // Search by name
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const patients = await Patient.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: patients,
            message: 'Patients retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single patient by ID
 * @route GET /api/patients/:id
 */
exports.getPatientById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        res.status(200).json({
            success: true,
            data: patient,
            message: 'Patient retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new patient
 * @route POST /api/patients
 */
exports.createPatient = async (req, res, next) => {
    try {
        const patient = await Patient.create(req.body);

        res.status(201).json({
            success: true,
            data: patient,
            message: 'Patient added successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a public blood request (no auth required)
 * @route POST /api/patients/public-request
 */
exports.createPublicRequest = async (req, res, next) => {
    try {
        const patientData = {
            ...req.body,
            source: 'Public',
            requestStatus: 'Pending',
        };
        const patient = await Patient.create(patientData);

        res.status(201).json({
            success: true,
            data: patient,
            message: 'Blood request submitted successfully. Our team will review it shortly.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a patient
 * @route PUT /api/patients/:id
 */
exports.updatePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        res.status(200).json({
            success: true,
            data: patient,
            message: 'Patient updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a patient
 * @route DELETE /api/patients/:id
 */
exports.deletePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        res.status(200).json({
            success: true,
            data: null,
            message: 'Patient deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Blood request logic
 * Supports requesting specific blood component
 * Uses oldest available (non-expired) blood unit first (FIFO)
 * If quantity > 0 → Approve & decrement inventory
 * If quantity == 0 → Reject with proper error message
 * @route POST /api/patients/:id/request-blood
 */
exports.requestBlood = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            res.status(404);
            throw new Error('Patient not found');
        }

        const component = req.body.component || patient.component || 'Whole Blood';

        // Find blood bank
        const bloodBank = await BloodBank.findOne();

        if (!bloodBank) {
            res.status(404);
            throw new Error('Blood Bank not found');
        }

        // Find the blood group + component in inventory
        const invItem = bloodBank.inventory.find(
            item => item.bloodGroup === patient.bloodGroup && item.component === component
        );

        if (!invItem) {
            // Try falling back to 'Whole Blood' if specific component not found
            const wholeBloodItem = bloodBank.inventory.find(
                item => item.bloodGroup === patient.bloodGroup && item.component === 'Whole Blood'
            );

            if (!wholeBloodItem || wholeBloodItem.quantity <= 0) {
                patient.requestStatus = 'Rejected';
                await patient.save();

                return res.status(200).json({
                    success: false,
                    data: patient,
                    message: `Blood request rejected. ${patient.bloodGroup} ${component} is currently unavailable.`,
                });
            }
        }

        const availableQuantity = invItem ? invItem.quantity : 0;

        // Business Logic: Check availability and update status
        if (availableQuantity > 0) {
            // Find the oldest available blood unit to mark as used
            const bloodUnit = await Blood.findOne({
                bloodGroup: patient.bloodGroup,
                componentType: component,
                status: 'Available',
                expiryDate: { $gt: new Date() },
            }).sort({ expiryDate: 1 });

            if (bloodUnit) {
                bloodUnit.status = 'Used';
                await bloodUnit.save();
            }

            // Approve request
            patient.requestStatus = 'Approved';
            patient.component = component;
            invItem.quantity -= 1;

            await patient.save();
            await bloodBank.save();

            res.status(200).json({
                success: true,
                data: patient,
                message: `Blood request approved. ${patient.bloodGroup} ${component} unit allocated.`,
            });
        } else {
            // Reject request
            patient.requestStatus = 'Rejected';
            await patient.save();

            res.status(200).json({
                success: false,
                data: patient,
                message: `Blood request rejected. ${patient.bloodGroup} ${component} is currently unavailable.`,
            });
        }
    } catch (error) {
        next(error);
    }
};
