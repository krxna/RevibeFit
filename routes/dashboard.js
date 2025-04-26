const express = require('express');
const router = express.Router();
const { isAuthenticated, authorize } = require('../middleware/auth');
const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const LiveClass = require('../models/LiveClass');

// Middleware to protect all dashboard routes
router.use(isAuthenticated);

// Client Dashboard
router.get('/client', authorize('client'), async (req, res) => {
    try {
        // Fetch user data from MongoDB
        const userData = await User.findById(req.session.user.id);
        
        if (!userData) {
            return res.redirect('/auth/login');
        }

        res.render('dashboard/client', {
            title: 'Client Dashboard',
            user: req.session.user,
            userData: userData // Pass the MongoDB data to the view
        });
    } catch (error) {
        console.error('Client dashboard error:', error);
        res.redirect('/auth/login');
    }
});

// Trainer Dashboard
router.get('/trainer', authorize('trainer'), async (req, res) => {
    try {
        // Fetch user data from MongoDB
        const userData = await User.findById(req.session.user.id);
        
        if (!userData) {
            return res.redirect('/auth/login');
        }

        res.render('dashboard/trainer', {
            title: 'Trainer Dashboard',
            user: req.session.user,
            userData: userData // Pass the MongoDB data to the view
        });
    } catch (error) {
        console.error('Trainer dashboard error:', error);
        res.redirect('/auth/login');
    }
});

// Partner Dashboard
router.get('/partner', authorize('partner'), async (req, res) => {
    try {
        // Fetch user data from MongoDB
        const userData = await User.findById(req.session.user.id);
        
        if (!userData) {
            return res.redirect('/auth/login');
        }

        res.render('dashboard/partner', {
            title: 'Partner Dashboard',
            user: req.session.user,
            userData: userData // Pass the MongoDB data to the view
        });
    } catch (error) {
        console.error('Partner dashboard error:', error);
        res.redirect('/auth/login');
    }
});

// Admin Dashboard
router.get('/admin', authorize('admin'), async (req, res) => {
    try {
        // Fetch user data from MongoDB
        const userData = await User.findById(req.session.user.id);
        
        if (!userData) {
            return res.redirect('/auth/login');
        }

        res.render('dashboard/admin', {
            title: 'Admin Dashboard',
            user: req.session.user,
            userData: userData // Pass the MongoDB data to the view
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.redirect('/auth/login');
    }
});

// Workout Plan Management
router.post('/workout-plans', authorize('client', 'trainer'), async (req, res) => {
    try {
        const workoutPlan = new WorkoutPlan({
            ...req.body,
            user: req.user._id
        });
        await workoutPlan.save();
        res.status(201).json(workoutPlan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Live Class Management
router.post('/live-classes', authorize('trainer'), async (req, res) => {
    try {
        const liveClass = new LiveClass({
            ...req.body,
            trainer: req.user._id
        });
        await liveClass.save();
        res.status(201).json(liveClass);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Progress Tracking
router.post('/progress', authorize('client'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.clientData.progress.push(req.body);
        await user.save();
        res.json(user.clientData.progress);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User Management (Admin only)
router.get('/users', authorize('admin'), async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 