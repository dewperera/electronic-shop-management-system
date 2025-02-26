const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',       // MySQL server host
    user: 'root',            // MySQL username
    password: 'root', // MySQL password
    database: 'ElectronicsShop', // Database name
    waitForConnections: true,
    connectionLimit: 10,      // Maximum number of connections in the pool
    queueLimit: 0
});

// Export the pool for use in other files
module.exports = pool.promise();