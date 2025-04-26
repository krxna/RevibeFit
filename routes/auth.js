const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { isAuthenticated } = require('../middleware/auth');
const crypto = require('crypto');

// Generate CSRF token
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Render registration page
router.get('/register', (req, res) => {
    // Generate a new CSRF token for each request
    const csrfToken = crypto.randomBytes(32).toString('hex');
    // Store the token in the session
    req.session.csrfToken = csrfToken;
    
    res.render('auth/register', { 
        title: 'Register - RevibeFit',
        messages: { 
            error: req.flash('error'),
            success: req.flash('success')
        },
        csrfToken: csrfToken,
        layout: false
    });
});

// Handle registration
router.post('/register', async (req, res) => {
    try {
        // Validate CSRF token
        if (!req.body._csrf || req.body._csrf !== req.session.csrfToken) {
            req.flash('error', 'Invalid form submission');
            return res.redirect('/auth/register');
        }

        const { name, email, password, role, fitnessLevel, fitnessGoals, specialization, certification, labName, services } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            req.flash('error', 'All fields are required');
            return res.redirect('/auth/register');
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            req.flash('error', 'Email already registered');
            return res.redirect('/auth/register');
        }

        // Create base user object
        const userData = {
            name,
            email,
            password,
            role: role || 'client',
            fitnessLevel: fitnessLevel || 'beginner'
        };

        // Add role-specific fields
        if (role === 'client' || !role) {
            userData.goals = fitnessGoals ? [fitnessGoals] : ['general_wellness'];
        } else if (role === 'trainer') {
            if (!specialization || !certification) {
                req.flash('error', 'Specialization and certification are required for trainers');
                return res.redirect('/auth/register');
            }
            userData.trainerData = {
                specializations: [specialization],
                certifications: [certification]
            };
        } else if (role === 'partner') {
            if (!labName || !services) {
                req.flash('error', 'Lab name and services are required for partners');
                return res.redirect('/auth/register');
            }
            userData.partnerData = {
                partnerId: labName,
                businessName: labName,
                testTypes: services.split(',').map(s => ({ name: s.trim() }))
            };
        }

        // Save user
        user = await User.create(userData);

        // Set success message and redirect to login
        req.flash('success', 'Registration successful! Please log in with your credentials. <a href="/auth/login" class="font-medium text-green-600 hover:text-green-500">Click here to login</a>');
        res.redirect('/auth/register');
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            const errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
            req.flash('error', errorMessage);
        } else {
            req.flash('error', 'An error occurred during registration');
        }
        res.redirect('/auth/register');
    }
});

// Render login page
router.get('/login', (req, res) => {
    res.render('auth/login', { 
        title: 'Login - RevibeFit',
        messages: { 
            error: req.flash('error'),
            success: req.flash('success')
        },
        layout: false
    });
});

// Handle login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            req.flash('error', 'Email and password are required');
            return res.redirect('/auth/login');
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Set user session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Redirect based on role
        switch (user.role) {
            case 'admin':
                res.redirect('/dashboard/admin');
                break;
            case 'trainer':
                res.redirect('/dashboard/trainer');
                break;
            case 'partner':
                res.redirect('/dashboard/partner');
                break;
            default:
                res.redirect('/dashboard/client');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/auth/login');
    }
});

// Handle logout
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/');
    });
});

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
    try {
        if (!req.session.user) {
            req.flash('error', 'Please log in to continue');
            return res.redirect('/auth/login');
        }
        res.redirect('/dashboard/' + req.session.user.role);
    } catch (error) {
        req.flash('error', 'Please log in to continue');
        res.redirect('/auth/login');
    }
});

module.exports = router; 