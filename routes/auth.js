const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { isAuthenticated } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            fitnessLevel,
            goals,
            profile
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: role || 'client',
            fitnessLevel,
            goals,
            profile
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-jwt-secret',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-jwt-secret',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Please authenticate' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(401).json({ error: 'Please authenticate' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                fitnessLevel: user.fitnessLevel,
                goals: user.goals,
                profile: user.profile
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
});

// Handle registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user object based on role
        const userData = {
            name,
            email,
            password: hashedPassword,
            role: role || 'client'
        };

        // Add role-specific fields
        if (role === 'client') {
            userData.fitnessGoals = req.body.fitnessGoals;
        } else if (role === 'trainer') {
            userData.specialization = req.body.specialization;
            userData.certification = req.body.certification;
        } else if (role === 'partner') {
            userData.labName = req.body.labName;
            userData.services = req.body.services;
        }

        // Save user
        user = await User.create(userData);

        // Set success message and redirect to login
        req.flash('success', 'You have successfully registered. Please Sign In');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred during registration');
        res.redirect('/auth/register');
    }
});

// Success page route
router.get('/success', (req, res) => {
    res.render('auth/success', {
        title: 'Registration Successful - RevibeFit',
        layout: false // This will prevent using the main layout with navigation
    });
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

// Render registration page
router.get('/register', (req, res) => {
    res.render('auth/register', { 
        title: 'Register - RevibeFit',
        messages: { error: req.flash('error') },
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
        res.redirect('/');
    });
});

module.exports = router; 