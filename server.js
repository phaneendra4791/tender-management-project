require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware to enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware to parse JSON bodies from incoming requests.
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a basic root route for API status check
app.get('/', (req, res) => res.send('Tender Management API running'));

// --- DIRECT REGISTRATION POST ROUTE ---
// This route is placed here directly for robustness during development.
app.post('/api/auth/register', async (req, res) => {
    const User = require('./models/User'); // Re-import User model (local to this function's scope)
    const jwt = require('jsonwebtoken'); // Re-import jwt (local to this function's scope)
    const bcrypt = require('bcryptjs'); // Ensure bcryptjs is available if pre-save hook is not used or for manual hashing check

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
            return res.status(400).json({ msg: 'User with this email already exists', errorType: 'email_exists' });
        }
        // Also check for duplicate username if unique constraint is on username
        let userByUsername = await User.findOne({ username });
        if (userByUsername) {
            return res.status(400).json({ msg: 'User with this username already exists', errorType: 'username_exists' });
        }


        // Create new user (password hashing handled by pre-save hook in User model)
        user = new User({
            username,
            email,
            password,
            userType,
            company: userType === 'bidder' ? company : undefined,
            contact: userType === 'bidder' ? contact : undefined
        });

        await user.save(); // Mongoose pre-save hook will hash password here

        // Create and send JWT token
        const payload = {
            user: {
                id: user.id,
                userType: user.userType
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ msg: 'Registration successful', token, user: payload.user });
            }
        );

    } catch (err) {
        console.error('Registration error (direct route):', err.message);
        // Generic 500 for unhandled errors, specific 400s for validation
        res.status(500).json({ msg: 'Server Error during registration', details: err.message, errorType: 'failed' });
    }
});
// --- END DIRECT REGISTRATION POST ROUTE ---


// --- DIRECT LOGIN POST ROUTE ---
// This route is placed here directly for robustness during development.
app.post('/api/auth/login', async (req, res) => {
    const User = require('./models/User'); // Re-import User model (local to this function's scope)
    const jwt = require('jsonwebtoken'); // Re-import jwt (local to this function's scope)
    const bcrypt = require('bcryptjs'); // Re-import bcryptjs (local to this function's scope)

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
        const isMatch = await bcrypt.compare(password, user.password); // Use bcrypt.compare directly
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
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ msg: 'Login successful', token, user: payload.user }); // Return user object for frontend
            }
        );

    } catch (err) {
        console.error('Login error (direct route):', err.message);
        res.status(500).json({ msg: 'Server Error during login', details: err.message });
    }
});
// --- END DIRECT LOGIN POST ROUTE ---


// API Routes for tenders, bids, contact, and USERS
// NOTE: authMiddleware for these routes is handled locally within their respective route files
app.use('/api/tenders', require('./routes/tenders'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));