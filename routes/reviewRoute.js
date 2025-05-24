const express = require ('express');
const {addReview, getReviews} = require ('../controllers/reviewController');
const router = express.Router ();
const checkLogin = require ('../middlewares/checkLogin.js');

router.post ('/add', checkLogin, addReview);

router.get ('/:id', getReviews);
module.exports = router;
