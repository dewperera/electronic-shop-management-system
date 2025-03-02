const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();
const bcrypt = require('bcrypt');


// Register Endpoint
router.post('/register', async (req, res) => {
    const { cus_name, cus_email, password, cus_tel } = req.body;

    // Validate required fields
    if (!cus_name || !cus_email || !password || !cus_tel) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if email already exists
        const checkQuery = 'SELECT cus_email FROM customer WHERE cus_email = ?';
        const checkResult = await new Promise((resolve, reject) => {
            dbConnection().query(checkQuery, [cus_email], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (checkResult.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new customer
        const insertQuery = 'INSERT INTO customer (cus_name, cus_email, cus_tel, password, cus_type) VALUES (?, ?, ?, ?, ?)';
        await new Promise((resolve, reject) => {
            dbConnection().query(insertQuery, [cus_name, cus_email, cus_tel, hashedPassword, 'Online'], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Login Endpoint
router.post('/login', (req, res) => {
    const { cus_email, password } = req.body;

    if (!cus_email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM customer WHERE cus_email = ? AND cus_type = "Online"';
    dbConnection().query(query, [cus_email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', user });
    });
});


module.exports = router;