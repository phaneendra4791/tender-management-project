const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['IT', 'Construction', 'Services', 'Supplies', 'Consulting', 'Other']
    },
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Awarded', 'Cancelled', 'Completed'], // ADDED 'Completed'
        default: 'Open'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this tender to a User who created it
        required: true
    },
    minBudget: {
        type: Number,
        required: false
    },
    maxBudget: {
        type: Number,
        required: false
    },
    documents: [ // Array of document URLs
        {
            fileName: String,
            fileUrl: String
        }
    ]
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically

const Tender = mongoose.model('Tender', TenderSchema);

module.exports = Tender;