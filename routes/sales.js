const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();
const checkRole = require('../middleware/checkRoleMiddleware');
/*--------Sales Report Routes--------*/
// Fetch sales data for a specific period
router.get('/', checkRole('owner'), (req, res) => {
    const { period } = req.query;
    let query = '';

    switch (period) {
        case 'daily':
            query = 'SELECT * FROM sales WHERE date = CURDATE()';
            break;
        case 'weekly':
            query = 'SELECT * FROM sales WHERE YEARWEEK(date) = YEARWEEK(CURDATE())';
            break;
        case 'monthly':
            query = 'SELECT * FROM sales WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())';
            break;
        case 'yearly':
            query = 'SELECT * FROM sales WHERE YEAR(date) = YEAR(CURDATE())';
            break;
        default:
            return res.status(400).send('Invalid period');
    }

    dbConnection().query(query, (err, results) => {
        if (err) {
            console.error('Error fetching sales data:', err);
            res.status(500).send('Error fetching sales data');
        } else {
            res.json(results);
        }
    });
});



/*--------Sales Records Routes--------*/
// Add new sales data
router.post('/', (req, res) => {
    const { date, amount, description } = req.body;
    const query = 'INSERT INTO sales (date, amount, description) VALUES (?, ?, ?)';
    dbConnection().query(query, [date, amount, description], (err, results) => {
        if (err) {
            console.error('Error adding sales data:', err);
            res.status(500).send('Error adding sales data');
        } else {
            res.status(201).send('Sales data added successfully');
        }
    });
});


module.exports = router;