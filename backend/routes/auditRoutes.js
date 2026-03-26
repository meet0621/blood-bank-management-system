const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAuditLogs, getAuditStats } = require('../controllers/auditController');

// All audit routes require Admin role
router.use(protect, authorize('Admin'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);

module.exports = router;
