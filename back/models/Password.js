const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8) // Minimum length 8
.is().max(24) // Maximum length 100
.has().uppercase() // Must have uppercase letters
.has().lowercase() // Must have lowercase letters
.has().digits(2) // Must have at least 2 digits
.has().not().spaces() // Should not have spaces

module.exports = passwordSchema;