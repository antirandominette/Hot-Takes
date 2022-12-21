const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const userSchema = mongoose.Schema({ // Create a schema for the users
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); // Add a plugin to the schema to make sure that the email is unique

module.exports = mongoose.model('User', userSchema); // Export the model to be used in other files