const express = require('express');
const router = express.Router();

// @route   POST /api/contact
// @desc    Handle contact form submission
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ msg: 'Please fill in all fields (name, email, message).' });
    }

    console.log('--- NEW CONTACT MESSAGE ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('--------------------------');

    // In a real application, you would send an email here
    // e.g., using Nodemailer, or save to a 'ContactMessages' collection in MongoDB.

    res.status(200).json({ msg: 'Your message has been sent successfully!' });
});

module.exports = router;