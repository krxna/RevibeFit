const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'trainer', 'admin', 'lab'],
        default: 'client'
    },
    fitnessLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: function() { return this.role === 'client'; }
    },
    goals: [{
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'general_wellness'],
        required: function() { return this.role === 'client'; }
    }],
    profile: {
        height: Number,
        weight: Number,
        age: Number,
        gender: String,
        medicalConditions: [String],
        equipmentAvailable: [String]
    },
    clientData: {
        currentPlan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WorkoutPlan'
        },
        progress: [{
            date: Date,
            weight: Number,
            bodyFat: Number,
            measurements: {
                chest: Number,
                waist: Number,
                hips: Number,
                arms: Number,
                legs: Number
            }
        }],
        upcomingClasses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LiveClass'
        }]
    },
    trainerData: {
        specializations: [String],
        certifications: [String],
        experience: Number,
        rating: {
            type: Number,
            default: 0
        },
        reviews: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            rating: Number,
            comment: String,
            date: Date
        }],
        earnings: {
            type: Number,
            default: 0
        },
        schedule: [{
            day: String,
            slots: [{
                startTime: String,
                endTime: String,
                isBooked: Boolean
            }]
        }]
    },
    labData: {
        partnerId: String,
        testTypes: [String],
        location: {
            address: String,
            coordinates: {
                lat: Number,
                lng: Number
            }
        }
    }
}, {
    timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate BMR
userSchema.methods.calculateBMR = function() {
    const { weight, height, age, gender } = this.profile;
    if (!weight || !height || !age || !gender) return null;
    
    // BMR formula: 10 × weight + 6.25 × height - 5 × age + 5
    const bmr = 10 * weight + 6.25 * height - 5 * age;
    return gender.toLowerCase() === 'male' ? bmr + 5 : bmr - 161;
};

const User = mongoose.model('User', userSchema);
module.exports = User; 