const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const LiveClass = require('../models/LiveClass');

// Middleware to protect all dashboard routes
router.use(auth);

// Client Dashboard
router.get('/client', authorize('client'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('clientData.currentPlan')
            .populate('clientData.upcomingClasses');

        const workoutPlans = await WorkoutPlan.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        const upcomingClasses = await LiveClass.find({
            'participants.user': req.user._id,
            startTime: { $gt: new Date() }
        })
        .populate('trainer', 'name')
        .sort({ startTime: 1 })
        .limit(3);

        res.render('dashboard/client', {
            title: 'Client Dashboard',
            user,
            workoutPlans,
            upcomingClasses
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Trainer Dashboard
router.get('/trainer', authorize('trainer'), async (req, res) => {
    try {
        const trainer = await User.findById(req.user._id)
            .populate('trainerData.reviews.user');

        const upcomingClasses = await LiveClass.find({
            trainer: req.user._id,
            startTime: { $gt: new Date() }
        }).sort({ startTime: 1 });

        const clients = await User.find({
            'clientData.currentPlan': { $in: await WorkoutPlan.find({ trainer: req.user._id }) }
        }).select('name email profile');

        res.render('dashboard/trainer', {
            title: 'Trainer Dashboard',
            trainer,
            upcomingClasses,
            clients
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Admin Dashboard
router.get('/admin', authorize('admin'), async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments(),
            totalClients: await User.countDocuments({ role: 'client' }),
            totalTrainers: await User.countDocuments({ role: 'trainer' }),
            totalClasses: await LiveClass.countDocuments()
        };

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10);

        const upcomingClasses = await LiveClass.find({
            startTime: { $gt: new Date() }
        })
        .populate('trainer')
        .sort({ startTime: 1 })
        .limit(5);

        res.render('dashboard/admin', {
            title: 'Admin Dashboard',
            stats,
            recentUsers,
            upcomingClasses
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Lab Dashboard
router.get('/lab', authorize('lab'), async (req, res) => {
    try {
        const lab = await User.findById(req.user._id);
        
        // Add lab-specific functionality here
        
        res.render('dashboard/lab', {
            title: 'Lab Dashboard',
            lab
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
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