const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || 
                     req.cookies.token;
        
        if (!token) {
            req.flash('error', 'Please log in to continue');
            return res.redirect('/auth/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            req.flash('error', 'Please log in to continue');
            return res.redirect('/auth/login');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        req.flash('error', 'Please log in to continue');
        res.redirect('/auth/login');
    }
};

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'Please log in to access this page');
    res.redirect('/auth/login');
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'Please log in to access this page');
            return res.redirect('/auth/login');
        }

        if (!roles.includes(req.session.user.role)) {
            req.flash('error', 'You are not authorized to access this page');
            return res.redirect('/');
        }

        next();
    };
};

module.exports = {
    auth,
    isAuthenticated,
    authorize
}; 