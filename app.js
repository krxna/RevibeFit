const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'strict',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
    },
    name: 'sessionId', // Change from default 'connect.sid'
    rolling: true, // Resets expiration on every response
    unset: 'destroy'
}));

// Flash messages
app.use(flash());

// Register routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Welcome to RevibeFit',
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 