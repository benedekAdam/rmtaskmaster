const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    userid: {
        type: String,
        required: true
    },
    apikey: {
        type: String,
        required: true
    },
    request_count: {
        type: Number,
        required: false
    }
});

module.exports = User = mongoose.model('users', UserSchema);
