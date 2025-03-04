const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();

/*--------supplier Routes--------*/
// Fetch all suppliers
router.get('/', (req, res) => {
    const query = 'SELECT * FROM supplier';
    dbConnection().query(query, (err, results) => {
        if (err) {
            console.error('Error fetching suppliers:', err);
            res.status(500).send('Error fetching suppliers');
        } else {
            res.json(results);
        }
    });
});


// Add a new supplier
router.post('/', (req, res) => {
    const { sup_fname, sup_lname, sup_email, sup_tel, sup_address } = req.body;

    if (!sup_fname || !sup_lname || !sup_email || !sup_tel || !sup_address) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = 'INSERT INTO supplier ( sup_fname, sup_lname, sup_email, sup_tel, sup_address) VALUES (?, ?, ?, ?, ?)';

    dbConnection().query(query, [ sup_fname, sup_lname, sup_email, sup_tel, sup_address], (err, results) => {
        if (err) {
            console.error('Error adding supplier:', err);
            return res.status(500).json({ error: 'Error adding supplier' });
        }
        res.status(201).json({ message: 'supplier added successfully', supplierId: results.insertId });
    });
});


// Update an supplier
router.put('/:id', (req, res) => {
    const {sup_fname, sup_lname, sup_email, sup_tel, sup_address} = req.body;
    const sup_id = req.params.id;

    if (!sup_fname || !sup_lname || !sup_email || !sup_tel || !sup_address) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if supplier exists before updating
    dbConnection().query('SELECT * FROM supplier WHERE sup_id = ?', [sup_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'supplier not found' });
        }

        // Update the employee with the correct parameter array
        const query = 'UPDATE supplier SET sup_fname = ?, sup_lname = ?, sup_email = ?, sup_tel = ?, sup_address = ? WHERE sup_id = ?';
        dbConnection().query(query, [sup_fname, sup_lname, sup_email, sup_tel, sup_address, sup_id], (err, updateResults) => {
            if (err) {
                console.error('Error updating supplier:', err);
                return res.status(500).json({ error: 'Error updating supplier' });
            }
            res.json({ message: 'supplier updated successfully' });
        });
    });
});


// Delete an supplier
router.delete('/:id', (req, res) => {
    const sup_id = req.params.id; // Fix variable name

    const query = 'DELETE FROM supplier WHERE sup_id = ?';
    dbConnection().query(query, [sup_id], (err, results) => {
        if (err) {
            console.error('Error deleting supplier:', err);
            res.status(500).send('Error deleting supplier');
        } else {
            res.send('Supplier deleted successfully');
        }
    });
});


// Fetch a single supplier by ID
router.get('/:id', (req, res) => {
    const sup_id = req.params.id;
    const query = 'SELECT * FROM supplier WHERE sup_id = ?';
    dbConnection().query(query, [sup_id], (err, results) => {
        if (err) {
            console.error('Error fetching supplier:', err);
            res.status(500).send('Error fetching supplier');
        } else if (results.length === 0) {
            res.status(404).send('supplier not found');
        } else {
            res.json(results[0]);
        }
    });
});




module.exports = router;