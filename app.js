const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');  

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Parsing middleware
// Parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended: true})); // New

// Parse application/json
// app.use(bodyParser.json());
app.use(express.json()); // New

// Static Files
app.use(express.static('public'));

// Templating Engine
app.engine('hbs', exphbs( {extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(session({
  secret: 'a9f5b602eb23301b9e2dcd44d5f693541b8f85e4f0625d167e1c74b0d6d43f78f',  // Use a secret key for session encryption
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to `true` if using HTTPS
}));
// Connection Pool
// You don't need the connection here as we have it in userController
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
 

const routes = require('./server/routes/user');


// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();  // User is logged in, proceed to the next middleware or route
  } else {
    return res.redirect('/login');  // User is not logged in, redirect to login page
  }
}


// Example of protected route
// Example of protected route
// For the home page
// app.get('/', isAuthenticated, (req, res) => {
//   res.render('home', { user: req.session.userId });  // Render the homepage or another page if logged in
// });

// // For user profile page
const { userviews } = require('./server/controllers/userController');

app.get('/user', isAuthenticated, userviews);

const { views } = require('./server/controllers/userController');

app.get('/result', isAuthenticated, views);

// // For result page
// app.get('/result', isAuthenticated, (req, res) => {
//   res.render('result', { user: req.session.userId });
// });

// // Redirect to login page if not logged in
// app.get('/login', (req, res) => {
//   if (req.session && req.session.userId) {
//     // If the user is already logged in, redirect them to /user (or /result)
//     return res.redirect('/user');
//   }
//   res.render('partials/login-form');  // Render the login page
// });



app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.redirect('/login');  // Redirect to login page after logout
  });
});

// app.get('/login', (req, res) => {
//   const isLoggedIn = true; // or false based on your authentication logic
//   res.render('partials/user', { isLoggedIn });
//  // res.render('partials/user',{ isLoggedIn });
// });

app.use('/', routes);

// app.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   // Simulate a successful signup
//   res.status(200).json({ message: 'Login successful' });
  
// });
// app.post('/signup', (req, res) => {
//   const { username, email, password } = req.body;

//   // Add your server-side logic to handle the signup (e.g., save to DB)
//   // For example, if validation fails, you can respond with an error
//   if (!username || !email || !password) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   // Simulate a successful signup
//   res.status(200).json({ message: 'Signup successful' });
// });


app.listen(port, () => console.log(`Listening on port ${port}`));