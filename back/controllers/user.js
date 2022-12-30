const env = process.env;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// List of HTTP status codes used in the code:

// 200 (OK) - Indicates that the request has succeeded and the server has returned the requested data.
// 201 (Created) - Indicates that the request has succeeded and the server has created a new document or resource.
// 400 (Bad Request) - Indicates that the request has failed due to syntax or validation error.
// 401 (Unauthorized) - Indicates that the request has failed because the user lacks the necessary permissions to access the requested resource.
// 500 (Internal Server Error) - Indicates that the server has encountered an internal error and was unable to process the request.


exports.signup = (req, res, next) => { // Hash the password before storing it in the database
    function createNewUser(hash) { // Creates a new user
        const user = new User({ 
            email: req.body.email, 
            password: hash 
        });

        user.save() // Save the user in the database
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
    }

    bcrypt.hash(req.body.password, 10) // 10: number of passes to hash the password
        .then(hash => { 
            validator.isEmail(req.body.email)  ? createNewUser(hash) : res.status(400).json({ message: 'Email non valide !' });
        })
        .catch(error => res.status(500).json({ error }))
};

exports.login = (req, res, next) => { // Check if the user exists in the database and if the password is correct
    function authenticateUser(user) {
        bcrypt.compare(req.body.password, user.password) // Compare the password sent by the user with the password stored in the database
        .then(valid => { // valid = true if the password is correct
            valid ? connectUser(user) : res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte !' });
        })
        .catch(error => res.status(500).json({ error }));
    }

    function connectUser(user) { // Connect the user
        res.status(200).json({
            userId: user._id, 
            token: jwt.sign( 
                { userId: user._id }, 
                `${env.SECRET_TOKEN}`, 
                { expiresIn: '24h' } 
            ),
        })
        console.log('User connected: ' + user._id)
    }

    User.findOne({ email: req.body.email })
        .then(user => { // user = the user found in the database
            user ? authenticateUser(user) : res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte !' });
        })
        .catch(error => { res.status(500).json({ error })});
};