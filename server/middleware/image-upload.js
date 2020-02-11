

const multer = require('multer');




const fileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'images');
  },
  filename: function(req, file, cb) {
    cb(null, 
      file.originalname.split('.')[0] + 
      '-' + 
      new Date().toISOString().replace(/:/g, '-') + 
      '.' +
      file.originalname.split('.')[1])
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ){
    cb(null, true);
  } else {
    cb("try upload wrong mime type", false);
  }
};


module.exports = multer({storage: fileStorage, fileFilter}).single('imagePath');
