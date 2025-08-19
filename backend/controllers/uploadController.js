const crypto = require('crypto');
const path = require('path');
const { FileMeta } = require('../models/mongo');

async function handleUpload(req, res) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const checksum = crypto.createHash('md5').update(file.buffer || '').digest('hex');
    const ownerId = req.currentUser?.id || 0;
    const scope = (req.body.type || 'general').toLowerCase();
    const record = await FileMeta.create({
      ownerId,
      scope,
      path: path.join('/uploads/general/', file.filename),
      sizeBytes: file.size,
      mimeType: file.mimetype,
      eventId: req.body.eventId ? parseInt(req.body.eventId) : undefined,
      teamId: req.body.teamId ? parseInt(req.body.teamId) : undefined,
      submissionId: req.body.submissionId,
      tags: [],
      checksum,
    });
    return res.status(201).json({ file: record });
  } catch (err) {
    console.error('Upload save error:', err);
    return res.status(500).json({ message: 'Failed to save upload metadata' });
  }
}

module.exports = { handleUpload };


