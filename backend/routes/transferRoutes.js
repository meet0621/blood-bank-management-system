const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const audit = require('../middleware/auditMiddleware');
const {
    getAllTransfers,
    getTransfer,
    createTransfer,
    updateTransfer,
    deleteTransfer,
    approveTransfer,
    rejectTransfer,
    getPendingTransfers,
    getHospitals,
} = require('../controllers/transferController');

// All transfer routes require auth + Admin/Staff
router.use(protect, authorize('Admin', 'Staff'));

router.get('/pending', getPendingTransfers);
router.get('/hospitals', getHospitals);
router.route('/').get(getAllTransfers).post(audit('CREATE', 'Transfer'), createTransfer);
router.route('/:id').get(getTransfer).put(audit('UPDATE', 'Transfer'), updateTransfer).delete(audit('DELETE', 'Transfer'), deleteTransfer);
router.put('/:id/approve', audit('APPROVE', 'Transfer'), approveTransfer);
router.put('/:id/reject', audit('REJECT', 'Transfer'), rejectTransfer);

module.exports = router;
