const express = require('express');
const router = express.Router();
const Tender = require('../models/Tender'); // Import Tender model
const User = require('../models/User'); // Import User model
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Modified authentication middleware (DECODES JWT LOCALLY FOR NOW)
const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token using your secret key from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user from token payload to the request object
        req.user = decoded.user; // This will contain { id, userType } of the actual logged-in user

        next(); // Pass control to the next middleware/route handler
    } catch (err) {
        // Token is not valid (e.g., expired, malformed)
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route   POST /api/tenders
// @desc    Create a new tender
// @access  Private (Admin only) - now enforced by local JWT decoding middleware
router.post('/', authMiddleware, async (req, res) => {
    const { id, userType } = req.user; // req.user now comes from decoded JWT

    if (userType !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Only administrators can create tenders.' });
    }

    const { title, description, category, endDate, minBudget, maxBudget, documents } = req.body;

    try {
        const newTender = new Tender({
            title,
            description,
            category,
            endDate,
            createdBy: id, // Use the actual user's ID
            minBudget,
            maxBudget,
            documents
        });

        const tender = await newTender.save();
        res.status(201).json(tender);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during tender creation');
    }
});

// @route   GET /api/tenders
// @desc    Get all tenders
// @access  Public
router.get('/', async (req, res) => {
    try {
        // No authMiddleware here means this is public
        const tenders = await Tender.find().populate('createdBy', 'username email userType');
        res.json(tenders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching tenders');
    }
});

// @route   GET /api/tenders/:id
// @desc    Get tender by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id).populate('createdBy', 'username email userType');
        if (!tender) {
            return res.status(404).json({ msg: 'Tender not found' });
        }
        res.json(tender);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Tender not found' });
        }
        res.status(500).send('Server Error fetching tender');
    }
});

module.exports = router;