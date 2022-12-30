const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
}

const storage = multer.diskStorage({ // To store the image on the server
    destination: (req, file, callback) => {
        callback(null, 'images'); // The first argument is an error, the second is the destination folder
    },
    filename: (req, file, callback) => {
        const removedSpaceFromFileName = file.originalname.split(' ').join('_'); // Replace spaces with underscores
        const name = removedSpaceFromFileName.split('.')[0]; // Get the name of the file
        const extension = MIME_TYPES[file.mimetype]; // Get the extension of the file
        
        callback(null, name + Date.now() + '.' + extension); // The first argument is an error, the second is the filename
    }
});

module.exports = multer({ storage: storage }).single('image'); // multer expects a single file with the name 'image'