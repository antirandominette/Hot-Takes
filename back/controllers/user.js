require('dotenv').config(); // To use the .env file

const env = process.env;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => { // Hash the password before storing it in the database
    bcrypt.hash(req.body.password, 10) // 10: number of passes to hash the password
        .then(hash => { 
            const user = new User({ 
                email: req.body.email, 
                password: hash 
            });

            user.save() // Save the user in the database
                .then(() => res.status(201).json({  // 201: Created 
                    message: 'Utilisateur créé !' 
                }))
                .catch(error => res.status(400).json({ error })); // 400: Bad Request
        })
        .catch(error => res.status(500).json({ error })) // 500: Internal Server Error
};

exports.login = (req, res, next) => { 
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) { // If the user doesn't exist
            return res.status(401).json({ error: 'Paire identifiant/mot de passe incorrecte !' }); // 401: Unauthorized 
        }
        else {
            bcrypt.compare(req.body.password, user.password) // Compare the password sent by the user with the password stored in the database
            .then(valid => {
                if (!valid) { // If the password is incorrect
                    res.status(401).json({
                        message: 'Paire identifiant/mot de passe incorrecte !'
                    });
                }
                else { // If the password is correct
                    res.status(200).json({ // 200: OK
                        userId: user._id, 
                        token: jwt.sign( 
                            { userId: user._id }, 
                            `${env.SECRET_TOKEN}`, 
                            { expiresIn: '24h' } 
                        ),
                    })
                    console.log('User connected: ' + user._id)
                }
            })
            .catch(error => res.status(500).json({ error })); // 500: Internal Server Error
        }
    })
    .catch(error => { res.status(500).json({ error })}); // 500: Internal Server Error
};