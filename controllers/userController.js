const User = require ('../models/User');
const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
const sendEmail = require ('../utils/sendEmail');
//signup
exports.signup = async (req, res, next) => {
  try {
    const {name, email, mobile, password} = req.body;
    // Check if user already exists
    const existingUser = await User.find ({email});
    console.log ('Existing User:', existingUser);
    if (existingUser.length > 0) {
      return res.status (400).json ({message: 'User already exists'});
    }
    const hashedPassword = await bcrypt.hash (password, 10);
    const token = jwt.sign (
      {name, email, mobile, hashedPassword},
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    );
    const verificationUrl = `${process.env.FRONTEND_URL}/verifyEmail?token=${token}`;
    const html = `<h1>Verify your email</h1>
                      <p>Click the link below to verify your email:</p>
                      <a href="${verificationUrl}">Verify Email</a>`;
    await sendEmail (email, 'Email Verification', html);
    res.status (200).json ({
      message: 'Verification email sent',
      user: {name, email, mobile},
    });
  } catch (err) {
    console.error ('Error creating user:', err);
    res
      .status (500)
      .json ({message: 'Failed to create user', error: err.message});
  }
};

//verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const {token} = req.params;
    console.log (req.params);
    const decoded = jwt.verify (token, process.env.JWT_SECRET);
    const {name, email, mobile, hashedPassword} = decoded;

    // Check if user already exists
    const existingUser = await User.find ({email});
    if (existingUser.length > 0) {
      return res.status (400).json ({message: 'User already exists'});
    }

    // Create new user
    const newUser = new User ({
      name,
      email,
      mobile,
      isVerified: true,
      password: hashedPassword,
    });
    await newUser.save ();
    res.status (200).json ({message: 'Email verified successfully'});
  } catch (err) {
    console.error ('Error verifying email:', err.message);
    res
      .status (500)
      .json ({message: 'Failed to verify email', error: err.message});
  }
};

// signin controller
exports.signin = async (req, res, next) => {
  try {
    const {email, password} = req.body;

    // Checking if user exists
    const user = await User.findOne ({email});
    if (!user) {
      return res.status (400).json ({message: 'User not found'});
    }
    // Checking if user is verified
    if (!user.isVerified) {
      return res.status (400).json ({
        message: 'User not verified. Please verify your email.',
      });
    }

    // Checking if password is correct
    const isMatch = await bcrypt.compare (password, user.password);
    if (!isMatch) {
      return res.status (400).json ({message: 'Invalid credentials'});
    }

    // Generating access token
    const accessToken = jwt.sign (
      {
        _id: user._id,
        email: user.email,
        mobile: user.mobile,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    );

    // Generating refresh token
    const refreshToken = jwt.sign (
      {
        _id: user._id,
        email: user.email,
        mobile: user.mobile,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      {expiresIn: '7d'}
    );

    // Setting both tokens in cookies

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie ('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 3600000,
      path: '/',
    });

    res.cookie ('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.status (200).json ({
      message: 'Signin successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        userType: user.userType,
      },
    });
  } catch (error) {
    res.status (500).json ({
      message: 'Internal server error',
    });
  }
};

//check user auth
exports.checkUserAuth = async (req, res, next) => {
  try {
    if (req.user) {
      res.status (200).json ({
        message: 'User is authenticated',
        user: {
          _id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          mobile: req.user.mobile,
          userType: req.user.userType,
        },
      });
    } else {
      res.status (401).json ({
        message: 'User is not authenticated',
      });
    }
  } catch (error) {
    res.status (401).json ({
      message: 'Unauthorized',
    });
  }
};

//signout
exports.signout = async (req, res, next) => {
  try {
    res.clearCookie ('accessToken', {path: '/'});
    res.clearCookie ('refreshToken', {path: '/'});
    res.status (200).json ({message: 'Signout successful'});
  } catch (error) {
    res.status (500).json ({
      message: 'Internal server error',
    });
  }
};
