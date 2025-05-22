const express = require ('express');
const dotenv = require ('dotenv');
const cookieParser = require ('cookie-parser');
const connectDB = require ('./config/db');
const app = express ();
const port = process.env.PORT || 5000;
//cookie parser
app.use (cookieParser ());
// Load config
dotenv.config ();
// Connect to database
connectDB ();

// Middleware
app.use (express.json ());
app.use (express.urlencoded ({extended: true}));
//import routes module
const userRoute = require ('./routes/userRoute');
const bookRoute = require ('./routes/bookRoute');
const reviewRoute = require ('./routes/reviewRoute');
// Routes
app.use ('/api/user', userRoute);
app.use ('/api/books', bookRoute);
app.use ('/api/review', reviewRoute);

app.listen (port, () => {
  console.log (`Example app listening on port ${port}`);
});
