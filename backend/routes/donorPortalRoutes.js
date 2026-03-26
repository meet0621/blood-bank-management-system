const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getDonorProfile,
    getDonationHistory,
    getDonorAppointments,
    bookAppointment,
    getDonationCertificate,
} = require('../controllers/donorPortalController');

// All donor portal routes require auth + Donor role
router.use(protect, authorize('Donor'));

router.get('/profile', getDonorProfile);
router.get('/history', getDonationHistory);
router.get('/appointments', getDonorAppointments);
router.post('/appointments', bookAppointment);
router.get('/certificate/:donationId', getDonationCertificate);

module.exports = router;
