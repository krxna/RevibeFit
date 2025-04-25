const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['yoga', 'hiit', 'strength', 'cardio', 'dance', 'meditation'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true // in minutes
    },
    maxParticipants: {
        type: Number,
        required: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: Date,
        leftAt: Date,
        feedback: {
            rating: Number,
            comment: String
        }
    }],
    equipment: [String],
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    videoRoom: {
        roomId: String,
        dailyCoUrl: String
    },
    chat: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    recording: {
        available: {
            type: Boolean,
            default: false
        },
        url: String,
        duration: Number
    },
    metrics: {
        averageRating: Number,
        participantCount: Number,
        completionRate: Number // percentage of participants who stayed for the full duration
    }
}, {
    timestamps: true
});

// Method to check if class is full
liveClassSchema.methods.isFull = function() {
    return this.participants.length >= this.maxParticipants;
};

// Method to add participant
liveClassSchema.methods.addParticipant = function(userId) {
    if (this.isFull()) {
        throw new Error('Class is full');
    }
    
    if (this.participants.some(p => p.user.toString() === userId.toString())) {
        throw new Error('User already registered');
    }
    
    this.participants.push({
        user: userId,
        joinedAt: null,
        leftAt: null
    });
};

// Method to update metrics
liveClassSchema.methods.updateMetrics = function() {
    const ratings = this.participants
        .filter(p => p.feedback && p.feedback.rating)
        .map(p => p.feedback.rating);
    
    const completedParticipants = this.participants
        .filter(p => p.joinedAt && p.leftAt)
        .filter(p => {
            const attendanceDuration = p.leftAt - p.joinedAt;
            const requiredDuration = this.duration * 60 * 1000 * 0.8; // 80% of class duration
            return attendanceDuration >= requiredDuration;
        });
    
    this.metrics = {
        averageRating: ratings.length > 0 ? 
            ratings.reduce((a, b) => a + b) / ratings.length : 0,
        participantCount: this.participants.length,
        completionRate: (completedParticipants.length / this.participants.length) * 100
    };
};

// Pre-save middleware to update metrics
liveClassSchema.pre('save', function(next) {
    if (this.status === 'completed') {
        this.updateMetrics();
    }
    next();
});

const LiveClass = mongoose.model('LiveClass', liveClassSchema);
module.exports = LiveClass; 