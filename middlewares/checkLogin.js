const jwt = require ('jsonwebtoken');

const checkLogin = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status (401).json ({message: 'Not authenticated'});
    }

    // Verify access token
    if (accessToken) {
      try {
        const user = jwt.verify (accessToken, process.env.JWT_SECRET);
        req.user = user;
        return next ();
      } catch (err) {
        console.log (err.message + '1');
        if (err.name !== 'TokenExpiredError') {
          return res.status (401).json ({message: 'Invalid access token'});
        }
      }
    }

    if (refreshToken) {
      try {
        const user = jwt.verify (refreshToken, process.env.JWT_SECRET);

        const newAccessToken = jwt.sign (
          {
            _id: user._id,
            email: user.email,
            mobile: user.mobile,
            userType: user.userType,
          },
          process.env.JWT_SECRET,
          {expiresIn: '1h'}
        );

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie ('accessToken', newAccessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          maxAge: 3600000,
          path: '/',
        });

        req.user = user;
        return next ();
      } catch (err) {
        console.log (err.message);
        return res.status (401).json ({message: 'Invalid refresh token'});
      }
    }

    return res.status (401).json ({message: 'Authentication required'});
  } catch (err) {
    console.log (err.message);
    return res.status (500).json ({message: 'Internal server error!'});
  }
};

module.exports = checkLogin;
