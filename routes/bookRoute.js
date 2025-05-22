const express = require ('express');
const {
  createBooks,
  getAllBooks,
  getSearchedBooks,
  getBookById,
  createSingleBook,
} = require ('../controllers/bookController');
const checkLogin = require ('../middlewares/checkLogin');
const upload = require ('../config/cloudinary');
const handleImageUpload = require ('../config/cloudinary');
const router = express.Router ();

router.get ('/', getAllBooks);
router.post (
  '/',
  checkLogin,
  handleImageUpload ('cover_image'),
  createSingleBook
);
router.get ('/:id', getBookById);
router.get ('/search', getSearchedBooks);
router.post ('/allbooks', checkLogin, createBooks);

module.exports = router;
