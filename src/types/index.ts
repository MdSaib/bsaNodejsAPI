export interface IUser {
    id: string;
    username: string;
    password: string;
    fullName: string;
    email: string;
    role: 'ADMIN' | 'OFFICER';
    departmentId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFile {
    id: string;
    fileNumber: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
    initiatorId: string;
    currentStep: number;
    documents: IDocument[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IWorkflow {
    id: string;
    fileId: string;
    steps: IWorkflowStep[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IWorkflowStep {
    stepNumber: number;
    departmentId: string;
    officerId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    notes?: string;
    completedAt?: Date;
}

export interface IDocument {
    id: string;
    fileId: string;
    documentUrl: string;
    uploadedBy: string;
    documentType: string;
    uploadDate: Date;
}