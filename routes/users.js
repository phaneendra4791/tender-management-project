const express = require('express');
const router = express.Router();
const User = require('../models/User');    // Import User model
const Tender = require('../models/Tender'); // Import Tender model
const Bid = require('../models/Bid');      // Import Bid model
const jwt = require('jsonwebtoken');       // Import jsonwebtoken

// Modified authentication middleware (DECODES JWT LOCALLY FOR NOW)
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

// @route   GET /api/users/me
// @desc    Get current logged-in user's profile (details, created tenders, submitted bids)
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    const { id: userId, userType } = req.user; // Get actual user ID and type from JWT

    try {
        // Fetch basic user details
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        let profileData = {
            userDetails: user,
            adminData: {}, // Initialize adminData object to ensure it's always there
            bidderData: {} // Initialize bidderData object to ensure it's always there
        };

        if (userType === 'admin') {
            // For admin: Tenders created by them
            profileData.adminData.createdTenders = await Tender.find({ createdBy: userId })
                .populate('createdBy', 'username')
                .sort({ createdAt: -1 });

            // For admin: Bids on tenders they created (all statuses)
            const adminTenderIds = profileData.adminData.createdTenders.map(t => t._id);
            profileData.adminData.bidsOnMyTenders = await Bid.find({ tender: { $in: adminTenderIds } })
                .populate('tender', 'title status') // Get tender title and status
                .populate('bidder', 'username email') // Get bidder info
                .sort({ createdAt: -1 });

            // Filter accepted bids for admin
            profileData.adminData.acceptedBids = profileData.adminData.bidsOnMyTenders.filter(bid => bid.status === 'Accepted');

        } else if (userType === 'bidder') {
            // For bidder: All bids submitted by this bidder
            profileData.bidderData.allSubmittedBids = await Bid.find({ bidder: userId })
                .populate('tender', 'title description status endDate') // Populate relevant tender fields
                .sort({ createdAt: -1 });

            // Filter bidder's bids by status (frontend will use these separate lists)
            profileData.bidderData.acceptedBids = profileData.bidderData.allSubmittedBids.filter(bid => bid.status === 'Accepted');
            profileData.bidderData.ongoingBids = profileData.bidderData.allSubmittedBids.filter(bid => bid.status === 'Pending' && bid.tender && bid.tender.status === 'Open');
            profileData.bidderData.completedBids = profileData.bidderData.allSubmittedBids.filter(bid => bid.status === 'Completed'); // Strictly filter for 'Completed'
        }

        res.json(profileData);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching user profile');
    }
});

module.exports = router;