import User from "../models/user.model.js";
import Class from "../models/class.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        const [fitnessEnthusiasts, trainers, labPartners, totalClasses] = await Promise.all([
            User.countDocuments({ userType: "fitness_enthusiast" }),
            User.countDocuments({ userType: "trainer" }),
            User.countDocuments({ userType: "lab_partner" }),
            Class.countDocuments()
        ]);

        res.json({
            success: true,
            stats: {
                fitnessEnthusiasts,
                trainers,
                labPartners,
                totalClasses,
                totalUsers: fitnessEnthusiasts + trainers + labPartners
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch dashboard statistics" 
        });
    }
};

export const getFitnessGrowth = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        const now = new Date();
        const monthsAgo = new Date(now.setMonth(now.getMonth() - months));

        const users = await User.find({
            userType: "fitness_enthusiast",
            createdAt: { $gte: monthsAgo }
        }).sort({ createdAt: 1 });

        const monthlyData = new Array(months).fill(0);
        const labels = [];

        // Generate labels for the last X months
        for (let i = 0; i < months; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (months - 1 - i));
            labels.push(d.toLocaleString('default', { month: 'short' }));
        }

        // Count users per month
        users.forEach(user => {
            const monthIndex = months - 1 - Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24 * 30));
            if (monthIndex >= 0) {
                monthlyData[monthIndex]++;
            }
        });

        res.json({
            success: true,
            labels: labels,
            data: monthlyData
        });
    } catch (error) {
        console.error("Error fetching fitness growth data:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch fitness growth data"
        });
    }
};

export const getClassesGrowth = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        const now = new Date();
        const monthsAgo = new Date(now.setMonth(now.getMonth() - months));

        const classes = await Class.find({
            createdAt: { $gte: monthsAgo }
        }).sort({ createdAt: 1 });

        const monthlyData = new Array(months).fill(0);
        const labels = [];

        // Generate labels for the last X months
        for (let i = 0; i < months; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (months - 1 - i));
            labels.push(d.toLocaleString('default', { month: 'short' }));
        }

        // Count classes per month
        classes.forEach(cls => {
            const monthIndex = months - 1 - Math.floor((new Date() - cls.createdAt) / (1000 * 60 * 60 * 24 * 30));
            if (monthIndex >= 0) {
                monthlyData[monthIndex]++;
            }
        });

        res.json({
            success: true,
            labels: labels,
            data: monthlyData
        });
    } catch (error) {
        console.error("Error fetching classes growth data:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch classes growth data"
        });
    }
};

export const getFitnessUsers = async (req, res) => {
    try {
        const users = await User.find({ 
            userType: "fitness_enthusiast" 
        }).select('name email phone fitnessProfile createdAt');

        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error("Error fetching fitness users:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch fitness users"
        });
    }
};

export const getTrainersData = async (req, res) => {
    try {
        const trainers = await User.find({ 
            userType: "trainer" 
        }).select('name email trainerProfile');

        const trainersData = await Promise.all(trainers.map(async (trainer) => {
            const classesCount = await Class.countDocuments({ createdBy: trainer._id });
            const clientsCount = await Class.distinct('enrolledUsers', { createdBy: trainer._id });
            
            return {
                id: trainer._id,
                name: trainer.name,
                email: trainer.email,
                specialization: trainer.trainerProfile?.specialization || 'General Fitness',
                clients: clientsCount.length,
                classesTaken: classesCount,
                status: 'Active'
            };
        }));

        res.json({
            success: true,
            trainers: trainersData
        });
    } catch (error) {
        console.error("Error fetching trainers data:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch trainers data"
        });
    }
};

export const getLabPartnersData = async (req, res) => {
    try {
        const labPartners = await User.find({ 
            userType: "lab_partner" 
        }).select('name email phone labProfile status');

        res.json({
            success: true,
            labPartners: labPartners
        });
    } catch (error) {
        console.error("Error fetching lab partners data:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch lab partners data"
        });
    }
};