const express = require('express');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');
const protectedRoute = require('./routes/protectedRoute');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.GAME_PORT || 53003;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Setup Handlebars as the view engine
app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: false, // Không sử dụng layout
    extname: '.hbs', // Đặt extension mặc định là .hbs
  })
);
app.set('view engine', 'handlebars');
app.set('views', './views');

// Routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Welcome to Tic-tac-toe Game' });
});

// Authentication route
app.post('/login', authController.login);

// Protected route
app.use('/protected', protectedRoute);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('home', { title: '404 - Page Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server Game is running on port ${PORT}`);
});
