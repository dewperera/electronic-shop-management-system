const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();
const checkRole = require('../middleware/checkRoleMiddleware');

/*--------Customer Review Routes--------*/
// Fetch all customer reviews
router.get('/', (req, res) => {
    const query = 'SELECT * FROM reviews';
    dbConnection().query(query, (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            res.status(500).send('Error fetching reviews');
        } else {
            res.json(results);
        }
    });
});




module.exports = router;