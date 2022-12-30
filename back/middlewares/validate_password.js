const passwordSchema = require('../models/Password');

module.exports = (req, res, next) => { // Check if the password is strong enough
    passwordSchema.validate(req.body.password) ? 
        next() : res.status(400).json({ error: 'Password is not strong enough : Must be 8-24 chars | Must contain UpperCase / LowerCase / 2 Numbers | Must not have Spaces' });
};