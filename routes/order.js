const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dbConnection = require('../dbConnection');

// Create database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',    // Replace with your actual username
    password: 'root', // Replace with your actual password
    database: 'ElectronicsShop'  // Replace with your actual database name
});

// Connect to database
db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database successfully');
    }
});

// Get all orders with filters
router.get('/api/orders', (req, res) => {
    const { status, date } = req.query;
    console.log('Received request for orders with status:', status, 'date:', date);
    
    let query = `
        SELECT o.orders_id, o.name, o.created_at, o.total, os.status
        FROM orders o
        JOIN order_status os ON o.orders_id = os.order_id
    `;
    
    const filters = [];
    const queryParams = [];
    
    if (status && status !== 'all') {
        filters.push('os.status = ?');
        queryParams.push(status);
    }
    
    if (date) {
        filters.push('DATE(o.created_at) = ?');
        queryParams.push(date);
    }
    
    if (filters.length > 0) {
        query += ` WHERE ${filters.join(' AND ')}`;
    }
    
    console.log('Executing query:', query, 'with params:', queryParams);
    
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`Found ${results.length} orders`);
        res.json(results);
    });
});

// Get order details by ID
router.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    console.log('Fetching details for order ID:', orderId);
    
    // First get order and status
    const orderQuery = `
        SELECT o.*, os.status
        FROM orders o
        JOIN order_status os ON o.orders_id = os.order_id
        WHERE o.orders_id = ?
    `;
    
    db.query(orderQuery, [orderId], (err, orderResults) => {
        if (err) {
            console.error('Database error (order):', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (orderResults.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = orderResults[0];
        
        // Then get order items
        const itemsQuery = `
            SELECT oi.*, p.product_name, p.product_quantity
            FROM order_items oi
            JOIN Products p ON oi.products_id = p.product_id
            WHERE oi.order_id = ?
        `;
        
        db.query(itemsQuery, [orderId], (err, itemResults) => {
            if (err) {
                console.error('Database error (items):', err);
                return res.status(500).json({ error: err.message });
            }
            
            const response = {
                ...order,
                items: itemResults.map(item => ({
                    product_name: item.product_name,
                    price: item.price,
                    quantity: item.quantity,
                    product_quantity: item.product_quantity
                }))
            };
            
            console.log(`Sending order details with ${response.items.length} items`);
            res.json(response);
        });
    });
});

// // Update order status
// router.put('/api/orders/:id/status', (req, res) => {
//     const orderId = req.params.id;
//     const { status } = req.body;
//     console.log(`Updating order ${orderId} status to ${status}`);
    
//     const query = `
//         UPDATE order_status
//         SET status = ?, updated_at = CURRENT_TIMESTAMP
//         WHERE order_id = ?
//     `;
    
//     db.query(query, [status, orderId], (err, results) => {
//         if (err) {
//             console.error('Database error:', err);
//             return res.status(500).json({ error: err.message });
//         }
        
//         if (results.affectedRows === 0) {
//             return res.status(404).json({ error: 'Order not found' });
//         }
        
//         console.log('Order status updated successfully');
//         res.json({ success: true, message: 'Order status updated successfully' });
//     });
// });


// Update order status and reduce product quantities
router.put('/api/orders/:id/status', (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
  
    console.log(`Updating order ${orderId} status to ${status}`);
  
    // Fetch order items
    const getOrderItemsQuery = `
      SELECT products_id, quantity
      FROM order_items
      WHERE order_id = ?
    `;
  
    dbConnection().query(getOrderItemsQuery, [orderId], (err, items) => {
      if (err) {
        console.error('Error fetching order items:', err);
        return res.status(500).json({ error: 'Failed to fetch order items' });
      }
  
      // If the order is being accepted, reduce product quantities
      if (status === 'accepted') {
        const updateProductQuantities = items.map(item => {
          const updateQuery = `
            UPDATE Products
            SET product_quantity = product_quantity - ?
            WHERE product_id = ?
          `;
          return new Promise((resolve, reject) => {
            dbConnection().query(updateQuery, [item.quantity, item.products_id], (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
        });
  
        // Execute all product quantity updates
        Promise.all(updateProductQuantities)
          .then(() => {
            // Update order status after reducing quantities
            const updateStatusQuery = `
              UPDATE order_status
              SET status = ?, updated_at = CURRENT_TIMESTAMP
              WHERE order_id = ?
            `;
            dbConnection().query(updateStatusQuery, [status, orderId], (err, result) => {
              if (err) {
                console.error('Error updating order status:', err);
                return res.status(500).json({ error: 'Failed to update order status' });
              }
              console.log('Order status updated and product quantities reduced');
              res.json({ success: true, message: 'Order accepted and product quantities updated' });
            });
          })
          .catch(error => {
            console.error('Error updating product quantities:', error);
            res.status(500).json({ error: 'Failed to update product quantities' });
          });
      } else {
        // For other statuses (e.g., 'rejected'), just update the order status
        const updateStatusQuery = `
          UPDATE order_status
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE order_id = ?
        `;
        dbConnection().query(updateStatusQuery, [status, orderId], (err, result) => {
          if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ error: 'Failed to update order status' });
          }
          console.log('Order status updated');
          res.json({ success: true, message: 'Order status updated' });
        });
      }
    });
  });

module.exports = router;