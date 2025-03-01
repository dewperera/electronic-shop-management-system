const express = require('express');
require('dotenv').config(); // Load environment variables
const cors = require("cors");
const employeesRouter = require('./routes/employees');
const transactionsRouter = require('./routes/transactions');
const supplierRouter = require('./routes/supplier');
const ownerRouter = require('./routes/owner');
const salesRouter = require('./routes/sales');
const reviewsRouter = require('./routes/reviews');
const authRouter = require('./routes/auth');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(cors());


//routes
app.use("/api/employees",employeesRouter)
app.use("/api/transactions",transactionsRouter)
app.use("/api/supplier",supplierRouter)
app.use("/api/owner",ownerRouter)
app.use("/api/sales",salesRouter)
app.use("/api/reviews",reviewsRouter)
app.use("/api/auth",authRouter)























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
    console.log(`"🚀 Server started and running..."\nServer is running on http://localhost:${PORT}`);
});
