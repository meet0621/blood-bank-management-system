const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllCamps,
    getCampById,
    createCamp,
    updateCamp,
    deleteCamp,
    addDonorToCamp,
    getCampReport,
} = require('../controllers/campController');

// All camp routes require auth + Admin/Staff
router.use(protect, authorize('Admin', 'Staff'));

// Report route (before /:id to avoid conflict)
router.get('/report/summary', getCampReport);

router.route('/')
    .get(getAllCamps)
    .post(createCamp);

router.route('/:id')
    .get(getCampById)
    .put(updateCamp)
    .delete(deleteCamp);

router.post('/:id/add-donor', addDonorToCamp);

module.exports = router;
