const express = require ('express');
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
} = require ('../controllers/cartController');
const checkLogin = require ('../middlewares/checkLogin');
const router = express.Router ();

router.get ('/', checkLogin, getCart);
router.post ('/add', checkLogin, addToCart);
router.put ('/update', checkLogin, updateCartItemQuantity);
module.exports = router;
