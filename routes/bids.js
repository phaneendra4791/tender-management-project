const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');    // Import Bid model
const Tender = require('../models/Tender'); // Import Tender model
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Modified authentication middleware (DECODES JWT LOCALLY FOR NOW) - same as in tenders.js
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Contains { id, userType, username, email, ... }
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route   POST /api/bids
// @desc    Submit a new bid for a tender
// @access  Private (Bidder only)
router.post('/', authMiddleware, async (req, res) => {
    const { id: bidderId, userType } = req.user;

    if (userType !== 'bidder') {
        return res.status(403).json({ msg: 'Access denied. Only bidders can submit bids.' });
    }

    const { tenderId, bidAmount, bidDocuments } = req.body;

    try {
        // Check if tender exists and is open
        const tender = await Tender.findById(tenderId);
        if (!tender) {
            return res.status(404).json({ msg: 'Tender not found' });
        }
        if (tender.status !== 'Open') {
            return res.status(400).json({ msg: 'Cannot bid on a tender that is not Open.' });
        }

        // Check if bidder has already placed a bid on this tender using the ACTUAL bidderId
        const existingBid = await Bid.findOne({ tender: tenderId, bidder: bidderId });
        if (existingBid) {
            return res.status(400).json({ msg: 'You have already submitted a bid for this tender.' });
        }

        const newBid = new Bid({
            tender: tenderId,
            bidder: bidderId,
            bidAmount,
            bidDocuments
        });

        const bid = await newBid.save();
        res.status(201).json(bid);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during bid submission');
    }
});

// @route   PUT /api/bids/:bidId/accept
// @desc    Accept a specific bid and close the tender
// @access  Private (Admin or Tender Creator)
router.put('/:bidId/accept', authMiddleware, async (req, res) => {
    const { id: userId, userType } = req.user;
    const { bidId } = req.params;
    const { tenderId } = req.body; // Tender ID is passed in body for verification

    try {
        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ msg: 'Bid not found' });
        }

        const tender = await Tender.findById(tenderId);
        if (!tender) {
            return res.status(404).json({ msg: 'Tender not found' });
        }

        // Authorization Check: Only Admin or the actual Tender Creator can accept a bid
        if (userType !== 'admin' && tender.createdBy.toString() !== userId) {
            return res.status(403).json({ msg: 'Access denied. You are not authorized to accept bids for this tender.' });
        }

        // Check if tender is already closed/awarded
        if (tender.status !== 'Open') {
            return res.status(400).json({ msg: 'Tender is not Open. Cannot accept bids.' });
        }

        // Set the accepted bid's status to 'Accepted'
        bid.status = 'Accepted';
        await bid.save();

        // Set all other bids for this tender to 'Rejected'
        await Bid.updateMany(
            { tender: tenderId, _id: { $ne: bidId } }, // All other bids for this tender
            { $set: { status: 'Rejected' } }
        );

        // Update the tender status to 'Awarded'
        tender.status = 'Awarded';
        await tender.save();

        res.json({ msg: 'Bid accepted successfully! Tender status updated to Awarded.' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Bid or Tender ID' });
        }
        res.status(500).send('Server Error accepting bid');
    }
});

// @route   PUT /api/bids/:bidId/complete
// @desc    Mark an accepted bid/tender as completed by the bidder
// @access  Private (Accepted Bidder only)
router.put('/:bidId/complete', authMiddleware, async (req, res) => {
    const { id: userId, userType } = req.user;
    const { bidId } = req.params;

    try {
        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ msg: 'Bid not found' });
        }

        // Ensure the bid is by the current user and is 'Accepted'
        if (bid.bidder.toString() !== userId) {
            return res.status(403).json({ msg: 'Access denied. You can only mark your own bids as complete.' });
        }
        if (bid.status !== 'Accepted') {
            return res.status(400).json({ msg: 'Only accepted bids can be marked as complete.' });
        }

        // Update bid status to 'Completed'
        bid.status = 'Completed';
        await bid.save();

        // Optional: Also update the associated Tender status to 'Completed' if it's currently 'Awarded'
        const tender = await Tender.findById(bid.tender);
        if (tender && tender.status === 'Awarded') {
            tender.status = 'Completed';
            await tender.save();
        }

        res.json({ msg: 'Tender marked as completed successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error marking tender as completed');
    }
});

// @route   GET /api/bids/tender/:tenderId
// @desc    Get all bids for a specific tender (usually for admin/tender creator)
// @access  Private (Admin/Tender Creator)
router.get('/tender/:tenderId', authMiddleware, async (req, res) => {
    const { id: userId, userType } = req.user;

    try {
        const tender = await Tender.findById(req.params.tenderId);
        if (!tender) {
            return res.status(404).json({ msg: 'Tender not found' });
        }

        // Only admin or the tender creator can view bids for a tender
        if (userType !== 'admin' && tender.createdBy.toString() !== userId) {
            return res.status(403).json({ msg: 'Access denied. You can only view bids for tenders you created or if you are an admin.' });
        }

        const bids = await Bid.find({ tender: req.params.tenderId }).populate('bidder', 'username email company contact');
        res.json(bids);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Tender ID' });
        }
        res.status(500).send('Server Error fetching bids for tender');
    }
});

// @route   GET /api/bids/my-bids
// @desc    Get all bids submitted by the logged-in user (optionally filtered by tenderId or status)
// @access  Private (Bidder only)
router.get('/my-bids', authMiddleware, async (req, res) => {
    const { id: userId, userType } = req.user;
    const { tenderId, status } = req.query; // Get optional tenderId and status from query parameters

    if (userType !== 'bidder') {
        return res.status(403).json({ msg: 'Access denied. Only bidders can view their bids.' });
    }

    try {
        let query = { bidder: userId };
        if (tenderId) {
            query.tender = tenderId;
        }
        if (status) {
            // If status is provided, add it to the query
            // 'Completed' now strictly filters for bid.status === 'Completed'
            // For other status filters, it's direct.
            query.status = status;
        }

        const bids = await Bid.find(query).populate('tender', 'title description status');
        res.json(bids);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching user bids');
    }
});

module.exports = router;