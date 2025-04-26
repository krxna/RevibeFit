const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['client', 'trainer', 'partner', 'admin'],
        default: 'client'
    },
    fitnessLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    goals: {
        type: [String],
        default: ['general_wellness']
    },
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
        }],
        clients: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    partnerData: {
        partnerId: String,
        businessName: {
            type: String,
            required: function() { return this.role === 'partner'; }
        },
        businessAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        testTypes: [{
            name: String,
            description: String,
            price: Number,
            duration: Number // in minutes
        }],
        operatingHours: [{
            day: String,
            open: String,
            close: String,
            isClosed: Boolean
        }],
        contactInfo: {
            phone: String,
            alternateEmail: String,
            website: String
        },
        services: [{
            name: String,
            description: String,
            price: Number
        }],
        clients: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        ratings: {
            average: {
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
                date: {
                    type: Date,
                    default: Date.now
                }
            }]
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        documents: [{
            type: String,
            name: String,
            url: String,
            uploadDate: Date
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now
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
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
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