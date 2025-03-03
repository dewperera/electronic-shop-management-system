const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();


// Add a new employee
router.post('/', (req, res) => {
    const { em_nic, em_fname, em_lname, em_email, em_tel, em_city, role } = req.body;

    if (!em_nic || !em_fname || !em_lname || !em_email || !em_tel || !em_city || !role) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = 'INSERT INTO employees (em_nic, em_fname, em_lname, em_email, em_tel, em_city, role) VALUES (?, ?, ?, ?, ?, ?, ?)';

    dbConnection().query(query, [em_nic, em_fname, em_lname, em_email, em_tel, em_city, role], (err, results) => {
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
router.delete('/:id', (req, res) => {
    const em_id = req.params.id;
    const query = 'DELETE FROM employees WHERE em_id = ?';
    dbConnection().query(query, [em_id], (err, results) => {
        if (err) {
            console.error('Error deleting employee:', err);
            res.status(500).send('Error deleting employee');
        } else {
            res.send('Employee deleted successfully');
        }
    });
});

// Fetch a single employee by ID
router.get('/:id', (req, res) => {
    const em_id = req.params.id;
    const query = 'SELECT * FROM employees WHERE em_id = ?';
    dbConnection().query(query, [em_id], (err, results) => {
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

/*--------Employee Routes--------*/
// Fetch all employees
router.get('/', (req, res) => {
    const query = 'SELECT * FROM employees';
    dbConnection().query(query, (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            res.status(500).send('Error fetching employees');
        } else {
            res.json(results);
        }
    });
});

// Replace the duplicate route with this updated version that handles both cases
router.put('/:id', (req, res) => {
    const em_id = req.params.id;
    const { em_nic, em_fname, em_lname, em_email, em_tel, em_city, role } = req.body;

    console.log("Update request for employee:", em_id);
    console.log("Received data:", req.body);

    let query, values;

    if (em_nic && em_fname && em_lname && em_email && em_tel && em_city && !role) {
        // Accountant updating their own profile
        query = `UPDATE employees SET em_nic = ?, em_fname = ?, em_lname = ?, em_email = ?, em_tel = ?, em_city = ? WHERE em_id = ?`;
        values = [em_nic, em_fname, em_lname, em_email, em_tel, em_city, em_id];
    } 
    else if (em_nic && em_fname && em_lname && em_email && em_tel && em_city && role) {
        // Owner updating an employee (with role)
        query = `UPDATE employees SET em_nic = ?, em_fname = ?, em_lname = ?, em_email = ?, em_tel = ?, em_city = ?, role = ? WHERE em_id = ?`;
        values = [em_nic, em_fname, em_lname, em_email, em_tel, em_city, role, em_id];
    } 
    else {
        return res.status(400).json({ error: "Missing required fields" });
    }

    dbConnection().query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating employee:', err);
            return res.status(500).json({ error: 'Error updating employee' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({ message: 'Employee updated successfully' });
    });
});



module.exports = router;