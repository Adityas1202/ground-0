const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'medical_portal_secret_key_2023';
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file
async function initializeData() {
    try {
        await fs.access(DATA_FILE);
        console.log('Data file exists');
    } catch (error) {
        // File doesn't exist, create it with sample data
        const initialData = {
            patients: [
                {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    password: "$2a$10$r3C4V5n6s7t8u9v0w1x2yOcQdReSfTgUhViWjXkYlZmAnBoCpDqE",
                    dob: "1990-01-15",
                    phone: "123-456-7890",
                    createdAt: new Date().toISOString()
                }
            ],
            doctors: [
                {
                    id: 1,
                    name: "Dr. Sarah Johnson",
                    email: "sarah@medical.com",
                    password: "$2a$10$r3C4V5n6s7t8u9v0w1x2yOcQdReSfTgUhViWjXkYlZmAnBoCpDqE",
                    license: "MD123456",
                    specialty: "Cardiology",
                    hospital: "City General Hospital",
                    isVerified: true,
                    createdAt: new Date().toISOString()
                }
            ],
            appointments: []
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('Created data file with sample data');
    }
}

// Read data from file
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return { patients: [], doctors: [], appointments: [] };
    }
}

// Write data to file
async function writeData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data file:', error);
        return false;
    }
}

// Hash password function
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Compare password function
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Routes

// Patient Signup
app.post('/api/auth/patients/signup', async (req, res) => {
    try {
        const { name, email, password, dob, phone } = req.body;
        
        const data = await readData();
        
        // Check if patient already exists
        if (data.patients.find(p => p.email === email)) {
            return res.status(400).json({ message: 'Patient already exists with this email' });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create new patient
        const newPatient = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword,
            dob,
            phone,
            createdAt: new Date().toISOString()
        };
        
        data.patients.push(newPatient);
        await writeData(data);
        
        // Generate JWT token
        const token = jwt.sign(
            { id: newPatient.id, userType: 'patient' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'Patient created successfully',
            token,
            user: {
                id: newPatient.id,
                name: newPatient.name,
                email: newPatient.email,
                userType: 'patient'
            }
        });
    } catch (error) {
        console.error('Patient signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Patient Login
app.post('/api/auth/patients/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const data = await readData();
        
        // Find patient
        const patient = data.patients.find(p => p.email === email);
        if (!patient) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await comparePassword(password, patient.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: patient.id, userType: 'patient' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: patient.id,
                name: patient.name,
                email: patient.email,
                userType: 'patient'
            }
        });
    } catch (error) {
        console.error('Patient login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Doctor Signup
app.post('/api/auth/doctors/signup', async (req, res) => {
    try {
        const { name, email, password, license, specialty, hospital } = req.body;
        
        const data = await readData();
        
        // Check if doctor already exists
        if (data.doctors.find(d => d.email === email)) {
            return res.status(400).json({ message: 'Doctor already exists with this email' });
        }
        
        // Check if license number is already registered
        if (data.doctors.find(d => d.license === license)) {
            return res.status(400).json({ message: 'License number already registered' });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create new doctor
        const newDoctor = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword,
            license,
            specialty,
            hospital,
            isVerified: false,
            createdAt: new Date().toISOString()
        };
        
        data.doctors.push(newDoctor);
        await writeData(data);
        
        // Generate JWT token
        const token = jwt.sign(
            { id: newDoctor.id, userType: 'doctor' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'Doctor created successfully',
            token,
            user: {
                id: newDoctor.id,
                name: newDoctor.name,
                email: newDoctor.email,
                specialty: newDoctor.specialty,
                userType: 'doctor'
            }
        });
    } catch (error) {
        console.error('Doctor signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Doctor Login
app.post('/api/auth/doctors/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const data = await readData();
        
        // Find doctor
        const doctor = data.doctors.find(d => d.email === email);
        if (!doctor) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await comparePassword(password, doctor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: doctor.id, userType: 'doctor' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
                specialty: doctor.specialty,
                userType: 'doctor'
            }
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all doctors (for patients to browse)
app.get('/api/doctors', async (req, res) => {
    try {
        const data = await readData();
        const doctors = data.doctors.map(doctor => {
            const { password, ...doctorWithoutPassword } = doctor;
            return doctorWithoutPassword;
        });
        res.json(doctors);
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const { patientId, doctorId, date, time, reason } = req.body;
        
        const data = await readData();
        
        // Find patient and doctor
        const patient = data.patients.find(p => p.id === patientId);
        const doctor = data.doctors.find(d => d.id === doctorId);
        
        if (!patient || !doctor) {
            return res.status(404).json({ message: 'Patient or doctor not found' });
        }
        
        // Create new appointment
        const newAppointment = {
            id: Date.now(),
            patientId,
            doctorId,
            patientName: patient.name,
            doctorName: doctor.name,
            date,
            time,
            reason: reason || 'General consultation',
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };
        
        data.appointments.push(newAppointment);
        await writeData(data);
        
        res.status(201).json({
            message: 'Appointment scheduled successfully',
            appointment: newAppointment
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get patient appointments
app.get('/api/patients/:id/appointments', async (req, res) => {
    try {
        const patientId = parseInt(req.params.id);
        const data = await readData();
        
        const appointments = data.appointments.filter(a => a.patientId === patientId);
        res.json(appointments);
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get doctor appointments
app.get('/api/doctors/:id/appointments', async (req, res) => {
    try {
        const doctorId = parseInt(req.params.id);
        const data = await readData();
        
        const appointments = data.appointments.filter(a => a.doctorId === doctorId);
        res.json(appointments);
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Initialize and start server
async function startServer() {
    await initializeData();
    
    app.listen(PORT, () => {
        console.log(`Medical portal server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
        console.log(`Home page: http://localhost:${PORT}`);
        console.log('Sample patient: john@example.com / patient123');
        console.log('Sample doctor: sarah@medical.com / doctor123');
    });
}

startServer().catch(console.error);