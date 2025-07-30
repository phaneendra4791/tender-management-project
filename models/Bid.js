const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
    tender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tender', // Links this bid to a specific Tender
        required: true
    },
    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this bid to the User who submitted it
        required: true
    },
    bidAmount: {
        type: Number,
        required: true,
        min: 0 // Bid amount cannot be negative
    },
    bidDocuments: [ // Array of bid document URLs
        {
            fileName: String,
            fileUrl: String
        }
    ],
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], // ADDED 'Completed'
        default: 'Pending'
    }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically

const Bid = mongoose.model('Bid', BidSchema);

module.exports = Bid;