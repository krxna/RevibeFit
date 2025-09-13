import express from 'express';
import { getDashboardStats, getFitnessGrowth, getClassesGrowth, getFitnessUsers, getTrainersData, getLabPartnersData } from '../Controllers/admin.controller.js';

const router = express.Router();

// Dashboard routes
router.get('/dashboard-stats', getDashboardStats);
router.get('/fitness-growth', getFitnessGrowth);
router.get('/classes-growth', getClassesGrowth);
router.get('/fitness-users', getFitnessUsers);
router.get('/trainers-data', getTrainersData);
router.get('/lab-partners', getLabPartnersData);

export default router;