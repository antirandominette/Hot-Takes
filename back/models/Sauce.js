const mongoose = require('mongoose');
const sauceSchema = mongoose.Schema({ // Create a schema for the sauces
    name: { type: String, required: true }, 
    manufacturer: { type: String, required: true }, 
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, required: true, default: 0 },
    dislikes: { type: Number, required: true, default: 0 },
    usersLiked: { type: [String], required: true, default: [] },
    usersDisliked: { type: [String], required: true, default: [] },
    userId: { type: String, required: true }
});

module.exports = mongoose.model('Sauce', sauceSchema); // Export the model to be used in other files