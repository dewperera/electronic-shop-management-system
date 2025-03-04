// const express = require('express');
// require('dotenv').config(); // Load environment variables
// const cors = require("cors");
// const path = require('path');
// const bodyParser = require('body-parser')
// const session = require('express-session'); 


// const employeesRouter = require('./routes/employees');
// const transactionsRouter = require('./routes/transactions');
// const supplierRouter = require('./routes/supplier');
// const ownerRouter = require('./routes/owner');
// const salesRouter = require('./routes/sales');
// const reviewsRouter = require('./routes/reviews');
// const authRouter = require('./routes/auth');
// const customersRouter = require('./routes/customers');
// const productsRouter = require('./routes/products');
// const damageReportsRouter = require('./routes/damageReports');
// const restockRequestsRouter = require('./routes/restockRequests');
// const checkoutRouter = require('./routes/checkout'); 
// const orderRoutes = require('./routes/order');
// const billingRouter = require('./routes/billing');
// const loginRouter = require('./routes/loginRouter');
// const resetPasswordRouter = require('./routes/resetPasswordRouter');
// const registerStaffRouter = require('./routes/registerStaffRouter');


// // Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const app = express();

// app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.json());
// app.use(cors());


// // Session middleware
// app.use(session({
//     secret: 'password', // Change this to a secure random string
//     resave: false,
//     saveUninitialized: false,
//     cookie: { 
//         secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//         maxAge: 24 * 60 * 60 * 1000 // 24 hours
//     }
// }));


// //routes
// app.use("/api/employees",employeesRouter)
// app.use("/api/transactions",transactionsRouter)
// app.use("/api/supplier",supplierRouter)
// app.use("/api/owner",ownerRouter)
// app.use("/api/sales",salesRouter)
// app.use("/api/reviews",reviewsRouter)
// app.use("/api/auth",authRouter)
// app.use("/api/customers",customersRouter)
// app.use('/api/products', productsRouter);
// app.use('/api/damage-reports', damageReportsRouter);
// app.use('/api/restock-requests', restockRequestsRouter);
// app.use('/api/checkout', checkoutRouter);
// app.use('/', orderRoutes);
// app.use('/api/billing', billingRouter);
// app.use(loginRouter);
// app.use(resetPasswordRouter);
// app.use(registerStaffRouter);


// // Home route redirects to login
// app.get('/', (req, res) => {
//     res.redirect('/login');
// });

// // Handle 404
// app.use((req, res) => {
//     res.status(404).send('Page not found');
// });


// // // Start the server
// const PORT = process.env.PORT || 5502;
// app.listen(PORT, () => {
//     console.log(`"🚀 Server started and running..."\nServer is running on http://localhost:${PORT}`);
// });


const express = require('express');
require('dotenv').config(); // Load environment variables
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session'); // Corrected module name

// Initialize express app first
const app = express();
const PORT = process.env.PORT || 5502;

app.use(cors({
    origin: 'http://localhost:3000/dashboard',  // Allow frontend to make requests
    credentials: true  // Ensure cookies are included in requests
}));

// Middleware setup
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/dashboard')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Session middleware
app.use(session({
    secret: 'owner', // Change this to a secure random string
    resave: false,
    saveUninitialized: true,
    // cookie: { 
    //     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    //     maxAge: 24 * 60 * 60 * 1000 // 24 hours
    cookie: { secure: true }
    }
));

// Import all routers AFTER initializing the app
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
const loginRouter = require('./routes/loginRouter');
const resetPasswordRouter = require('./routes/resetPasswordRouter');
const registerStaffRouter = require('./routes/registerStaffRouter');



// Set up routes
app.use("/api/employees", employeesRouter);
app.use("/transactions", transactionsRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/owner", ownerRouter);

app.use('/api', salesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/auth", authRouter);
app.use("/api/customers", customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/damage-reports', damageReportsRouter);
app.use('/api/restock-requests', restockRequestsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/', orderRoutes);
app.use('/api/billing', billingRouter);
app.use(loginRouter);
app.use(resetPasswordRouter);
app.use(registerStaffRouter);




// Home route redirects to login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`"🚀 Server started and running..."\nServer is running on http://localhost:${PORT}`);
});