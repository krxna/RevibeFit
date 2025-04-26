require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/Assets', express.static('Assets'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Session configuration
app.use(session({
    secret: 'revibefit-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// Make user and messages available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.messages = {
        error: req.flash('error'),
        success: req.flash('success')
    };
    next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/revibefit', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('join-class', (classId) => {
        socket.join(`class-${classId}`);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));

// API routes should be last and prefixed with /api
app.use('/api', express.json(), require('./routes/api'));

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        error: 'Page not found',
        title: '404 Not Found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        error: err.message || 'Something went wrong!',
        title: 'Error'
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 