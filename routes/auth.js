const express = require('express');
const dbConnection = require('../dbConnection');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Register Endpoint
router.post('/register', async (req, res) => {
    const { cus_name, cus_email, password, cus_tel } = req.body;

    // Validate required fields
    if (!cus_name || !cus_email || !password || !cus_tel) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if email already exists
        const checkQuery = 'SELECT cus_email FROM customer WHERE cus_email = ?';
        const checkResult = await new Promise((resolve, reject) => {
            dbConnection().query(checkQuery, [cus_email], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (checkResult.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new customer
        const insertQuery = 'INSERT INTO customer (cus_name, cus_email, cus_tel, password, cus_type) VALUES (?, ?, ?, ?, ?)';
        await new Promise((resolve, reject) => {
            dbConnection().query(insertQuery, [cus_name, cus_email, cus_tel, hashedPassword, 'Online'], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login Endpoint
router.post('/login', (req, res) => {
    const { cus_email, password } = req.body;

    if (!cus_email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM customer WHERE cus_email = ? AND cus_type = "Online"';
    dbConnection().query(query, [cus_email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', user });
    });
});

// First, create a new table for reset tokens (run this SQL once):
// CREATE TABLE password_reset_tokens (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     cus_id INT NOT NULL,
//     token VARCHAR(255) NOT NULL,
//     expires_at DATETIME NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (cus_id) REFERENCES customer(cus_id) ON DELETE CASCADE
// );

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Find user by email
        const findUserQuery = 'SELECT cus_id, cus_email FROM customer WHERE cus_email = ? AND cus_type = "Online"';
        const user = await new Promise((resolve, reject) => {
            dbConnection().query(findUserQuery, [email], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        // Always return success regardless of whether the email exists
        // This prevents email enumeration attacks
        if (!user) {
            return res.status(200).json({ message: 'If your email exists in our system, you will receive password reset instructions.' });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Set token expiration (1 hour from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        
        // Delete any existing tokens for this user
        const deleteQuery = 'DELETE FROM password_reset_tokens WHERE cus_id = ?';
        await new Promise((resolve, reject) => {
            dbConnection().query(deleteQuery, [user.cus_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        
        // Save the new token
        const insertQuery = 'INSERT INTO password_reset_tokens (cus_id, token, expires_at) VALUES (?, ?, ?)';
        await new Promise((resolve, reject) => {
            dbConnection().query(insertQuery, [user.cus_id, hashedToken, expiresAt], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        
        // Create the reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5502'}/account.html?token=${resetToken}`;
        
        // Send email with reset link
        await sendTestEmail(user.cus_email, "Password Reset", `Please follow this link to reset your password: ${resetUrl}`);
        
        res.status(200).json({ message: 'If your email exists in our system, you will receive password reset instructions.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Reset Password Endpoint
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
    }
    
    try {
        // Hash the token to match stored value
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find the token in DB
        const findTokenQuery = `
        SELECT t.cus_id, t.expires_at 
        FROM password_reset_tokens t
        WHERE t.token = ? AND t.expires_at > NOW()
    `;
        
        const tokenRecord = await new Promise((resolve, reject) => {
            dbConnection().query(findTokenQuery, [hashedToken], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });
        
        if (!tokenRecord) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Update the user's password
        const updateQuery = 'UPDATE customer SET password = ? WHERE cus_id = ?';
        await new Promise((resolve, reject) => {
            dbConnection().query(updateQuery, [hashedPassword, tokenRecord.cus_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        
        // Delete used token
        const deleteQuery = 'DELETE FROM password_reset_tokens WHERE cus_id = ?';
        await new Promise((resolve, reject) => {
            dbConnection().query(deleteQuery, [tokenRecord.cus_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Email sending function
// async function sendPasswordResetEmail(email, resetUrl) {
//     // Create a test account if you don't have real credentials
//     // let testAccount = await nodemailer.createTestAccount();
    
//     // Create reusable transporter
//     let transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST || "smtp.ethereal.email",
//         port: process.env.EMAIL_PORT || 587,
//         secure: process.env.EMAIL_SECURE === 'true',
//         auth: {
//             user: process.env.EMAIL_USER, // Your email username
//             pass: process.env.EMAIL_PASS, // Your email password
//         },
//     });
    
//     // Send mail with defined transport object
//     let info = await transporter.sendMail({
//        from: `"Cloudline Technologies" <${process.env.EMAIL_FROM || 'noreply@cloudlinetech.lk'}>`,
//         to: email,
//         subject: "Password Reset Request",
//         text: `You requested a password reset. Please follow this link to reset your password: ${resetUrl}
//                 This link will expire in 1 hour.
//                 If you did not request a password reset, please ignore this email.`,
//         html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//                 <h2>Password Reset Request</h2>
//                 <p>You requested a password reset for your Cloudline Technologies account.</p>
//                 <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
//                 <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
//                 <p>If you did not request a password reset, please ignore this email.</p>
//                 <p>Regards,<br>Cloudline Technologies Team</p>
//             </div>
//         `,
//     });
    
//     console.log("Password reset email sent: %s", info.messageId);
//     return info;
// }


async function sendTestEmail(to, subject, text) {
    let testAccount = await nodemailer.createTestAccount(); // Create a test account

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass  // generated ethereal password
        }
    });

    let info = await transporter.sendMail({
        from: '"Cloudline Tech" <noreply@cloudline.lk>',
        to,
        subject,
        text
    });

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

sendTestEmail("student@example.com", "Password Reset", "Here is your password reset link: ...");


module.exports = router;