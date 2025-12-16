import express from 'express';
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocumnet,
    updateDocumnet,
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocumnet);
router.put('/:id', updateDocumnet);

export default router;

