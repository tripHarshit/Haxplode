const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let subDir = 'general';
    
    if (file.fieldname === 'profilePicture') {
      subDir = 'profiles';
    } else if (file.fieldname === 'teamLogo') {
      subDir = 'teams';
    } else if (file.fieldname === 'eventCover') {
      subDir = 'events';
    } else if (file.fieldname === 'submission') {
      subDir = 'submissions';
    } else if (file.fieldname === 'announcement') {
      subDir = 'announcements';
    }
    
    const fullPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'text/plain': true,
    'video/mp4': true,
    'video/webm': true,
    'video/ogg': true,
    'application/zip': true,
    'application/x-rar-compressed': true,
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5, // Maximum 5 files
  }
});

// Specific upload configurations
const uploadConfigs = {
  // Single file uploads
  single: (fieldName) => upload.single(fieldName),
  
  // Multiple files uploads
  array: (fieldName, maxCount) => upload.array(fieldName, maxCount || 5),
  
  // Multiple fields with different file counts
  fields: (fields) => upload.fields(fields),
  
  // Profile picture upload
  profilePicture: upload.single('profilePicture'),
  
  // Team logo upload
  teamLogo: upload.single('teamLogo'),
  
  // Event cover upload
  eventCover: upload.single('eventCover'),
  
  // Submission files upload
  submission: upload.fields([
    { name: 'documentation', maxCount: 3 },
    { name: 'video', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 }
  ]),
  
  // Announcement attachments
  announcement: upload.array('attachments', 3),
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024) / (1024 * 1024)}MB`,
        type: 'FileSizeError'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded',
        type: 'FileCountError'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        type: 'FileFieldError'
      });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      type: 'FileTypeError'
    });
  }
  
  next(error);
};

// Utility function to get file URL
const getFileUrl = (filename, subDir = 'general') => {
  if (!filename) return null;
  return `/uploads/${subDir}/${filename}`;
};

// Utility function to delete file
const deleteFile = (filepath) => {
  if (filepath && fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
};

module.exports = {
  upload,
  uploadConfigs,
  handleUploadError,
  getFileUrl,
  deleteFile,
};
