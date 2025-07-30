const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['admin', 'bidder'], // Only allows 'admin' or 'bidder'
        required: true
    },
    company: {
        type: String,
        required: function() { return this.userType === 'bidder'; }, // Required only for bidders
        trim: true
    },
    contact: {
        type: String,
        required: function() { return this.userType === 'bidder'; }, // Required only for bidders
        trim: true,
        match: [/^\d{10}$/, 'Contact should be 10 digits']
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

// Hash the password before saving the user
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;