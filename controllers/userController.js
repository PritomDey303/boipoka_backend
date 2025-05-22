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
    if (existingUser.length > 0) {
      return res.status (400).json ({message: 'User already exists'});
    }
    const hashedPassword = await bcrypt.hash (password, 10);
    const token = jwt.sign (
      {name, email, mobile, hashedPassword},
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    );
    const verificationUrl = `${process.env.BASE_URL}/api/user/verify/${token}`;
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
    console.error ('Error verifying email:', err);
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
      {id: user._id, email: user.email},
      process.env.JWT_SECRET,
      {expiresIn: '1h'}
    );

    // Generating refresh token
    const refreshToken = jwt.sign (
      {id: user._id, email: user.email},
      process.env.JWT_SECRET,
      {expiresIn: '7d'}
    );

    // Setting both tokens in cookies

    res.cookie ('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
      sameSite: 'None',
      path: '/',
    });

    res.cookie ('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'None',
      path: '/',
    });

    res.status (200).json ({
      message: 'Signin successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        userType: user.userType,
      },
    });
  } catch (error) {
    next (error);
  }
};
