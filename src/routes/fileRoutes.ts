import express from 'express';
import multer from 'multer';
import {
    createFile,
    getAllFiles,
    getFileById,
    updateFileStatus,
    uploadDocument
} from '../controllers/fileController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}`);
    }
});

const upload = multer({ storage });

// Protect all routes
router.use(protect);

router.route('/')
    .post(createFile)
    .get(getAllFiles);

router.route('/:id')
    .get(getFileById)
    .patch(updateFileStatus);

router.post('/:id/documents', upload.single('document'), uploadDocument);

export default router;