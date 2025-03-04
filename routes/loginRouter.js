const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const path = require('path');

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Change this to your actual MySQL password
    database: 'ElectronicsShop' // Change to your actual database name
});

// Connect to database
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Serve login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard', 'index.html'));
});

// Handle login POST request
// Handle login POST request
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Query to check user credentials and get role
    const query = `SELECT id, username, role FROM users WHERE username = ? AND password = ?`;
    
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        
        const user = results[0];

        // ✅ Correct session storage
        req.session.user = {
            userId: user.id,
            username: user.username,
            role: user.role
        };
        
        res.json({ success: true, role: user.role, message: 'Login successful' });
    });
});

// Serve role-specific dashboards
router.get('/owner-dashboard', (req, res) => {
    // Check if user is logged in and has Owner role
    if (!req.session || req.session.role !== 'Owner') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public/dashboard/index.html'));
});

router.get('/accountant-dashboard', (req, res) => {
    // Check if user is logged in and has Accountant role
    if (!req.session || req.session.role !== 'Accountant') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public', 'accountant-dashboard.html'));
});

router.get('/stock-manager-dashboard', (req, res) => {
    // Check if user is logged in and has Stock Manager role
    if (!req.session || req.session.role !== 'Stock Manager') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public', 'stock-manager-dashboard.html'));
});

router.get('/showroom-manager-dashboard', (req, res) => {
    // Check if user is logged in and has Stock Manager role
    if (!req.session || req.session.role !== 'showroom Manager') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public', 'showroom-manager-dashboard.html'));
});

router.get('/cashier-dashboard', (req, res) => {
    // Check if user is logged in and has Stock Manager role
    if (!req.session || req.session.role !== 'Cashier') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public', 'Cashier-dashboard.html'));
});

// Logout route
router.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

module.exports = router;