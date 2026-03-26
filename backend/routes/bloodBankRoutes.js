const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getInventory,
    getComponentInventory,
    updateInventory,
} = require('../controllers/bloodBankController');

// All blood bank routes require auth + Admin/Staff
router.use(protect, authorize('Admin', 'Staff'));

router.route('/inventory')
    .get(getInventory)
    .put(updateInventory);

router.get('/component-inventory', getComponentInventory);

module.exports = router;
