const express = require ('express');
const {signup, verifyEmail, signin} = require ('../controllers/userController');
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

module.exports = router;
