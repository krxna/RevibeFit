const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const LiveClass = require('../models/LiveClass');

// Middleware to protect all API routes
router.use(auth);

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'profile', 'fitnessLevel', 'goals'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        const user = await User.findById(req.user._id);
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Workout Plans API
router.get('/workout-plans', async (req, res) => {
    try {
        const workoutPlans = await WorkoutPlan.find({
            user: req.user._id
        }).sort({ createdAt: -1 });
        res.json(workoutPlans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/workout-plans', authorize('trainer'), async (req, res) => {
    try {
        const workoutPlan = new WorkoutPlan({
            ...req.body,
            trainer: req.user._id
        });
        await workoutPlan.save();
        res.status(201).json(workoutPlan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/workout-plans/:id', authorize('trainer'), async (req, res) => {
    try {
        const workoutPlan = await WorkoutPlan.findOneAndUpdate(
            { _id: req.params.id, trainer: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!workoutPlan) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }

        res.json(workoutPlan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Live Classes API
router.get('/live-classes', async (req, res) => {
    try {
        const classes = await LiveClass.find({
            startTime: { $gt: new Date() }
        })
        .populate('trainer', 'name')
        .sort({ startTime: 1 });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/live-classes/:id/join', authorize('client'), async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id);
        
        if (!liveClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (liveClass.isFull()) {
            return res.status(400).json({ error: 'Class is full' });
        }

        liveClass.addParticipant(req.user._id);
        await liveClass.save();

        res.json(liveClass);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Progress Tracking API
router.get('/progress', authorize('client'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user.clientData.progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/progress', authorize('client'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.clientData.progress.push(req.body);
        await user.save();
        res.status(201).json(user.clientData.progress);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Trainer Reviews API
router.post('/trainers/:id/reviews', authorize('client'), async (req, res) => {
    try {
        const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' });
        
        if (!trainer) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        trainer.trainerData.reviews.push({
            user: req.user._id,
            rating: req.body.rating,
            comment: req.body.comment,
            date: new Date()
        });

        await trainer.save();
        res.status(201).json(trainer.trainerData.reviews);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Search API
router.get('/search/trainers', async (req, res) => {
    try {
        const { specialization, rating } = req.query;
        const query = { role: 'trainer' };

        if (specialization) {
            query['trainerData.specializations'] = specialization;
        }

        if (rating) {
            query['trainerData.rating'] = { $gte: parseFloat(rating) };
        }

        const trainers = await User.find(query)
            .select('name trainerData profile')
            .sort({ 'trainerData.rating': -1 });

        res.json(trainers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/search/classes', async (req, res) => {
    try {
        const { type, difficulty, date } = req.query;
        const query = { startTime: { $gt: new Date() } };

        if (type) {
            query.type = type;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (date) {
            const searchDate = new Date(date);
            query.startTime = {
                $gte: searchDate,
                $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
            };
        }

        const classes = await LiveClass.find(query)
            .populate('trainer', 'name')
            .sort({ startTime: 1 });

        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 