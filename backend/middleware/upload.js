const multer= require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName= Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed= /jpg|jpeg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());

    if(ext) cb(null, true);
    else cb(new Error('Only images are allowed'));
};

module.exports = multer({ storage, fileFilter });