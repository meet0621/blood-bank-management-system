const Donor = require('../models/Donor');
const Patient = require('../models/Patient');
const Blood = require('../models/Blood');
const BloodBank = require('../models/BloodBank');

/**
 * Get inventory report
 * @route GET /api/reports/inventory
 */
exports.getInventoryReport = async (req, res, next) => {
    try {
        const bloodBank = await BloodBank.findOne();

        if (!bloodBank) {
            res.status(404);
            throw new Error('Blood Bank not found');
        }

        // Calculate total units
        const totalUnits = bloodBank.inventory.reduce((sum, item) => sum + item.quantity, 0);

        // Get expiry stats
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const expiringCount = await Blood.countDocuments({
            status: 'Available',
            expiryDate: { $gte: now, $lte: sevenDaysLater },
        });

        const expiredCount = await Blood.countDocuments({
            status: 'Available',
            expiryDate: { $lt: now },
        });

        res.status(200).json({
            success: true,
            data: {
                bloodBank: bloodBank.name,
                location: bloodBank.location,
                inventory: bloodBank.inventory,
                totalUnits,
                expiringCount,
                expiredCount,
            },
            message: 'Inventory report generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get donations report
 * @route GET /api/reports/donations
 */
exports.getDonationsReport = async (req, res, next) => {
    try {
        const donors = await Donor.find().sort({ dateOfDonation: -1 });

        // Group donations by blood group
        const donationsByBloodGroup = donors.reduce((acc, donor) => {
            const bloodGroup = donor.bloodGroup;
            if (!acc[bloodGroup]) {
                acc[bloodGroup] = 0;
            }
            acc[bloodGroup]++;
            return acc;
        }, {});

        // Convert to array format
        const donationsArray = Object.entries(donationsByBloodGroup).map(([bloodGroup, count]) => ({
            bloodGroup,
            count,
        }));

        res.status(200).json({
            success: true,
            data: {
                totalDonors: donors.length,
                donationsByBloodGroup: donationsArray,
                recentDonations: donors.slice(0, 10), // Last 10 donations
            },
            message: 'Donations report generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get dashboard statistics
 * @route GET /api/reports/dashboard
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalDonors = await Donor.countDocuments();
        const totalPatients = await Patient.countDocuments();

        const bloodBank = await BloodBank.findOne();
        const totalBloodUnits = bloodBank
            ? bloodBank.inventory.reduce((sum, item) => sum + item.quantity, 0)
            : 0;

        // Recent donations (last 5)
        const recentDonations = await Donor.find()
            .sort({ dateOfDonation: -1 })
            .limit(5)
            .select('name bloodGroup dateOfDonation');

        // Expiry stats
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const expiringCount = await Blood.countDocuments({
            status: 'Available',
            expiryDate: { $gte: now, $lte: sevenDaysLater },
        });

        const expiredCount = await Blood.countDocuments({
            status: 'Available',
            expiryDate: { $lt: now },
        });

        res.status(200).json({
            success: true,
            data: {
                totalDonors,
                totalPatients,
                totalBloodUnits,
                recentDonations,
                inventory: bloodBank ? bloodBank.inventory : [],
                expiringCount,
                expiredCount,
            },
            message: 'Dashboard statistics retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get advanced analytics data
 * @route GET /api/reports/analytics
 */
exports.getAnalytics = async (req, res, next) => {
    try {
        const bloodBank = await BloodBank.findOne();
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        // ── Demand vs Supply ──
        const supplyMap = {};
        if (bloodBank) {
            bloodBank.inventory.forEach(item => {
                supplyMap[item.bloodGroup] = (supplyMap[item.bloodGroup] || 0) + item.quantity;
            });
        }

        const patients = await Patient.find();
        const demandMap = {};
        patients.forEach(p => {
            demandMap[p.bloodGroup] = (demandMap[p.bloodGroup] || 0) + 1;
        });

        const demandVsSupply = bloodGroups.map(bg => ({
            bloodGroup: bg,
            supply: supplyMap[bg] || 0,
            demand: demandMap[bg] || 0,
            gap: (supplyMap[bg] || 0) - (demandMap[bg] || 0),
        }));

        // ── Donation Trends (last 6 months) ──
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const donors = await Donor.find({ dateOfDonation: { $gte: sixMonthsAgo } });

        const monthLabels = [];
        const monthCounts = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            monthLabels.push(label);
            const count = donors.filter(dn => {
                const dd = new Date(dn.dateOfDonation);
                return dd.getMonth() === d.getMonth() && dd.getFullYear() === d.getFullYear();
            }).length;
            monthCounts.push(count);
        }

        const donationTrends = { labels: monthLabels, data: monthCounts };

        // ── Blood Group Heatmap (monthly × blood group) ──
        const heatmapData = bloodGroups.map(bg => {
            const counts = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const count = donors.filter(dn => {
                    const dd = new Date(dn.dateOfDonation);
                    return dd.getMonth() === d.getMonth() && dd.getFullYear() === d.getFullYear() && dn.bloodGroup === bg;
                }).length;
                counts.push(count);
            }
            return { bloodGroup: bg, data: counts };
        });

        res.status(200).json({
            success: true,
            data: { demandVsSupply, donationTrends, heatmapData, monthLabels },
            message: 'Analytics data generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Export PDF report
 * @route GET /api/reports/export/pdf
 */
exports.exportPDF = async (req, res, next) => {
    try {
        const PDFDocument = require('pdfkit');
        const bloodBank = await BloodBank.findOne();
        const totalDonors = await Donor.countDocuments();
        const totalPatients = await Patient.countDocuments();

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=blood_bank_report.pdf');
        doc.pipe(res);

        // ── Header ──
        doc.fontSize(22).fillColor('#C41E3A').text('Blood Bank Report', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#666').text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, { align: 'center' });
        doc.moveDown(1);

        // ── Summary ──
        doc.fontSize(14).fillColor('#1A1A2E').text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#333');
        doc.text(`Blood Bank: ${bloodBank ? bloodBank.name : 'N/A'}`);
        doc.text(`Location: ${bloodBank ? bloodBank.location : 'N/A'}`);
        doc.text(`Total Donors: ${totalDonors}`);
        doc.text(`Total Patients: ${totalPatients}`);

        const totalUnits = bloodBank ? bloodBank.inventory.reduce((s, i) => s + i.quantity, 0) : 0;
        doc.text(`Total Blood Units: ${totalUnits}`);
        doc.moveDown(1);

        // ── Inventory Table ──
        doc.fontSize(14).fillColor('#1A1A2E').text('Inventory Overview', { underline: true });
        doc.moveDown(0.5);

        if (bloodBank && bloodBank.inventory.length > 0) {
            const tableTop = doc.y;
            const col1 = 50, col2 = 200, col3 = 350;

            doc.fontSize(10).fillColor('#FFF');
            doc.rect(col1, tableTop, 450, 20).fill('#C41E3A');
            doc.fillColor('#FFF');
            doc.text('Blood Group', col1 + 10, tableTop + 5, { width: 140 });
            doc.text('Quantity (Units)', col2 + 10, tableTop + 5, { width: 140 });
            doc.text('Status', col3 + 10, tableTop + 5, { width: 140 });

            let rowY = tableTop + 22;
            bloodBank.inventory.forEach((item, i) => {
                const bgColor = i % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
                doc.rect(col1, rowY, 450, 18).fill(bgColor);
                doc.fillColor('#333').fontSize(10);
                doc.text(item.bloodGroup, col1 + 10, rowY + 4, { width: 140 });
                doc.text(`${item.quantity}`, col2 + 10, rowY + 4, { width: 140 });
                const status = item.quantity >= 10 ? 'Adequate' : item.quantity >= 5 ? 'Low' : 'Critical';
                doc.text(status, col3 + 10, rowY + 4, { width: 140 });
                rowY += 18;
            });
        }

        doc.moveDown(2);

        // ── Expiry Stats ──
        const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const expiringCount = await Blood.countDocuments({ status: 'Available', expiryDate: { $gte: new Date(), $lte: sevenDaysLater } });
        const expiredCount = await Blood.countDocuments({ status: 'Available', expiryDate: { $lt: new Date() } });

        doc.fontSize(14).fillColor('#1A1A2E').text('Expiry Status', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#333');
        doc.text(`Expiring within 7 days: ${expiringCount}`);
        doc.text(`Already expired: ${expiredCount}`);
        doc.moveDown(2);

        doc.fontSize(8).fillColor('#999').text('Blood Bank Management System — Confidential Report', 50, 760, { align: 'center' });

        doc.end();
    } catch (error) {
        next(error);
    }
};

/**
 * Export Excel report
 * @route GET /api/reports/export/excel
 */
exports.exportExcel = async (req, res, next) => {
    try {
        const ExcelJS = require('exceljs');
        const bloodBank = await BloodBank.findOne();
        const donors = await Donor.find().sort({ dateOfDonation: -1 });
        const patients = await Patient.find();

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Blood Bank System';
        workbook.created = new Date();

        // ── Sheet 1: Inventory ──
        const invSheet = workbook.addWorksheet('Inventory');
        invSheet.columns = [
            { header: 'Blood Group', key: 'bloodGroup', width: 15 },
            { header: 'Quantity', key: 'quantity', width: 12 },
            { header: 'Status', key: 'status', width: 15 },
        ];
        invSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        invSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC41E3A' } };

        if (bloodBank) {
            bloodBank.inventory.forEach(item => {
                const status = item.quantity >= 10 ? 'Adequate' : item.quantity >= 5 ? 'Low' : 'Critical';
                invSheet.addRow({ bloodGroup: item.bloodGroup, quantity: item.quantity, status });
            });
        }

        // ── Sheet 2: Donors ──
        const donorSheet = workbook.addWorksheet('Donors');
        donorSheet.columns = [
            { header: 'Donor ID', key: 'donorId', width: 12 },
            { header: 'Name', key: 'name', width: 22 },
            { header: 'Blood Group', key: 'bloodGroup', width: 14 },
            { header: 'Gender', key: 'gender', width: 10 },
            { header: 'Contact', key: 'contact', width: 15 },
            { header: 'Date of Donation', key: 'dateOfDonation', width: 18 },
        ];
        donorSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        donorSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC41E3A' } };

        donors.forEach(d => {
            donorSheet.addRow({
                donorId: d.donorId,
                name: d.name,
                bloodGroup: d.bloodGroup,
                gender: d.gender,
                contact: d.contact,
                dateOfDonation: d.dateOfDonation ? new Date(d.dateOfDonation).toLocaleDateString() : '',
            });
        });

        // ── Sheet 3: Patients ──
        const patientSheet = workbook.addWorksheet('Patients');
        patientSheet.columns = [
            { header: 'Patient ID', key: 'patientId', width: 12 },
            { header: 'Name', key: 'name', width: 22 },
            { header: 'Blood Group', key: 'bloodGroup', width: 14 },
            { header: 'Component', key: 'component', width: 18 },
            { header: 'Status', key: 'requestStatus', width: 12 },
            { header: 'Source', key: 'source', width: 10 },
        ];
        patientSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        patientSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC41E3A' } };

        patients.forEach(p => {
            patientSheet.addRow({
                patientId: p.patientId,
                name: p.name,
                bloodGroup: p.bloodGroup,
                component: p.component || 'Whole Blood',
                requestStatus: p.requestStatus,
                source: p.source,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=blood_bank_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};
