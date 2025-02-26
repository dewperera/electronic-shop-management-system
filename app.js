const express = require('express');
const db = require('./db'); // Import the database connection

const app = express();
app.use(express.json());

// Fetch all owners
app.get('/owner', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM owner');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch owner' });
    }
});

// Fetch all employees
app.get('/employees', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM employees');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Start the server
const PORT = 3004;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
