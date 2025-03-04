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

// Serve register staff page (only for owners)
router.get('/register-staff', (req, res) => {
    // // Check if user is logged in and has Owner role
    // if (!req.session || req.session.role !== 'Owner') {
    //     return res.redirect('/login');
    // }
    // res.sendFile(path.join(__dirname, '../public', 'register-staff.html'));
});

// Handle register staff POST request
router.post('/register-staff', (req, res) => {
    // // Check if user is logged in and has Owner role
    // if (!req.session || req.session.role !== 'Owner') {
    //     console.log('Unauthorized access attempt'); // Debug unauthorized access
    //     return res.status(403).json({ success: false, message: 'Unauthorized access' });
    // }

    const { fullname, username, password, role, email, phone } = req.body;
    
    if (!fullname || !username || !password || !role || !email || !phone) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if username already exists
    const checkQuery = 'SELECT id FROM users WHERE username = ?';
    
    connection.query(checkQuery, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }
        
        // Insert new staff member
        const insertQuery = `
            INSERT INTO users (fullname, username, password, role, email, phone, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        connection.query(insertQuery, [
            fullname, 
            username, 
            password, 
            role, 
            email, 
            phone,
            req.session.userId // Store who created this user
        ], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            
            res.json({
                success: true,
                message: 'Staff member registered successfully'
            });
        });
    });
});

module.exports = router;