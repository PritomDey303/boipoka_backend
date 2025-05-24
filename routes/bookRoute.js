const express = require ('express');
const {
  createBooks,
  getAllBooks,
  getSearchedBooks,
  getBookById,
  createSingleBook,
  getRelatedBook,
} = require ('../controllers/bookController');
const checkLogin = require ('../middlewares/checkLogin');
const handleImageUpload = require ('../config/cloudinary');
const router = express.Router ();

router.get ('/', getAllBooks);
router.post (
  '/',
  checkLogin,
  handleImageUpload ('cover_image'),
  createSingleBook
);
router.get ('/book/:id', getBookById);
router.get ('/related/:id', getRelatedBook);
router.get ('/search', getSearchedBooks);

router.post ('/allbooks', checkLogin, createBooks);

module.exports = router;
