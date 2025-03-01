const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();
const bcrypt = require('bcrypt');


// Register Endpoint
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if email already exists
        const checkQuery = 'SELECT email FROM users WHERE email = ?';
        dbConnection().query(checkQuery, [email], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (result.length > 0) {
                return res.status(400).json({ message: 'Email is already registered' });
            }

            // Hash the password before storing it
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert user into database
            const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            dbConnection().query(query, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Registration failed', error: err });
                }
                res.status(201).json({ message: 'Registration successful' });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Login Endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    dbConnection().query(query, [username], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = result[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful', user });
    });
});

module.exports = router;