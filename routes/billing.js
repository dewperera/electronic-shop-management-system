// routes/billing.js
const express = require('express');
const dbConnection = require('../dbConnection'); // Import the database connection
const router = express.Router();

// Fetch Products from the Database
router.get('/products', (req, res) => {
    console.log('Fetching products from database...');
    
    try {
        const db = dbConnection();
        
        // Make sure we have a valid database connection
        if (!db || !db.query) {
            console.error('Invalid database connection');
            return res.status(500).json({ message: 'Database connection failed' });
        }
        
        const sql = 'SELECT * FROM Products';
        
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching products:', err);
                return res.status(500).json({ 
                    message: 'Failed to fetch products',
                    error: err.message 
                });
            }
            
            console.log(`Successfully retrieved ${results.length} products`);
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ 
            message: 'Server error while fetching products',
            error: error.message 
        });
    }
});

// Save Receipt Endpoint
router.post('/save-receipt', (req, res) => {
    console.log('Saving receipt...');
    
    const { products, totalAmount } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: 'Invalid products data' });
    }
    
    try {
        const db = dbConnection();
        
        // Make sure we have a valid database connection
        if (!db || !db.query) {
            console.error('Invalid database connection');
            return res.status(500).json({ message: 'Database connection failed' });
        }
        
        // Begin transaction
        db.beginTransaction(err => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).json({ message: 'Failed to start transaction' });
            }
            
            // Insert receipt
            const receiptSql = `INSERT INTO receipts (total_amount) VALUES (?)`;
            db.query(receiptSql, [totalAmount], (err, result) => {
                if (err) {
                    console.error('Error saving receipt:', err);
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Failed to save receipt' });
                    });
                }
                
                const receiptId = result.insertId;
                
                // Prepare receipt items
                const receiptItemsSql = `INSERT INTO receipt_items (receipt_id, product_name, quantity, price, discount, total) VALUES ?`;
                const values = products.map(product => [
                    receiptId,
                    product.productName,
                    product.quantity,
                    product.price,
                    product.discount,
                    product.total
                ]);
                
                // Insert receipt items
                db.query(receiptItemsSql, [values], (err) => {
                    if (err) {
                        console.error('Error saving receipt items:', err);
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Failed to save receipt items' });
                        });
                    }
                    
                    // Update product quantities
                    let updatePromises = products.map(product => {
                        return new Promise((resolve, reject) => {
                            const updateSql = `UPDATE Products SET product_quantity = product_quantity - ? WHERE product_id = ?`;
                            db.query(updateSql, [product.quantity, product.product_id], (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            });
                        });
                    });
                    
                    // Execute all update queries
                    Promise.all(updatePromises.map(p => p.catch(e => e)))
                        .then(results => {
                            // Check if any errors occurred
                            const errors = results.filter(result => result instanceof Error);
                            
                            if (errors.length > 0) {
                                console.error('Error updating product quantities:', errors);
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Failed to update product quantities' });
                                });
                            }
                            
                            // Commit transaction
                            db.commit(err => {
                                if (err) {
                                    console.error('Error committing transaction:', err);
                                    return db.rollback(() => {
                                        res.status(500).json({ message: 'Failed to commit transaction' });
                                    });
                                }
                                
                                console.log('Receipt saved successfully');
                                res.status(200).json({ 
                                    message: 'Receipt saved successfully',
                                    receiptId: receiptId
                                });
                            });
                        })
                        .catch(error => {
                            console.error('Error in update promises:', error);
                            db.rollback(() => {
                                res.status(500).json({ message: 'Failed to update products' });
                            });
                        });
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ 
            message: 'Server error while saving receipt',
            error: error.message 
        });
    }
});

module.exports = router;
