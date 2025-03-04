// routes/checkout.js
const express = require('express');
const dbConnection = require('../dbConnection'); // Import the database connection
const router = express.Router();

// Checkout endpoint
router.post('/', (req, res) => {
  const { name, address, email, phone, total, items } = req.body;

  console.log('Received Checkout Data:', { name, address, email, phone, total, items });

  // Convert total to a number
  let totalAmount = typeof total === 'string' ? parseFloat(total.replace('Rs.', '').trim()) : parseFloat(total);
  
  if (isNaN(totalAmount)) {
    return res.status(400).json({ error: 'Invalid total amount' });
  }

  // First, check if this customer already exists in the customer table
  const checkCustomerQuery = 'SELECT * FROM customer WHERE cus_tel = ?';
  
  dbConnection().query(checkCustomerQuery, [phone], (err, customerResult) => {
    if (err) {
      console.error('Error checking customer:', err);
      return res.status(500).send(err);
    }
    
    // If customer doesn't exist, add them to the customer table
    if (customerResult.length === 0) {
      const addCustomerQuery = `
        INSERT INTO customer 
        (cus_name, cus_email, cus_tel, cus_type, loyalty_status) 
        VALUES (?, ?, ?, 'Online', 'No')
      `;
      
      dbConnection().query(addCustomerQuery, [name, email, phone], (err, result) => {
        if (err) {
          console.error('Error adding customer:', err);
          // Continue with order process even if customer creation fails
        } else {
          console.log('New customer added with ID:', result.insertId);
        }
        
        // Continue with order process
        processOrder();
      });
    } else {
      // Customer exists, proceed with order
      console.log('Customer already exists with ID:', customerResult[0].cus_id);
      processOrder();
    }
  });
  
  // Function to process the order
  function processOrder() {
    // Insert order into the `orders` table
    const orderQuery = `
      INSERT INTO orders (name, address, email, phone, total)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    dbConnection().query(orderQuery, [name, address, email, phone, totalAmount], (err, result) => {
      if (err) {
        console.error('Error inserting order:', err);
        return res.status(500).send(err);
      }

      const orderId = result.insertId;
      console.log('Order inserted with ID:', orderId);

      // Insert order items
      const orderItemsQuery = `
        INSERT INTO order_items (order_id, products_id, quantity, price)
        VALUES ?
      `;
      
      const orderItemsValues = items.map(item => [
        orderId,
        item.id,
        item.quantity,
        item.price
      ]);

      dbConnection().query(orderItemsQuery, [orderItemsValues], (err, result) => {
        if (err) {
          console.error('Error inserting order items:', err);
          return res.status(500).send(err);
        }

        console.log('Order items inserted successfully');
        
        // Return receipt data
        res.json({ 
          success: true, 
          orderId,
          receiptData: {
            orderId,
            customerName: name,
            address,
            email,
            phone,
            items,
            subtotal: parseFloat(totalAmount) - (parseFloat(totalAmount) * 0.05),
            tax: parseFloat(totalAmount) * 0.05,
            total: totalAmount,
            orderDate: new Date().toLocaleString()
          }
        });
      });
    });
  }
});

// Get receipt data endpoint
router.get('/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  
  // Query to get order details
  const orderQuery = `
    SELECT o.*, oi.products_id, oi.quantity, oi.price, p.Name as product_name, p.ImageURL as imageUrl
    FROM orders o
    JOIN order_items oi ON o.orders_id = oi.order_id
    JOIN Products p ON oi.products_id = p.product_id
    WHERE o.orders_id = ?
  `;
  
  dbConnection().query(orderQuery, [orderId], (err, results) => {
    if (err) {
      console.error('Error fetching order details:', err);
      return res.status(500).send(err);
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Format the results into a receipt structure
    const orderInfo = {
      orderId: results[0].orders_id,
      customerName: results[0].name,
      address: results[0].address,
      email: results[0].email,
      phone: results[0].phone,
      total: results[0].total,
      orderDate: new Date(results[0].created_at).toLocaleString(),
      items: results.map(item => ({
        id: item.products_id,
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      }))
    };
    
    // Calculate subtotal and tax
    orderInfo.subtotal = orderInfo.total - (orderInfo.total * 0.05);
    orderInfo.tax = orderInfo.total * 0.05;
    
    res.json(orderInfo);
  });
});

module.exports = router;