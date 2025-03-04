const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const path = require('path');

// Create MySQL connection (same as in loginRouter.js)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'ElectronicsShop' 
});

// Serve reset password page (only for owners)
router.get('/reset-password', (req, res) => {
    // // Check if user is logged in and has Owner role
    // if (!req.session || req.session.role !== 'Owner') {
    //     return res.redirect('/login');
    // }
    // res.sendFile(path.join(__dirname, '../public', 'reset-password.html'));
});

// Handle reset password POST request
router.post('/reset-password', (req, res) => {
    // // Check if user is logged in and has Owner role
    // if (!req.session || req.session.role !== 'Owner') {
    //     return res.status(403).json({ success: false, message: 'Unauthorized access' });
    // }

    const { username, newPassword } = req.body;
    
    if (!username || !newPassword) {
        return res.status(400).json({ success: false, message: 'Username and new password are required' });
    }

    // Update user password in database
    const query = `
        UPDATE users 
        SET password = ? 
        WHERE username = ?
    `;
    
    connection.query(query, [newPassword, username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    });
});

module.exports = router;