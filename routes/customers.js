const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();
const bcrypt = require('bcrypt');

// --------------------------
// 1. Add Customer
// --------------------------
router.post('/', (req, res) => {
    const { cus_name, cus_email, password, cus_tel, cus_type, loyalty_status } = req.body;

    if (!cus_name || !cus_tel || !cus_type) {
        return res.status(400).json({ message: 'Name, phone, and type are required' });
    }

    // For online customers, email and password are required
    if (cus_type === 'Online' && (!cus_email || !password)) {
        return res.status(400).json({ message: 'Email and password are required for online customers' });
    }

    // For physical customers, email and password should be null
    let finalEmail = cus_email;
    let finalPassword = password;
    if (cus_type === 'Physical') {
        finalEmail = null;
        finalPassword = null;
    }

    const query = 'INSERT INTO customer (cus_name, cus_email, password, cus_tel, cus_type, loyalty_status) VALUES (?, ?, ?, ?, ?, ?)';
    dbConnection().query(query, [cus_name, finalEmail, finalPassword, cus_tel, cus_type, loyalty_status], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error adding customer', error: err.message });
        }

        res.status(201).json({ message: 'Customer added successfully' });
    });
});

// --------------------------
// 2. Fetch All Customers
// --------------------------
router.get('/', (req, res) => {
    const query = 'SELECT * FROM customer';
    dbConnection().query(query, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error fetching customers', error: err });

        res.status(200).json(result);
    });
});

// --------------------------
// 3. Search Customers by Phone
// --------------------------
router.get('/search', (req, res) => {
    const { phone } = req.query;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required for search' });
    }

    // Ensure the phone number is in a consistent format (e.g., remove spaces or special characters)
    const formattedPhone = phone.replace(/\D/g, ''); // Remove non-numeric characters

    const searchQuery = 'SELECT * FROM customer WHERE cus_tel LIKE ?';
    dbConnection().query(searchQuery, [`%${formattedPhone}%`], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error searching customers', error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'No customers found with the provided phone number' });
        }

        res.status(200).json(result);
    });
});
// --------------------------
// 4. Update Physical Customer
// --------------------------
router.put('/update-physical/:id', (req, res) => {
    const { id } = req.params;
    const { cus_name, cus_tel } = req.body;

    if (!cus_name || !cus_tel) {
        return res.status(400).json({ message: 'Name and phone are required' });
    }

    const checkQuery = 'SELECT * FROM customer WHERE cus_id = ? AND cus_type = ?';
    dbConnection().query(checkQuery, [id, 'Physical'], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error checking customer', error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Physical customer not found' });
        }

        const updateQuery = 'UPDATE customer SET cus_name = ?, cus_tel = ? WHERE cus_id = ?';
        dbConnection().query(updateQuery, [cus_name, cus_tel, id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Error updating customer', error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Customer not found or no changes made' });
            }

            res.status(200).json({ message: 'Physical customer updated successfully' });
        });
    });
});

// --------------------------
// 5. Delete Physical Customer
// --------------------------
router.delete('/delete-physical/:id', (req, res) => {
    const { id } = req.params;

    const checkQuery = 'SELECT * FROM customer WHERE cus_id = ? AND cus_type = ?';
    dbConnection().query(checkQuery, [id, 'Physical'], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error checking customer', error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Physical customer not found' });
        }

        const deleteQuery = 'DELETE FROM customer WHERE cus_id = ?';
        dbConnection().query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Error deleting customer', error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            res.status(200).json({ message: 'Physical customer deleted successfully' });
        });
    });
});

module.exports = router;