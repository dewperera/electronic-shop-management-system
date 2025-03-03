const express = require('express');
require('dotenv').config(); // Load environment variables
const cors = require("cors");
const path = require('path');

const employeesRouter = require('./routes/employees');
const transactionsRouter = require('./routes/transactions');
const supplierRouter = require('./routes/supplier');
const ownerRouter = require('./routes/owner');
const salesRouter = require('./routes/sales');
const reviewsRouter = require('./routes/reviews');
const authRouter = require('./routes/auth');
const customersRouter = require('./routes/customers');
const productsRouter = require('./routes/products');
const damageReportsRouter = require('./routes/damageReports');
const restockRequestsRouter = require('./routes/restockRequests');
const checkoutRouter = require('./routes/checkout'); 
const orderRoutes = require('./routes/order');
const billingRouter = require('./routes/billing');


const app = express();

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
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
app.use("/api/customers",customersRouter)
app.use('/api/products', productsRouter);
app.use('/api/damage-reports', damageReportsRouter);
app.use('/api/restock-requests', restockRequestsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/', orderRoutes);
app.use('/api/billing', billingRouter);


// // Start the server
const PORT = process.env.PORT || 5502;
app.listen(PORT, () => {
    console.log(`"🚀 Server started and running..."\nServer is running on http://localhost:${PORT}`);
});
