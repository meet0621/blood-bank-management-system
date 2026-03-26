const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const audit = require('../middleware/auditMiddleware');
const {
    getAllPatients,
    getPatientById,
    createPatient,
    createPublicRequest,
    updatePatient,
    deletePatient,
    requestBlood,
} = require('../controllers/patientController');

// Public request route (no auth required)
router.post('/public-request', audit('CREATE', 'Patient'), createPublicRequest);

// All other patient routes require auth + Admin/Staff
router.use(protect, authorize('Admin', 'Staff'));

router.route('/')
    .get(getAllPatients)
    .post(audit('CREATE', 'Patient'), createPatient);

router.route('/:id')
    .get(getPatientById)
    .put(audit('UPDATE', 'Patient'), updatePatient)
    .delete(audit('DELETE', 'Patient'), deletePatient);

// Blood request route
router.post('/:id/request-blood', audit('BLOOD_REQUEST', 'Patient'), requestBlood);

module.exports = router;
