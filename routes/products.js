const express = require('express');
const router = express.Router();
const dbConnection = require('../dbConnection');

// --------------------------
// 1. Add Product
// --------------------------
router.post('/', (req, res) => {
    const { product_name, product_description, product_price, image_url, product_quantity } = req.body;

    if (!product_name || !product_description || !product_price || !product_quantity) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        INSERT INTO Products (product_name, product_description, product_price, image_url, product_quantity)
        VALUES (?, ?, ?, ?, ?)
    `;
    dbConnection().query(query, [product_name, product_description, product_price, image_url, product_quantity], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ message: 'Error adding product', error: err.message });
        }
        res.status(201).json({ message: 'Product added successfully', product_id: result.insertId });
    });
});

// --------------------------
// 2. Search Products
// --------------------------
router.get('/search', (req, res) => {
    const { term } = req.query;

    if (!term) {
        return res.status(400).json({ message: 'Search term is required' });
    }

    const query = `
        SELECT * FROM Products
        WHERE product_name LIKE ? OR product_description LIKE ?
    `;
    dbConnection().query(query, [`%${term}%`, `%${term}%`], (err, result) => {
        if (err) {
            console.error('Error searching products:', err);
            return res.status(500).json({ message: 'Error searching products', error: err.message });
        }
        res.status(200).json(result);
    });
});

// --------------------------
// 3. Update Product
// --------------------------
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { product_name, product_description, product_price, image_url, product_quantity } = req.body;

    if (!product_name || !product_description || !product_price || !product_quantity) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        UPDATE Products
        SET product_name = ?, product_description = ?, product_price = ?, image_url = ?, product_quantity = ?
        WHERE product_id = ?
    `;
    dbConnection().query(query, [product_name, product_description, product_price, image_url, product_quantity, id], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ message: 'Error updating product', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully' });
    });
});

// --------------------------
// 4. Delete Product
// --------------------------
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM Products WHERE product_id = ?';
    dbConnection().query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ message: 'Error deleting product', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    });
});

// --------------------------
// 5. Fetch All Products
// --------------------------
router.get('/', (req, res) => {
    const query = 'SELECT * FROM Products';
    dbConnection().query(query, (err, result) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ message: 'Error fetching products', error: err.message });
        }
        res.status(200).json(result);
    });
});

module.exports = router;