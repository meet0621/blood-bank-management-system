require('dotenv').config();
const mongoose = require('mongoose');
const BloodBank = require('./models/BloodBank');
const Donor = require('./models/Donor');
const Patient = require('./models/Patient');
const Blood = require('./models/Blood');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Camp = require('./models/Camp');
const Hospital = require('./models/Hospital');
const BloodTransfer = require('./models/BloodTransfer');
const AuditLog = require('./models/AuditLog');

/**
 * Seed script to populate database with initial data
 * Includes users, component-aware inventory, and blood units with expiry tracking
 */
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await BloodBank.deleteMany({});
        await Donor.deleteMany({});
        await Patient.deleteMany({});
        await Blood.deleteMany({});
        await Appointment.deleteMany({});
        await Camp.deleteMany({});
        await Hospital.deleteMany({});
        await BloodTransfer.deleteMany({});
        await AuditLog.deleteMany({});
        console.log('🗑️  Existing data cleared');

        // Create default users (passwords are hashed by the pre-save hook)
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@bloodbank.com',
                password: 'admin123',
                role: 'Admin',
            },
            {
                name: 'Staff User',
                email: 'staff@bloodbank.com',
                password: 'staff123',
                role: 'Staff',
            },
            {
                name: 'Rajesh Kumar',
                email: 'donor@bloodbank.com',
                password: 'donor123',
                role: 'Donor',
            },
        ]);
        console.log('👤 3 Users created (Admin, Staff, Donor)');

        // Create Blood Bank with component-aware inventory
        const components = ['Whole Blood', 'Packed RBCs', 'Fresh Frozen Plasma', 'Platelets', 'Cryoprecipitate'];
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        const inventoryItems = [];
        for (const bg of bloodGroups) {
            for (const comp of components) {
                inventoryItems.push({
                    bloodGroup: bg,
                    component: comp,
                    quantity: comp === 'Whole Blood' ? 10 : 5,
                });
            }
        }

        const bloodBank = await BloodBank.create({
            bankId: 'BNK0001',
            name: 'City Blood Bank',
            location: 'Chennai',
            inventory: inventoryItems,
        });
        console.log('🏦 Blood Bank created with component inventory');

        // Create 15 donors (link first donor to the Donor user)
        const donors = await Donor.create([
            // Existing 5
            { donorId: 'DNR0001', name: 'Rajesh Kumar', age: 28, gender: 'Male', bloodGroup: 'A+', address: '123 Anna Nagar, Chennai', contact: '9876543210', dateOfDonation: new Date('2024-01-15') },
            { donorId: 'DNR0002', name: 'Priya Sharma', age: 32, gender: 'Female', bloodGroup: 'B+', address: '456 T Nagar, Chennai', contact: '9876543211', dateOfDonation: new Date('2024-02-10') },
            { donorId: 'DNR0003', name: 'Amit Patel', age: 25, gender: 'Male', bloodGroup: 'O+', address: '789 Adyar, Chennai', contact: '9876543212', dateOfDonation: new Date('2024-02-12') },
            { donorId: 'DNR0004', name: 'Sneha Reddy', age: 30, gender: 'Female', bloodGroup: 'AB+', address: '321 Velachery, Chennai', contact: '9876543213', dateOfDonation: new Date('2024-02-14') },
            { donorId: 'DNR0005', name: 'Vijay Krishna', age: 35, gender: 'Male', bloodGroup: 'A-', address: '654 Mylapore, Chennai', contact: '9876543214', dateOfDonation: new Date('2024-02-16') },

            // New 10
            { donorId: 'DNR0006', name: 'Anjali Menon', age: 27, gender: 'Female', bloodGroup: 'O-', address: '12 Besant Nagar, Chennai', contact: '9876543215', dateOfDonation: new Date('2024-02-18') },
            { donorId: 'DNR0007', name: 'Karthik Raja', age: 40, gender: 'Male', bloodGroup: 'B-', address: '88 Kodambakkam, Chennai', contact: '9876543216', dateOfDonation: new Date('2024-02-20') },
            { donorId: 'DNR0008', name: 'Deepa Lakshmi', age: 29, gender: 'Female', bloodGroup: 'AB-', address: '45 Chromepet, Chennai', contact: '9876543217', dateOfDonation: new Date('2024-02-22') },
            { donorId: 'DNR0009', name: 'Suresh Babu', age: 45, gender: 'Male', bloodGroup: 'O+', address: '23 Tambaram, Chennai', contact: '9876543218', dateOfDonation: new Date('2024-02-24') },
            { donorId: 'DNR0010', name: 'Meera Iyer', age: 33, gender: 'Female', bloodGroup: 'A+', address: '67 Alwarpet, Chennai', contact: '9876543219', dateOfDonation: new Date('2024-02-25') },
            { donorId: 'DNR0011', name: 'Rahul Dravid', age: 38, gender: 'Male', bloodGroup: 'B+', address: '90 Vadapalani, Chennai', contact: '9876543220', dateOfDonation: new Date('2024-02-26') },
            { donorId: 'DNR0012', name: 'Divya Spandana', age: 26, gender: 'Female', bloodGroup: 'O+', address: '34 Porur, Chennai', contact: '9876543221', dateOfDonation: new Date('2024-02-27') },
            { donorId: 'DNR0013', name: 'Vikram Singh', age: 31, gender: 'Male', bloodGroup: 'AB+', address: '56 Guindy, Chennai', contact: '9876543222', dateOfDonation: new Date('2024-02-28') },
            { donorId: 'DNR0014', name: 'Lakshmi Narayanan', age: 50, gender: 'Female', bloodGroup: 'A-', address: '78 Egmore, Chennai', contact: '9876543223', dateOfDonation: new Date('2024-03-01') },
            { donorId: 'DNR0015', name: 'Arun Kumar', age: 24, gender: 'Male', bloodGroup: 'B-', address: '12 Triplicane, Chennai', contact: '9876543224', dateOfDonation: new Date('2024-03-02') },
        ]);
        console.log('👥 15 Donors created');

        // Link donor user to donor record
        const donorUser = users.find(u => u.role === 'Donor');
        const donorRecord = donors.find(d => d.name === 'Rajesh Kumar');
        if (donorUser && donorRecord) {
            donorUser.donorId = donorRecord._id;
            await donorUser.save();
            console.log('🔗 Donor user linked to donor record');
        }

        // Create blood units with various expiry dates
        const now = new Date();
        const bloodUnits = [
            // Units expiring soon (within 3 days)
            { bloodId: 'BLD0001', bloodGroup: 'A+', componentType: 'Platelets', quantity: 1, collectedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), donorId: donors[0]._id },
            { bloodId: 'BLD0002', bloodGroup: 'B+', componentType: 'Platelets', quantity: 1, collectedDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), donorId: donors[1]._id },
            // Units expiring in ~7 days
            { bloodId: 'BLD0003', bloodGroup: 'O+', componentType: 'Whole Blood', quantity: 1, collectedDate: new Date(now.getTime() - 36 * 24 * 60 * 60 * 1000), donorId: donors[2]._id },
            // Already expired unit
            { bloodId: 'BLD0004', bloodGroup: 'AB+', componentType: 'Platelets', quantity: 1, collectedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), donorId: donors[3]._id },
            // Valid units with long shelf life
            { bloodId: 'BLD0005', bloodGroup: 'A-', componentType: 'Fresh Frozen Plasma', quantity: 1, collectedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), donorId: donors[4]._id },
            { bloodId: 'BLD0006', bloodGroup: 'A+', componentType: 'Packed RBCs', quantity: 1, collectedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), donorId: donors[0]._id },
            { bloodId: 'BLD0007', bloodGroup: 'B+', componentType: 'Whole Blood', quantity: 1, collectedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), donorId: donors[1]._id },
            { bloodId: 'BLD0008', bloodGroup: 'O+', componentType: 'Cryoprecipitate', quantity: 1, collectedDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), donorId: donors[2]._id },
        ];

        await Blood.create(bloodUnits);
        console.log('🩸 8 Blood units created (mix of valid, expiring, and expired)');

        // Create 3 patients
        const patients = await Patient.create([
            {
                patientId: 'PAT0001',
                name: 'Karthik Subramaniam',
                gender: 'Male',
                bloodGroup: 'A+',
                contact: '9876543220',
                component: 'Whole Blood',
                requestStatus: 'Pending',
                source: 'Staff',
            },
            {
                patientId: 'PAT0002',
                name: 'Lakshmi Iyer',
                gender: 'Female',
                bloodGroup: 'B-',
                contact: '9876543221',
                component: 'Packed RBCs',
                requestStatus: 'Pending',
                source: 'Staff',
            },
            {
                patientId: 'PAT0003',
                name: 'Mohammed Ali',
                gender: 'Male',
                bloodGroup: 'O+',
                contact: '9876543222',
                component: 'Whole Blood',
                requestStatus: 'Pending',
                source: 'Staff',
            },
        ]);
        console.log('🏥 3 Patients created');

        // Create sample appointments
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

        const appointments = await Appointment.create([
            { appointmentId: 'APT0001', donorId: donors[0]._id, date: today, timeSlot: '09:00-10:00', status: 'Scheduled', notes: 'First-time donor checkup' },
            { appointmentId: 'APT0002', donorId: donors[1]._id, date: today, timeSlot: '11:00-12:00', status: 'Scheduled' },
            { appointmentId: 'APT0003', donorId: donors[2]._id, date: tomorrow, timeSlot: '10:00-11:00', status: 'Scheduled' },
            { appointmentId: 'APT0004', donorId: donors[3]._id, date: nextWeek, timeSlot: '14:00-15:00', status: 'Scheduled', notes: 'Regular donor' },
        ]);
        console.log('📅 4 Appointments created');

        // Create sample camps
        const campDate1 = new Date(today); campDate1.setDate(campDate1.getDate() + 14);
        const campDate2 = new Date(today); campDate2.setDate(campDate2.getDate() - 30);

        const camps = await Camp.create([
            {
                campId: 'CMP0001',
                campName: 'Red Cross Blood Drive 2024',
                location: 'Anna University, Chennai',
                organizerName: 'Red Cross Society',
                date: campDate1,
                targetUnits: 100,
                status: 'Upcoming',
            },
            {
                campId: 'CMP0002',
                campName: 'IT Park Donation Camp',
                location: 'Tidel Park, Chennai',
                organizerName: 'Rotary Club',
                date: campDate2,
                targetUnits: 150,
                actualUnitsCollected: 120,
                status: 'Completed',
            },
        ]);
        console.log('🏕️  2 Camps created');

        // Create sample hospitals (Hospital model requires explicit hospitalId if no pre-save hook, but let's be safe)
        const hospitals = await Hospital.create([
            {
                hospitalId: 'HOSP001',
                name: 'City General Hospital',
                location: 'Central Chennai',
                contact: '044-24567890',
                email: 'contact@citygeneral.com',
                type: 'Government',
                status: 'Active',
            },
            {
                hospitalId: 'HOSP002',
                name: 'Apollo Speciality',
                location: 'Greams Road',
                contact: '044-23456789',
                email: 'info@apollo.com',
                type: 'Private',
                status: 'Active',
            },
        ]);
        console.log('🏥 2 Hospitals created');

        // ── Blood Transfers ──
        const transfers = await BloodTransfer.create([
            {
                transferId: 'TRF0001',
                fromHospital: hospitals[0]._id,
                toHospital: hospitals[1]._id,
                bloodGroup: 'O-',
                component: 'Packed RBCs',
                units: 3,
                status: 'Approved',
                requestedBy: 'Dr. Reddy',
            },
            {
                transferId: 'TRF0002',
                fromHospital: hospitals[1]._id,
                toHospital: hospitals[0]._id,
                bloodGroup: 'B+',
                component: 'Platelets',
                units: 2,
                status: 'Delivered',
                requestedBy: 'Dr. Patel',
            },
        ]);
        console.log('🔄 3 Transfers created');

        console.log('\n✨ Database seeded successfully!');
        console.log('📊 Summary:');
        console.log(`   - Users: ${users.length} (Admin, Staff, Donor)`);
        console.log(`   - Blood Bank: ${bloodBank.name} (${bloodBank.location})`);
        console.log(`   - Donors: ${donors.length}`);
        console.log(`   - Patients: ${patients.length}`);
        console.log(`   - Blood Units: 8 (with varied expiry dates)`);
        console.log(`   - Inventory Items: ${inventoryItems.length} (${bloodGroups.length} groups × ${components.length} components)`);
        console.log(`   - Appointments: ${appointments.length}`);
        console.log(`   - Camps: ${camps.length}`);
        console.log(`   - Hospitals: ${hospitals.length}`);
        console.log(`   - Transfers: ${transfers.length}`);
        console.log('\n🔑 Login Credentials:');
        console.log('   Admin: admin@bloodbank.com / admin123');
        console.log('   Staff: staff@bloodbank.com / staff123');
        console.log('   Donor: donor@bloodbank.com / donor123\n');

        // Create sample audit log entries
        const adminUser = users.find(u => u.role === 'Admin');
        await AuditLog.create([
            { action: 'CREATE', entity: 'Donor', description: 'Created donor: Rajesh Kumar', performedBy: adminUser._id, performedByName: 'Admin User' },
            { action: 'CREATE', entity: 'Donor', description: 'Created donor: Priya Sharma', performedBy: adminUser._id, performedByName: 'Admin User' },
            { action: 'CREATE', entity: 'Patient', description: 'Created patient: Amit Verma', performedBy: adminUser._id, performedByName: 'Admin User' },
            { action: 'BLOOD_REQUEST', entity: 'Patient', description: 'Blood request processed for Amit Verma', performedBy: adminUser._id, performedByName: 'Admin User' },
            { action: 'CREATE', entity: 'Transfer', description: 'Created blood transfer to City Hospital', performedBy: adminUser._id, performedByName: 'Admin User' },
            { action: 'APPROVE', entity: 'Transfer', description: 'Approved blood transfer to City Hospital', performedBy: adminUser._id, performedByName: 'Admin User' },
            { action: 'FLAG_EXPIRED', entity: 'BloodUnit', description: 'Flagged 3 expired blood units', performedByName: 'System' },
            { action: 'CREATE', entity: 'Appointment', description: 'Created appointment for Rajesh Kumar', performedBy: adminUser._id, performedByName: 'Admin User' },
            { action: 'UPDATE', entity: 'Inventory', description: 'Updated inventory: A+ Whole Blood', performedBy: adminUser._id, performedByName: 'Admin User' },
            { action: 'DELETE', entity: 'Donor', description: 'Deleted donor (ID: DNR0099)', performedBy: adminUser._id, performedByName: 'Admin User' },
        ]);
        console.log('📝 10 Audit log entries created');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed
seedDatabase();
