import mongoose, { Schema, Document } from 'mongoose';
import { IFile } from '../types';

export interface FileDocument extends IFile, Document {}

const fileSchema = new Schema({
    fileNumber: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'],
        default: 'PENDING'
    },
    initiatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentStep: {
        type: Number,
        default: 1
    },
    documents: [{
        documentUrl: String,
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        documentType: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Generate file number before saving
fileSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await mongoose.model('File').countDocuments();
        this.fileNumber = `FILE-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

export const File = mongoose.model<FileDocument>('File', fileSchema);