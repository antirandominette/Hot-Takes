const express =  require('express');
const router = express.Router();
const sauceController = require('../controllers/sauce');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer_config'); // To handle the image upload

router.post('/', auth, multer, sauceController.createSauce); // auth: middleware to check if the user is authenticated multer: middleware to handle the image upload
router.put('/:id', auth, multer, sauceController.modifySauce);
router.delete('/:id', auth, sauceController.deleteSauce);
router.get('/:id', auth, sauceController.getOneSauce);
router.get('/', auth, sauceController.getAllSauces);
router.post('/:id/like', auth, sauceController.likeSauce);

module.exports = router;