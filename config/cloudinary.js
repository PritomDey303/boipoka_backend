const cloudinary = require ('cloudinary').v2;
const {CloudinaryStorage} = require ('multer-storage-cloudinary');
const multer = require ('multer');
cloudinary.config ({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//storage
const storage = new CloudinaryStorage ({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'bookstore',
    format: file.mimetype.split ('/')[1],
    public_id: `${req.body.title_bn}_${Date.now ()}`,
  }),
});

//filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes (file.mimetype)) {
    cb (null, true);
  } else {
    cb (new multer.MulterError ('LIMIT_UNEXPECTED_FILE', 'Invalid file type'));
  }
};

const upload = multer ({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

//handling image upload
const handleImageUpload = fieldName => (req, res, next) => {
  console.log (fieldName);
  const uploader = upload.single (fieldName);

  uploader (req, res, err => {
    if (err instanceof multer.MulterError) {
      console.log (err.message);
      let message = 'Image upload error';
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File too large. Max size is 5MB.';
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file type. Only JPG, PNG, and WEBP allowed.';
      }

      return res.status (400).json ({error: message});
    } else if (err) {
      console.error ('Upload error:', err);
      return res
        .status (500)
        .json ({error: 'Image upload failed. Please try again.'});
    }

    next ();
  });
};

module.exports = handleImageUpload;
