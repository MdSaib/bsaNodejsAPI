import mongoose, { Schema, Document } from 'mongoose';
import { IWorkflow } from '../types';

export interface WorkflowDocument extends IWorkflow, Document {}

const workflowSchema = new Schema({
    fileId: {
        type: Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    steps: [{
        stepNumber: {
            type: Number,
            required: true
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        officerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
            default: 'PENDING'
        },
        notes: String,
        completedAt: Date
    }]
}, {
    timestamps: true
});

export const Workflow = mongoose.model<WorkflowDocument>('Workflow', workflowSchema);