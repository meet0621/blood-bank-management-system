const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const audit = require('../middleware/auditMiddleware');
const {
    getAllDonors,
    getDonorById,
    createDonor,
    updateDonor,
    deleteDonor,
} = require('../controllers/donorController');

// All donor routes require authentication + Admin or Staff role
router.use(protect, authorize('Admin', 'Staff'));

// Donor routes
router.route('/')
    .get(getAllDonors)
    .post(audit('CREATE', 'Donor'), createDonor);

router.route('/:id')
    .get(getDonorById)
    .put(audit('UPDATE', 'Donor'), updateDonor)
    .delete(audit('DELETE', 'Donor'), deleteDonor);

module.exports = router;
