const express = require('express');
const router = express.Router();
const dbConnection = require('../dbConnection');

// --------------------------
// 1. Submit Restock Request
// --------------------------
router.post('/', (req, res) => {
    const { product_id, product_name, current_quantity, requested_quantity, priority } = req.body;

    if (!product_id || !product_name || !current_quantity || !requested_quantity) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        INSERT INTO restock_requests (product_id, product_name, current_quantity, requested_quantity, priority)
        VALUES (?, ?, ?, ?, ?)
    `;
    dbConnection().query(query, [product_id, product_name, current_quantity, requested_quantity, priority], (err, result) => {
        if (err) {
            console.error('Error submitting restock request:', err);
            return res.status(500).json({ message: 'Error submitting restock request', error: err.message });
        }
        res.status(201).json({ message: 'Restock request submitted successfully', request_id: result.insertId });
    });
});

// --------------------------
// 2. Fetch All Restock Requests
// --------------------------
router.get('/', (req, res) => {
    const query = 'SELECT * FROM restock_requests';
    dbConnection().query(query, (err, result) => {
        if (err) {
            console.error('Error fetching restock requests:', err);
            return res.status(500).json({ message: 'Error fetching restock requests', error: err.message });
        }
        res.status(200).json(result);
    });
});

module.exports = router;