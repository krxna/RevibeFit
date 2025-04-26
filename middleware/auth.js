const User = require('../models/User');

// Simple authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

// Simple role authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (req.session && req.session.user && roles.includes(req.session.user.role)) {
            return next();
        }
        res.redirect('/');
    };
};

module.exports = {
    isAuthenticated,
    authorize
}; 