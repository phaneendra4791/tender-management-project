const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // Needed for password comparison (though hashing is pre-save)
const jwt = require('jsonwebtoken'); // For creating tokens

// Register Route - Handles POST requests to /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password, userType, company, contact } = req.body;

    try {
        // Basic validation
        if (!username || !email || !password || !userType) {
            return res.status(400).json({ msg: 'Please enter all required fields' });
        }
        if (password.length < 8) {
            return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
        }
        if (userType === 'bidder' && (!company || !contact)) {
            return res.status(400).json({ msg: 'Company name and contact are required for bidders' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            // Send a specific error for email existence, which register.html can show
            return res.status(400).json({ msg: 'User with this email already exists', errorType: 'email_exists' });
        }

        // Create new user (password hashing handled by pre-save hook in User model)
        user = new User({
            username,
            email,
            password, // Mongoose pre-save hook will hash this
            userType,
            company: userType === 'bidder' ? company : undefined,
            contact: userType === 'bidder' ? contact : undefined
        });

        await user.save(); // Save user to database

        // Create and send JWT token
        const payload = {
            user: {
                id: user.id,
                userType: user.userType
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Use the secret from .env
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                // Redirect on success for the HTML form approach
                // We're responding with JSON for API, and frontend should handle redirect
                res.status(201).json({ msg: 'Registration successful', token });
            }
        );

    } catch (err) {
        console.error('Registration error:', err.message);
        // More granular error handling for client-side redirection
        let errorRedirect = 'failed';
        if (err.code === 11000) errorRedirect = 'email_exists'; // MongoDB duplicate key error
        // You would typically redirect the browser here for direct form submissions:
        // return res.redirect(`/register.html?error=${errorRedirect}`);
        res.status(500).json({ msg: 'Server Error during registration', details: err.message, errorType: errorRedirect });
    }
});

// Login Route - Handles POST requests to /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password, userType } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials', errorType: 'invalid' });
        }

        // Check user type
        if (user.userType !== userType) {
            return res.status(400).json({ msg: 'Invalid User Type for these credentials', errorType: 'invalid_usertype' });
        }

        // Compare password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials', errorType: 'invalid' });
        }

        // User matched, create and send JWT token
        const payload = {
            user: {
                id: user.id,
                userType: user.userType,
                username: user.username,
                email: user.email,
                company: user.company,
                contact: user.contact
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Use the secret from .env
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                // For direct form submissions, you'd redirect:
                // res.redirect(`/dashboard.html?token=${token}&success=login`);
                res.json({ msg: 'Login successful', token });
            }
        );

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: 'Server Error during login', details: err.message });
    }
});

module.exports = router;