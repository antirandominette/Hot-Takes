const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const validatePassword = require('../middlewares/validate_password');

// List of middlewares used :

// validatePassword : to check if the password is strong enough
// userCtrl : to handle the requests

router.post('/signup', validatePassword, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router; 