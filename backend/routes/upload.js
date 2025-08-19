const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const { handleUpload } = require('../controllers/uploadController');

router.post('/', authMiddleware, upload.single('file'), handleUpload, handleUploadError);

module.exports = router;


