const Donor = require('../models/Donor');
const Blood = require('../models/Blood');
const Appointment = require('../models/Appointment');
const PDFDocument = require('pdfkit');

/**
 * Get donor profile (for logged-in donor)
 * @route GET /api/donor-portal/profile
 */
exports.getDonorProfile = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.donorId) {
            res.status(400);
            throw new Error('No donor profile linked to this account');
        }

        const donor = await Donor.findById(user.donorId);
        if (!donor) {
            res.status(404);
            throw new Error('Donor profile not found');
        }

        // Get donation stats
        const bloodUnits = await Blood.find({ donorId: donor._id });
        const totalDonations = bloodUnits.length;
        const livesSaved = totalDonations * 3; // Each donation can save up to 3 lives

        res.status(200).json({
            success: true,
            data: {
                donor,
                stats: { totalDonations, livesSaved, bloodGroup: donor.bloodGroup },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get donation history for logged-in donor
 * @route GET /api/donor-portal/history
 */
exports.getDonationHistory = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.donorId) {
            res.status(400);
            throw new Error('No donor profile linked');
        }

        const bloodUnits = await Blood.find({ donorId: user.donorId }).sort({ collectedDate: -1 });

        res.status(200).json({ success: true, data: bloodUnits });
    } catch (error) {
        next(error);
    }
};

/**
 * Get donor's appointments
 * @route GET /api/donor-portal/appointments
 */
exports.getDonorAppointments = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.donorId) {
            res.status(400);
            throw new Error('No donor profile linked');
        }

        const appointments = await Appointment.find({ donorId: user.donorId }).sort({ date: -1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        next(error);
    }
};

/**
 * Book appointment from donor portal
 * @route POST /api/donor-portal/appointments
 */
exports.bookAppointment = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.donorId) {
            res.status(400);
            throw new Error('No donor profile linked');
        }

        const appointment = await Appointment.create({
            donorId: user.donorId,
            date: req.body.date,
            timeSlot: req.body.timeSlot,
            notes: req.body.notes || '',
            status: 'Scheduled',
        });

        res.status(201).json({ success: true, data: appointment, message: 'Appointment booked successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate donation certificate PDF
 * @route GET /api/donor-portal/certificate/:donationId
 */
exports.getDonationCertificate = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.donorId) {
            res.status(400);
            throw new Error('No donor profile linked');
        }

        const donor = await Donor.findById(user.donorId);
        if (!donor) {
            res.status(404);
            throw new Error('Donor not found');
        }

        const bloodUnit = await Blood.findById(req.params.donationId);
        if (!bloodUnit || String(bloodUnit.donorId) !== String(user.donorId)) {
            res.status(404);
            throw new Error('Donation record not found');
        }

        // Generate PDF certificate
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=donation_certificate_${donor.donorId}.pdf`);
        doc.pipe(res);

        // Border
        doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#C41E3A');
        doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke('#C41E3A');

        // Header
        doc.fontSize(28).fillColor('#C41E3A').font('Helvetica-Bold').text('CERTIFICATE OF BLOOD DONATION', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor('#555').font('Helvetica').text('Blood Bank Management System', { align: 'center' });

        // Divider
        doc.moveDown(1);
        doc.moveTo(100, doc.y).lineTo(doc.page.width - 100, doc.y).stroke('#C41E3A');
        doc.moveDown(1);

        // Body
        doc.fontSize(14).fillColor('#333').font('Helvetica');
        doc.text('This is to certify that', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(22).fillColor('#C41E3A').font('Helvetica-Bold').text(donor.name, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor('#333').font('Helvetica');
        doc.text('has generously donated blood on', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(16).font('Helvetica-Bold').text(
            new Date(bloodUnit.collectedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
            { align: 'center' }
        );

        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica').fillColor('#555');
        doc.text(`Donor ID: ${donor.donorId}     |     Blood Group: ${donor.bloodGroup}     |     Component: ${bloodUnit.componentType}`, { align: 'center' });

        doc.moveDown(2);
        doc.fontSize(12).fillColor('#333').font('Helvetica-Oblique');
        doc.text('"Every drop counts. Thank you for saving lives."', { align: 'center' });

        doc.moveDown(2);
        doc.fontSize(10).fillColor('#888').font('Helvetica');
        doc.text(`Certificate generated on ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });

        doc.end();
    } catch (error) {
        next(error);
    }
};
