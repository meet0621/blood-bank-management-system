require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const bloodBankRoutes = require('./routes/bloodBankRoutes');
const reportRoutes = require('./routes/reportRoutes');
const expiryRoutes = require('./routes/expiryRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const campRoutes = require('./routes/campRoutes');
const transferRoutes = require('./routes/transferRoutes');
const donorPortalRoutes = require('./routes/donorPortalRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io accessible to routes via req.app
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:4200', // Angular dev server
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);         // Auth (public: login/register)
app.use('/api/donors', donorRoutes);       // Protected: Admin, Staff
app.use('/api/patients', patientRoutes);   // Protected (except /public-request)
app.use('/api/bloodbank', bloodBankRoutes); // Protected: Admin, Staff
app.use('/api/reports', reportRoutes);     // Protected: Admin, Staff
app.use('/api/expiry', expiryRoutes);      // Protected: Admin, Staff
app.use('/api/appointments', appointmentRoutes); // Protected: Admin, Staff
app.use('/api/camps', campRoutes);         // Protected: Admin, Staff
app.use('/api/transfers', transferRoutes); // Protected: Admin, Staff
app.use('/api/donor-portal', donorPortalRoutes); // Protected: Donor
app.use('/api/audit', auditRoutes);       // Protected: Admin

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🩸 Blood Bank Management System API',
        version: '3.0.0',
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    // Serve frontend static files
    app.use(express.static(path.join(__dirname, '../frontend/dist/frontend/browser')));

    // Handle SPA routing
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/dist/frontend/browser', 'index.html'));
    });
}

// Start server (use `server.listen` for Socket.io)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.io ready`);
});

module.exports = app;
