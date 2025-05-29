const express = require ('express');
const {
  signup,
  verifyEmail,
  signin,
  checkUserAuth,
  signout,
} = require ('../controllers/userController');
const checkLogin = require ('../middlewares/checkLogin');
const router = express.Router ();

router.get ('/', (req, res) => {
  res.send ('User route');
});

//signup
router.post ('/signup', signup);
//verify email
router.get ('/verify/:token', verifyEmail);

//signin
router.post ('/signin', signin);

router.get ('/me', checkLogin, checkUserAuth);

router.post ('/signout', checkLogin, signout);

module.exports = router;
