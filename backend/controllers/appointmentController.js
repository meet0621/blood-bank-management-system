const Appointment = require('../models/Appointment');
const Donor = require('../models/Donor');

// Available time slots
const TIME_SLOTS = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00',
];

/**
 * @desc    Get all appointments (with optional date/status filter)
 * @route   GET /api/appointments
 */
const getAllAppointments = async (req, res, next) => {
    try {
        const { date, status, donorId } = req.query;
        const filter = {};

        if (date) {
            const d = new Date(date);
            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));
            filter.date = { $gte: start, $lte: end };
        }
        if (status) filter.status = status;
        if (donorId) filter.donorId = donorId;

        const appointments = await Appointment.find(filter)
            .populate('donorId', 'name bloodGroup contact donorId')
            .sort({ date: 1, timeSlot: 1 });

        res.json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get today's appointments
 * @route   GET /api/appointments/today
 */
const getTodaysAppointments = async (req, res, next) => {
    try {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));

        const appointments = await Appointment.find({
            date: { $gte: start, $lte: end },
        })
            .populate('donorId', 'name bloodGroup contact donorId')
            .sort({ timeSlot: 1 });

        res.json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get available time slots for a date
 * @route   GET /api/appointments/slots?date=
 */
const getAvailableSlots = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        const d = new Date(date);
        const start = new Date(d.setHours(0, 0, 0, 0));
        const end = new Date(d.setHours(23, 59, 59, 999));

        // Find booked slots for that date
        const booked = await Appointment.find({
            date: { $gte: start, $lte: end },
            status: { $ne: 'Cancelled' },
        }).select('timeSlot');

        const bookedSlots = booked.map(a => a.timeSlot);
        const maxPerSlot = 5; // Allow up to 5 appointments per slot

        const slots = TIME_SLOTS.map(slot => {
            const count = bookedSlots.filter(b => b === slot).length;
            return {
                slot,
                booked: count,
                available: maxPerSlot - count,
                isFull: count >= maxPerSlot,
            };
        });

        res.json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create an appointment
 * @route   POST /api/appointments
 */
const createAppointment = async (req, res, next) => {
    try {
        const { donorId, date, timeSlot, notes } = req.body;

        // Verify donor exists
        const donor = await Donor.findById(donorId);
        if (!donor) {
            return res.status(404).json({ success: false, message: 'Donor not found' });
        }

        const appointment = await Appointment.create({ donorId, date, timeSlot, notes });
        const populated = await appointment.populate('donorId', 'name bloodGroup contact donorId');

        res.status(201).json({
            success: true,
            message: 'Appointment scheduled successfully',
            data: populated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update an appointment (status, reschedule)
 * @route   PUT /api/appointments/:id
 */
const updateAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('donorId', 'name bloodGroup contact donorId');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, message: 'Appointment updated', data: appointment });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete an appointment
 * @route   DELETE /api/appointments/:id
 */
const deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, message: 'Appointment deleted', data: null });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllAppointments,
    getTodaysAppointments,
    getAvailableSlots,
    createAppointment,
    updateAppointment,
    deleteAppointment,
};
