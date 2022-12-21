require('dotenv').config(); // To use the .env file

const env = process.env;
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => { // Check if the user is authenticated
    try { 
        const token = req.headers.authorization.split(' ')[1]; // Split the token from the authorization header [Bearer, token] and extract the token [1]
        const decodedToken = jwt.verify(token, `${env.SECRET_TOKEN}`); // Decode the token with the secret key
        const userId = decodedToken.userId; // Extract the user ID from the token 

        req.auth = { // Adding the userId to the request object.
            userId: userId
        }

        next(); // If the user is authenticated, continue the request
    } 
    catch (error) {
        res.status(401).json({ error }); // 401: Unauthorized
    }
};