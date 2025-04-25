const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.render('index', {
        title: 'RevibeFit - Transform Your Life Through Fitness',
        user: req.user
    });
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About RevibeFit',
        user: req.user
    });
});

// Classes page
router.get('/classes', async (req, res) => {
    try {
        const LiveClass = require('../models/LiveClass');
        const upcomingClasses = await LiveClass.find({
            startTime: { $gt: new Date() },
            status: 'scheduled'
        })
        .populate('trainer', 'name')
        .sort({ startTime: 1 })
        .limit(10);

        res.render('classes', {
            title: 'Live Classes',
            user: req.user,
            classes: upcomingClasses
        });
    } catch (error) {
        res.status(500).render('error', {
            error: 'Failed to load classes'
        });
    }
});

// Trainers page
router.get('/trainers', async (req, res) => {
    try {
        const User = require('../models/User');
        const trainers = await User.find({
            role: 'trainer'
        })
        .select('name trainerData profile');

        res.render('trainers', {
            title: 'Our Trainers',
            user: req.user,
            trainers
        });
    } catch (error) {
        res.status(500).render('error', {
            error: 'Failed to load trainers'
        });
    }
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us',
        user: req.user
    });
});

// Contact form submission
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Here you would typically save the contact form to the database
        // and/or send an email notification
        
        res.json({
            success: true,
            message: 'Thank you for your message. We will get back to you soon.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

// Pricing page
router.get('/pricing', (req, res) => {
    const plans = [
        {
            name: 'Basic',
            price: 29.99,
            features: [
                'Access to workout library',
                'Basic nutrition guidance',
                'Community forum access'
            ]
        },
        {
            name: 'Pro',
            price: 49.99,
            features: [
                'Everything in Basic',
                'Live classes',
                'Personalized workout plans',
                'Progress tracking'
            ]
        },
        {
            name: 'Elite',
            price: 99.99,
            features: [
                'Everything in Pro',
                '1-on-1 trainer sessions',
                'Custom meal plans',
                'Priority support'
            ]
        }
    ];

    res.render('pricing', {
        title: 'Membership Plans',
        user: req.user,
        plans
    });
});

// Blog page
router.get('/blog', async (req, res) => {
    try {
        // Here you would typically fetch blog posts from the database
        const posts = []; // Placeholder for blog posts
        
        res.render('blog', {
            title: 'Fitness Blog',
            user: req.user,
            posts
        });
    } catch (error) {
        res.status(500).render('error', {
            error: 'Failed to load blog posts'
        });
    }
});

module.exports = router; 