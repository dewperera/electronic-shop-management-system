const express = require('express');
const router = express.Router();
const dbConnection = require('../dbConnection');

// Route to execute SQL query
router.post('/execute-query', (req, res) => {
    const { query, params } = req.body;

    console.log('Received query:', query);
    console.log('Received params:', params);

    dbConnection().query(query, params, (err, rows) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ 
                error: 'Database query failed', 
                details: err.message 
            });
        }

        console.log('Query results:', rows);
        res.json(rows);
    });
});

module.exports = router;