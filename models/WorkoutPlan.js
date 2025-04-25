const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sets: {
        type: Number,
        required: true
    },
    reps: {
        type: Number,
        required: true
    },
    weight: Number,
    duration: Number, // in minutes
    restPeriod: Number, // in seconds
    equipment: [String],
    instructions: String,
    videoUrl: String,
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    }
});

const workoutSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    exercises: [exerciseSchema],
    duration: Number, // total duration in minutes
    caloriesBurn: Number,
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    type: {
        type: String,
        enum: ['strength', 'cardio', 'flexibility', 'hiit', 'yoga']
    }
});

const workoutPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    goal: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'general_wellness'],
        required: true
    },
    duration: {
        type: Number,
        required: true // duration in weeks
    },
    schedule: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        workouts: [workoutSchema]
    }],
    progress: [{
        date: Date,
        completed: Boolean,
        feedback: String,
        difficulty: Number, // 1-5 rating
        actualDuration: Number // in minutes
    }],
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    equipmentNeeded: [String],
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    tags: [String],
    isTemplate: {
        type: Boolean,
        default: false
    },
    metrics: {
        completionRate: Number,
        averageDifficulty: Number,
        totalWorkouts: Number,
        totalMinutes: Number
    }
}, {
    timestamps: true
});

// Method to calculate completion rate
workoutPlanSchema.methods.calculateMetrics = function() {
    const completedWorkouts = this.progress.filter(p => p.completed).length;
    const totalWorkouts = this.schedule.reduce((acc, day) => acc + day.workouts.length, 0);
    
    this.metrics = {
        completionRate: (completedWorkouts / totalWorkouts) * 100,
        averageDifficulty: this.progress.reduce((acc, p) => acc + p.difficulty, 0) / this.progress.length,
        totalWorkouts: totalWorkouts,
        totalMinutes: this.progress.reduce((acc, p) => acc + (p.actualDuration || 0), 0)
    };
    
    return this.metrics;
};

// Pre-save middleware to update metrics
workoutPlanSchema.pre('save', function(next) {
    if (this.progress.length > 0) {
        this.calculateMetrics();
    }
    next();
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
module.exports = WorkoutPlan; 