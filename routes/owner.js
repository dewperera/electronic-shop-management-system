const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();


/*--------Owner Profile Routes--------*/
// Fetch owner details
router.get('/', (req, res) => {
    const query = 'SELECT * FROM owner WHERE owner_id = 1'; // Assuming owner_id is 1
    dbConnection().query(query, (err, results) => {
        if (err) {
            console.error('Error fetching owner details:', err);
            res.status(500).send('Error fetching owner details');
        } else if (results.length === 0) {
            res.status(404).send('Owner not found');
        } else {
            res.json(results[0]);
        }
    });
});

// Update owner details
router.put('/', (req, res) => {
    const { owner_fname, owner_lname, owner_email, owner_tel } = req.body;
    const query = 'UPDATE owner SET owner_fname = ?, owner_lname = ?, owner_email = ?, owner_tel = ? WHERE owner_id = 1'; // Assuming owner_id is 1
    dbConnection().query(query, [owner_fname, owner_lname, owner_email, owner_tel], (err, results) => {
        if (err) {
            console.error('Error updating owner details:', err);
            res.status(500).send('Error updating owner details');
        } else {
            res.send('Owner details updated successfully');
        }
    });
});


module.exports = router;