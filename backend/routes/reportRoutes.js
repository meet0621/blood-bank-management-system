const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getInventoryReport,
    getDonationsReport,
    getDashboardStats,
    getAnalytics,
    exportPDF,
    exportExcel,
} = require('../controllers/reportController');

// All report routes require auth + Admin/Staff
router.use(protect, authorize('Admin', 'Staff'));

router.get('/inventory', getInventoryReport);
router.get('/donations', getDonationsReport);
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/export/pdf', exportPDF);
router.get('/export/excel', exportExcel);

module.exports = router;
