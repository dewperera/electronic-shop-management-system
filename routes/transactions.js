const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();
const checkRole = require('../middleware/checkRoleMiddleware');

/*--------Transaction Routes--------*/
// Fetch all transactions (Owner only)
router.get('/', checkRole('owner'), (req, res) => {
    const query = 'SELECT * FROM transactions';
    dbConnection().query(query, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).send('Error fetching transactions');
        } else {
            res.json(results);
        }
    });
});

// Add a new transaction (Accountant only)
router.post('/', checkRole('accountant'), (req, res) => {
    const { date, description, amount, type } = req.body;
    const query = 'INSERT INTO transactions (date, description, amount, type) VALUES (?, ?, ?, ?)';
    dbConnection().query(query, [date, description, amount, type], (err, results) => {
        if (err) {
            console.error('Error adding transaction:', err);
            res.status(500).send('Error adding transaction');
        } else {
            res.status(201).send('Transaction added successfully');
        }
    });
});

// Update a transaction (Accountant only)
router.put('/:id', checkRole('accountant'), (req, res) => {
    const transaction_id = req.params.id;
    const { date, description, amount, type } = req.body;
    const query = 'UPDATE transactions SET date = ?, description = ?, amount = ?, type = ? WHERE transaction_id = ?';
    dbConnection().query(query, [date, description, amount, type, transaction_id], (err, results) => {
        if (err) {
            console.error('Error updating transaction:', err);
            res.status(500).send('Error updating transaction');
        } else {
            res.send('Transaction updated successfully');
        }
    });
});

// Delete a transaction (Accountant only)
router.delete('/:id', checkRole('accountant'), (req, res) => {
    const transaction_id = req.params.id;
    const query = 'DELETE FROM transactions WHERE transaction_id = ?';
    dbConnection().query(query, [transaction_id], (err, results) => {
        if (err) {
            console.error('Error deleting transaction:', err);
            res.status(500).send('Error deleting transaction');
        } else {
            res.send('Transaction deleted successfully');
        }
    });
});



module.exports = router;