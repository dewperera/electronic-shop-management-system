const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'employee_management'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});
/*--------Owner----------*/
/*-------Employee-------- */

// Fetch all employees
app.get('/employees', (req, res) => {
    const query = 'SELECT * FROM employees';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            res.status(500).send('Error fetching employees');
        } else {
            res.json(results);
        }
    });
});

// Add a new employee
app.post('/employees', (req, res) => {
    const { em_fname, em_lname, em_email, em_tel, role } = req.body;
    const query = 'INSERT INTO employees (em_fname, em_lname, em_email, em_tel, role) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [em_fname, em_lname, em_email, em_tel, role], (err, results) => {
        if (err) {
            console.error('Error adding employee:', err);
            res.status(500).send('Error adding employee');
        } else {
            res.status(201).send('Employee added successfully');
        }
    });
});

// Update an employee
app.put('/employees/:id', (req, res) => {
    const { em_fname, em_lname, em_email, em_tel, role } = req.body;
    const em_id = req.params.id;
    const query = 'UPDATE employees SET em_fname = ?, em_lname = ?, em_email = ?, em_tel = ?, role = ? WHERE em_id = ?';
    db.query(query, [em_fname, em_lname, em_email, em_tel, role, em_id], (err, results) => {
        if (err) {
            console.error('Error updating employee:', err);
            res.status(500).send('Error updating employee');
        } else {
            res.send('Employee updated successfully');
        }
    });
});

// Delete an employee
app.delete('/employees/:id', (req, res) => {
    const em_id = req.params.id;
    const query = 'DELETE FROM employees WHERE em_id = ?';
    db.query(query, [em_id], (err, results) => {
        if (err) {
            console.error('Error deleting employee:', err);
            res.status(500).send('Error deleting employee');
        } else {
            res.send('Employee deleted successfully');
        }
    });
});

//get employee id
app.get('/employees/:id', (req, res) => {
    const em_id = req.params.id;
    const query = 'SELECT * FROM employees WHERE em_id = ?';
    db.query(query, [em_id], (err, results) => {
        if (err) {
            console.error('Error fetching employee:', err);
            res.status(500).send('Error fetching employee');
        } else if (results.length === 0) {
            res.status(404).send('Employee not found');
        } else {
            res.json(results[0]);
        }
    });
});

// Start the server
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

/*--------Customer Review--------*/

// Fetch all customer reviews
app.get('/reviews', (req, res) => {
    const query = 'SELECT * FROM reviews';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            res.status(500).send('Error fetching reviews');
        } else {
            res.json(results);
        }
    });
});

/*--------view Sales report-------*/

// Middleware to check user role
function checkRole(role) {
    return (req, res, next) => {
        const userRole = req.headers['role']; // Role passed in the request header
        if (userRole === role) {
            next();
        } else {
            res.status(403).send('Access denied');
        }
    };
}


// Fetch sales data for a specific period 
app.get('/sales', checkRole('owner'), (req, res) => {
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

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching sales data:', err);
            res.status(500).send('Error fetching sales data');
        } else {
            res.json(results);
        }
    });
});

/*------View transaction--------*/
// Middleware to check user role
function checkRole(role) {
    return (req, res, next) => {
        const userRole = req.headers['role']; // Role passed in the request header
        if (userRole === role) {
            next();
        } else {
            res.status(403).send('Access denied');
        }
    };
}
// Fetch all transactions (Owner only)
app.get('/transactions', checkRole('owner'), (req, res) => {
    const query = 'SELECT * FROM transactions';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).send('Error fetching transactions');
        } else {
            res.json(results);
        }
    });
});

/*-------Owner profile--------*/

// Fetch owner details
app.get('/owner', (req, res) => {
    const query = 'SELECT * FROM owner WHERE owner_id = 1'; // Assuming owner_id is 1
    db.query(query, (err, results) => {
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
app.put('/owner', (req, res) => {
    const { owner_fname, owner_lname, email, phone_number } = req.body;
    const query = 'UPDATE owner SET owner_fname = ?, owner_lname = ?, email = ?, phone_number = ? WHERE owner_id = 1'; // Assuming owner_id is 1
    db.query(query, [owner_fname, owner_lname, email, phone_number], (err, results) => {
        if (err) {
            console.error('Error updating owner details:', err);
            res.status(500).send('Error updating owner details');
        } else {
            res.send('Owner details updated successfully');
        }
    });
});


/*----------Accountant---------*/
/*----------Transaction---------*/

// Add a new transaction
app.post('/transactions', (req, res) => {
    const { date, description, amount, type } = req.body;
    const query = 'INSERT INTO transactions (date, description, amount, type) VALUES (?, ?, ?, ?)';
    db.query(query, [date, description, amount, type], (err, results) => {
        if (err) {
            console.error('Error adding transaction:', err);
            res.status(500).send('Error adding transaction');
        } else {
            res.status(201).send('Transaction added successfully');
        }
    });
});
// Add a new transaction (Accountant only)
app.post('/transactions', checkRole('accountant'), (req, res) => {
    const { date, description, amount, type } = req.body;
    const query = 'INSERT INTO transactions (date, description, amount, type) VALUES (?, ?, ?, ?)';
    db.query(query, [date, description, amount, type], (err, results) => {
        if (err) {
            console.error('Error adding transaction:', err);
            res.status(500).send('Error adding transaction');
        } else {
            res.status(201).send('Transaction added successfully');
        }
    });
});

// Fetch all transactions
app.get('/transactions', (req, res) => {
    const query = 'SELECT * FROM transactions';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            res.status(500).send('Error fetching transactions');
        } else {
            res.json(results);
        }
    });
});

// Fetch a single transaction by ID
app.get('/transactions/:id', (req, res) => {
    const transaction_id = req.params.id;
    const query = 'SELECT * FROM transactions WHERE transaction_id = ?';
    db.query(query, [transaction_id], (err, results) => {
        if (err) {
            console.error('Error fetching transaction:', err);
            res.status(500).send('Error fetching transaction');
        } else if (results.length === 0) {
            res.status(404).send('Transaction not found');
        } else {
            res.json(results[0]);
        }
    });
});

// Update a transaction
app.put('/transactions/:id', (req, res) => {
    const transaction_id = req.params.id;
    const { date, description, amount, type } = req.body;
    const query = 'UPDATE transactions SET date = ?, description = ?, amount = ?, type = ? WHERE transaction_id = ?';
    db.query(query, [date, description, amount, type, transaction_id], (err, results) => {
        if (err) {
            console.error('Error updating transaction:', err);
            res.status(500).send('Error updating transaction');
        } else {
            res.send('Transaction updated successfully');
        }
    });
});
// Update a transaction (Accountant only)
app.put('/transactions/:id', checkRole('accountant'), (req, res) => {
    const transaction_id = req.params.id;
    const { date, description, amount, type } = req.body;
    const query = 'UPDATE transactions SET date = ?, description = ?, amount = ?, type = ? WHERE transaction_id = ?';
    db.query(query, [date, description, amount, type, transaction_id], (err, results) => {
        if (err) {
            console.error('Error updating transaction:', err);
            res.status(500).send('Error updating transaction');
        } else {
            res.send('Transaction updated successfully');
        }
    });
});


// Delete a transaction
app.delete('/transactions/:id', (req, res) => {
    const transaction_id = req.params.id;
    const query = 'DELETE FROM transactions WHERE transaction_id = ?';
    db.query(query, [transaction_id], (err, results) => {
        if (err) {
            console.error('Error deleting transaction:', err);
            res.status(500).send('Error deleting transaction');
        } else {
            res.send('Transaction deleted successfully');
        }
    });
});

/*--------Sales Records---------*/

// Add new sales data
app.post('/sales', (req, res) => {
    const { date, amount, description } = req.body;
    const query = 'INSERT INTO sales (date, amount, description) VALUES (?, ?, ?)';
    db.query(query, [date, amount, description], (err, results) => {
        if (err) {
            console.error('Error adding sales data:', err);
            res.status(500).send('Error adding sales data');
        } else {
            res.status(201).send('Sales data added successfully');
        }
    });
});

// Fetch sales data for a specific period
app.get('/sales', (req, res) => {
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

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching sales data:', err);
            res.status(500).send('Error fetching sales data');
        } else {
            res.json(results);
        }
    });
});

