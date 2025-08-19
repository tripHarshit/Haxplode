const express = require('express');
const router = express.Router();

const {
  createSubmission,
  getSubmissionsByEvent,
  getSubmissionById,
  updateSubmission,
  getUserSubmissions,
  changeSubmissionStatus,
} = require('../controllers/submissionController');
const Submission = require('../models/mongo/Submission');
const { upload } = require('../middleware/uploadMiddleware');

const {
  authMiddleware,
  authorizeParticipant,
  authorizeOrganizerOrJudge,
} = require('../middleware/authMiddleware');

const {
  validateInput,
  submissionSchemas,
} = require('../middleware/validateInput');

// Public routes
router.get('/event/:eventId', getSubmissionsByEvent);
router.get('/:id', getSubmissionById);
// Reviews and summary
router.get('/:id/reviews', async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    return res.json({ reviews: sub.scores || [] });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});
router.get('/:id/summary', async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    const scores = sub.scores || [];
    // Weighted by event rounds if present
    const event = await require('../models/sql/Event').findByPk(sub.eventId);
    let avgScore;
    if (event?.rounds?.length) {
      let total = 0; let weightSum = 0;
      for (const rd of event.rounds) {
        const rdScores = scores.filter(sc => sc.roundId === rd.id);
        if (rdScores.length) {
          const avg = rdScores.reduce((sum, sc) => sum + (sc.score || 0), 0) / rdScores.length;
          total += avg * (rd.weight || 1);
          weightSum += (rd.weight || 1);
        }
      }
      avgScore = weightSum ? total / weightSum : 0;
    } else {
      avgScore = scores.length ? scores.reduce((s, r) => s + (r.score || 0), 0) / scores.length : 0;
    }
    return res.json({ reviewSummary: { avgScore: Math.round(avgScore * 100) / 100, totalReviews: scores.length } });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

// Submission file management
router.post('/:id/files', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const entry = { name: file.originalname, url: `/uploads/submissions/${file.filename}`, size: file.size, type: file.mimetype, uploadedAt: new Date() };
    sub.attachments.push(entry);
    await sub.save();
    return res.status(201).json({ file: entry });
  } catch (e) { return res.status(500).json({ message: 'Failed to upload file' }); }
});

router.delete('/:id/files', authMiddleware, async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    const { url } = req.body;
    sub.attachments = sub.attachments.filter(f => f.url !== url);
    await sub.save();
    return res.json({ ok: true });
  } catch (e) { return res.status(500).json({ message: 'Failed to delete file' }); }
});

// Protected routes
router.get('/user/submissions', authMiddleware, getUserSubmissions);

// Participant only routes
router.post('/', authMiddleware, authorizeParticipant, validateInput(submissionSchemas.create), createSubmission);
router.put('/:id', authMiddleware, authorizeParticipant, updateSubmission);

// Organizer/Judge only routes
router.patch('/:id/status', authMiddleware, authorizeOrganizerOrJudge, changeSubmissionStatus);

module.exports = router;
