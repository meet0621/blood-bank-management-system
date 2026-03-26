const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getExpiringUnits,
    getExpiredUnits,
    flagExpiredUnits,
} = require('../controllers/expiryController');

// All expiry routes require auth + Admin/Staff
router.use(protect, authorize('Admin', 'Staff'));

router.get('/expiring', getExpiringUnits);
router.get('/expired', getExpiredUnits);
router.post('/flag-expired', flagExpiredUnits);

module.exports = router;
