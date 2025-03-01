const express = require('express');
const mysql = require('mysql2');
// const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

app.use(express.json());
// app.use(cors());

const cors = require("cors");
app.use(cors());

console.log("🚀 Server started and running...");


//MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ElectronicsShop'
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

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


/*--------Employee Routes--------*/
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
    const { em_nic, em_fname, em_lname, em_email, em_tel, em_city, role } = req.body;

    if (!em_nic || !em_fname || !em_lname || !em_email || !em_tel || !em_city || !role) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = 'INSERT INTO employees (em_nic, em_fname, em_lname, em_email, em_tel, em_city, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [em_nic, em_fname, em_lname, em_email, em_tel, em_city, role], (err, results) => {
        if (err) {
            console.error('Error adding employee:', err);
            return res.status(500).json({ error: 'Error adding employee' });
        }
        res.status(201).json({ message: 'Employee added successfully', employeeId: results.insertId });
    });
});





// Update an employee
// app.put('/employees/:id', (req, res) => {
//     const { em_nic, em_fname, em_lname, em_email, em_tel, em_city, role } = req.body;
//     const em_id = req.params.id;

//     if (!em_nic || !em_fname || !em_lname || !em_email || !em_tel || !em_city || !role) {
//         return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Check if employee exists before updating
//     db.query('SELECT * FROM employees WHERE em_id = ?', [em_id], (err, results) => {
//         if (err) {
//             console.error('Database error:', err);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ error: 'Employee not found' });
//         }

//         // Update the employee with the correct parameter array
//         const query = 'UPDATE employees SET em_nic = ?, em_fname = ?, em_lname = ?, em_email = ?, em_tel = ?, em_city = ?, role = ? WHERE em_id = ?';
//         db.query(query, [em_nic, em_fname, em_lname, em_email, em_tel, em_city, role, em_id], (err, updateResults) => {
//             if (err) {
//                 console.error('Error updating employee:', err);
//                 return res.status(500).json({ error: 'Error updating employee' });
//             }
//             res.json({ message: 'Employee updated successfully' });
//         });
//     });
// });




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

// Fetch a single employee by ID
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

/*--------Customer Review Routes--------*/
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

/*--------Sales Report Routes--------*/
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

/*--------Transaction Routes--------*/
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

// Delete a transaction (Accountant only)
app.delete('/transactions/:id', checkRole('accountant'), (req, res) => {
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

/*--------Owner Profile Routes--------*/
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
    const { owner_fname, owner_lname, owner_email, owner_tel } = req.body;
    const query = 'UPDATE owner SET owner_fname = ?, owner_lname = ?, owner_email = ?, owner_tel = ? WHERE owner_id = 1'; // Assuming owner_id is 1
    db.query(query, [owner_fname, owner_lname, owner_email, owner_tel], (err, results) => {
        if (err) {
            console.error('Error updating owner details:', err);
            res.status(500).send('Error updating owner details');
        } else {
            res.send('Owner details updated successfully');
        }
    });
});

/*--------Sales Records Routes--------*/
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


/*--------supplier Routes--------*/
// Fetch all suppliers
app.get('/supplier', (req, res) => {
    const query = 'SELECT * FROM supplier';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching suppliers:', err);
            res.status(500).send('Error fetching suppliers');
        } else {
            res.json(results);
        }
    });
});


// Add a new supplier
app.post('/supplier', (req, res) => {
    const { sup_fname, sup_lname, sup_email, sup_tel, sup_address } = req.body;

    if (!sup_fname || !sup_lname || !sup_email || !sup_tel || !sup_address) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = 'INSERT INTO supplier ( sup_fname, sup_lname, sup_email, sup_tel, sup_address) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [ sup_fname, sup_lname, sup_email, sup_tel, sup_address], (err, results) => {
        if (err) {
            console.error('Error adding supplier:', err);
            return res.status(500).json({ error: 'Error adding supplier' });
        }
        res.status(201).json({ message: 'supplier added successfully', supplierId: results.insertId });
    });
});


// Update an supplier
app.put('/supplier/:id', (req, res) => {
    const {sup_fname, sup_lname, sup_email, sup_tel, sup_address} = req.body;
    const sup_id = req.params.id;

    if (!sup_fname || !sup_lname || !sup_email || !sup_tel || !sup_address) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if supplier exists before updating
    db.query('SELECT * FROM supplier WHERE sup_id = ?', [sup_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'supplier not found' });
        }

        // Update the employee with the correct parameter array
        const query = 'UPDATE supplier SET sup_fname = ?, sup_lname = ?, sup_email = ?, sup_tel = ?, sup_address = ? WHERE sup_id = ?';
        db.query(query, [sup_fname, sup_lname, sup_email, sup_tel, sup_address, sup_id], (err, updateResults) => {
            if (err) {
                console.error('Error updating supplier:', err);
                return res.status(500).json({ error: 'Error updating supplier' });
            }
            res.json({ message: 'supplier updated successfully' });
        });
    });
});


// Delete an supplier
app.delete('/supplier/:id', (req, res) => {
    const sup_id = req.params.id; // Fix variable name

    const query = 'DELETE FROM supplier WHERE sup_id = ?';
    db.query(query, [sup_id], (err, results) => {
        if (err) {
            console.error('Error deleting supplier:', err);
            res.status(500).send('Error deleting supplier');
        } else {
            res.send('Supplier deleted successfully');
        }
    });
});


// Fetch a single supplier by ID
app.get('/supplier/:id', (req, res) => {
    const sup_id = req.params.id;
    const query = 'SELECT * FROM supplier WHERE sup_id = ?';
    db.query(query, [sup_id], (err, results) => {
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






// Replace the duplicate route with this updated version that handles both cases
app.put('/employees/:id', (req, res) => {
    const em_id = req.params.id;
    const { em_nic, em_fname, em_lname, em_email, em_tel, em_city, role } = req.body;
    
    console.log("Update request for employee:", em_id);
    console.log("Received data:", req.body);
    
    // Check if the request is from an accountant (without role field)
    if (em_nic && em_fname && em_lname && em_email && em_tel && em_city && !role) {
        // This is likely an accountant updating their own profile
        const query = `
            UPDATE employees 
            SET em_nic = ?, em_fname = ?, em_lname = ?, em_email = ?, em_tel = ?, em_city = ? 
            WHERE em_id = ?
        `;
        
        db.query(query, [em_nic, em_fname, em_lname, em_email, em_tel, em_city, em_id], (err, results) => {
            if (err) {
                console.error('Error updating employee profile:', err);
                return res.status(500).json({ error: 'Error updating employee profile' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            
            res.json({ message: 'Employee profile updated successfully' });
        });
    } 
    // Owner updating an employee (with role field)
    else if (em_nic && em_fname && em_lname && em_email && em_tel && em_city && role) {
        const query = 'UPDATE employees SET em_nic = ?, em_fname = ?, em_lname = ?, em_email = ?, em_tel = ?, em_city = ?, role = ? WHERE em_id = ?';
        
        db.query(query, [em_nic, em_fname, em_lname, em_email, em_tel, em_city, role, em_id], (err, results) => {
            if (err) {
                console.error('Error updating employee:', err);
                return res.status(500).json({ error: 'Error updating employee' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            
            res.json({ message: 'Employee updated successfully' });
        });
    }
    else {
        return res.status(400).json({ error: "Missing required fields" });
    }
});







// //update accountant
// app.get('/employees', (req, res) => {
//     const query = "SELECT * FROM employees WHERE role = 'Accountant'"; // Fetch only accountants
//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('Error fetching accountant:', err);
//             return res.status(500).json({ error: 'Error fetching accountant' });
//         }

//         console.log(results); // Log the results for debugging
//         if (results.length === 0) {
//             return res.status(404).json({ message: 'No accountants found' });
//         }

//         res.json(results); // Return the results as JSON
//     });
// });


//get accountant
// Update an accountant's profile (only for accountant)
// app.put('/employees/:id', (req, res) => {
//     const { em_nic, em_fname, em_lname, em_email, em_tel, em_city } = req.body;
//     const em_id = req.params.id;

//     console.log("Incoming Update Request for Accountant:");
//     console.log("Received em_id:", em_id);
//     console.log("Received Data:", req.body);

//     // Check for missing fields
//     if (!em_nic || !em_fname || !em_lname || !em_email || !em_tel || !em_city) {
//         console.error("Missing Fields:", req.body);
//         return res.status(400).json({ error: "Missing required fields" });
//     }

//     const query = `
//         UPDATE employees 
//         SET em_nic = ?, em_fname = ?, em_lname = ?, em_email = ?, em_tel = ?, em_city = ? 
//         WHERE em_id = ? AND role = 'Accountant'
//     `;

//     const values = [em_nic, em_fname, em_lname, em_email, em_tel, em_city, em_id];

//     db.query(query, values, (err, results) => {
//         if (err) {
//             console.error('Error updating accountant:', err);
//             return res.status(500).json({ error: 'Error updating accountant' });
//         }

//         console.log("Query Execution Results:", results);

//         if (results.affectedRows === 0) {
//             console.warn("Accountant not found or unauthorized:", em_id);
//             return res.status(404).json({ message: 'Accountant not found or unauthorized' });
//         }

//         console.log("Accountant updated successfully.");
//         res.json({ message: 'Accountant updated successfully' });
//     });
// });




// // Start the server
const PORT = process.env.PORT || 5502;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
