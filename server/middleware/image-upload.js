

const multer = require('multer');


const imageStorage = multer.diskStorage({
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

const imageFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ){
    cb(null, true);
  } else {
    cb("Tried to upload wrong mime type. Choose a different file.", false);
  }
};


exports.extractCompanyImages = multer({storage: imageStorage, fileFilter: imageFilter})
                                .array('imagesPath', { maxCount: 6 });
