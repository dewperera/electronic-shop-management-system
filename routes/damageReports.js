const express = require('express');
const router = express.Router();
const dbConnection = require('../dbConnection');

// --------------------------
// 1. Submit Damage Report
// --------------------------
router.post('/', (req, res) => {
    const { product_id, product_name, quantity, issue_type, description } = req.body;

    if (!product_id || !product_name || !quantity || !issue_type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        INSERT INTO damage_reports (product_id, product_name, quantity, issue_type, description)
        VALUES (?, ?, ?, ?, ?)
    `;
    dbConnection().query(query, [product_id, product_name, quantity, issue_type, description], (err, result) => {
        if (err) {
            console.error('Error submitting damage report:', err);
            return res.status(500).json({ message: 'Error submitting damage report', error: err.message });
        }
        res.status(201).json({ message: 'Damage report submitted successfully', report_id: result.insertId });
    });
});

// --------------------------
// 2. Fetch All Damage Reports
// --------------------------
router.get('/', (req, res) => {
    const query = 'SELECT * FROM damage_reports';
    dbConnection().query(query, (err, result) => {
        if (err) {
            console.error('Error fetching damage reports:', err);
            return res.status(500).json({ message: 'Error fetching damage reports', error: err.message });
        }
        res.status(200).json(result);
    });
});

module.exports = router;