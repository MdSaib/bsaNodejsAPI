import { Request, Response, NextFunction } from 'express';
import { File } from '../models/File';
import { Workflow } from '../models/Workflow';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const createFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, workflow } = req.body;

        // Create file
        const file = await File.create({
            title,
            description,
            initiatorId: req.user.id
        });

        // Create workflow
        if (workflow && workflow.length > 0) {
            await Workflow.create({
                fileId: file._id,
                steps: workflow.map((step: any, index: number) => ({
                    ...step,
                    stepNumber: index + 1
                }))
            });
        }

        res.status(201).json({
            status: 'success',
            data: { file }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, department, search } = req.query;

        // Build query
        const query: any = {};

        if (status) query.status = status;
        if (department) query['workflow.departmentId'] = department;
        if (search) {
            query.$or = [
                { fileNumber: new RegExp(search as string, 'i') },
                { title: new RegExp(search as string, 'i') }
            ];
        }

        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const files = await File.find(query)
            .skip(skip)
            .limit(limit)
            .populate('initiatorId', 'fullName')
            .sort('-createdAt');

        const total = await File.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: files.length,
            data: {
                files,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getFileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = await File.findById(req.params.id)
            .populate('initiatorId', 'fullName')
            .populate({
                path: 'documents.uploadedBy',
                select: 'fullName'
            });

        if (!file) {
            throw new AppError('File not found', 404);
        }

        // Get workflow
        const workflow = await Workflow.findOne({ fileId: file._id })
            .populate('steps.departmentId', 'name')
            .populate('steps.officerId', 'fullName');

        res.status(200).json({
            status: 'success',
            data: { file, workflow }
        });
    } catch (error) {
        next(error);
    }
};

export const updateFileStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, notes } = req.body;
        const file = await File.findById(req.params.id);

        if (!file) {
            throw new AppError('File not found', 404);
        }

        // Update file status
        file.status = status;
        await file.save();

        // Update workflow step if exists
        const workflow = await Workflow.findOne({ fileId: file._id });
        if (workflow) {
            const currentStep = workflow.steps.find(step => 
                step.officerId.toString() === req.user.id && 
                step.status === 'IN_PROGRESS'
            );

            if (currentStep) {
                currentStep.status = 'COMPLETED';
                currentStep.notes = notes;
                currentStep.completedAt = new Date();
                await workflow.save();

                // Move to next step if available
                const nextStep = workflow.steps.find(step => step.status === 'PENDING');
                if (nextStep) {
                    nextStep.status = 'IN_PROGRESS';
                    file.currentStep = nextStep.stepNumber;
                } else {
                    file.status = 'COMPLETED';
                }
                await file.save();
            }
        }

        res.status(200).json({
            status: 'success',
            data: { file }
        });
    } catch (error) {
        next(error);
    }
};

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            throw new AppError('File not found', 404);
        }

        if (!req.file) {
            throw new AppError('Please upload a file', 400);
        }

        // Add document to file
        file.documents.push({
            documentUrl: req.file.path,
            uploadedBy: req.user.id,
            documentType: req.file.mimetype,
            uploadDate: new Date()
        });

        await file.save();

        res.status(200).json({
            status: 'success',
            data: { file }
        });
    } catch (error) {
        next(error);
    }
};