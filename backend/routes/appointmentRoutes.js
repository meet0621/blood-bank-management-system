const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllAppointments,
    getTodaysAppointments,
    getAvailableSlots,
    createAppointment,
    updateAppointment,
    deleteAppointment,
} = require('../controllers/appointmentController');

// All appointment routes require auth + Admin/Staff
router.use(protect, authorize('Admin', 'Staff'));

router.get('/today', getTodaysAppointments);
router.get('/slots', getAvailableSlots);

router.route('/')
    .get(getAllAppointments)
    .post(createAppointment);

router.route('/:id')
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
