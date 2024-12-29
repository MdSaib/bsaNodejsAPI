import { Request, Response, NextFunction } from 'express';
import { Workflow } from '../models/Workflow';
import { File } from '../models/File';
import { AppError } from '../middleware/errorHandler';

export const updateWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { steps } = req.body;
        const workflow = await Workflow.findOne({ fileId: req.params.fileId });

        if (!workflow) {
            throw new AppError('Workflow not found', 404);
        }

        // Update workflow steps
        workflow.steps = steps.map((step: any, index: number) => ({
            ...step,
            stepNumber: index + 1
        }));

        await workflow.save();

        res.status(200).json({
            status: 'success',
            data: { workflow }
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentStep = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const workflow = await Workflow.findOne({ fileId: req.params.fileId })
            .populate('steps.departmentId', 'name')
            .populate('steps.officerId', 'fullName');

        if (!workflow) {
            throw new AppError('Workflow not found', 404);
        }

        const currentStep = workflow.steps.find(step => step.status === 'IN_PROGRESS');

        res.status(200).json({
            status: 'success',
            data: { currentStep }
        });
    } catch (error) {
        next(error);
    }
};