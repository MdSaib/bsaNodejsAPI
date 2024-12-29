import express from 'express';
import {
    updateWorkflow,
    getCurrentStep
} from '../controllers/workflowController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/:fileId')
    .put(authorize('ADMIN'), updateWorkflow)
    .get(getCurrentStep);

export default router;