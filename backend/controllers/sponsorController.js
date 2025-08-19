const Sponsor = require('../models/sql/Sponsor');

// GET /api/sponsors (for current organizer)
async function listSponsors(req, res) {
  try {
    const organizerId = req.currentUser.id;
    const sponsors = await Sponsor.findAll({ where: { organizerId }, order: [['createdAt', 'DESC']] });
    return res.json({ sponsors });
  } catch (err) {
    console.error('List sponsors error:', err);
    return res.status(500).json({ message: 'Failed to fetch sponsors' });
  }
}

// POST /api/sponsors
async function createSponsor(req, res) {
  try {
    const organizerId = req.currentUser.id;
    const payload = { ...req.body, organizerId };
    const sponsor = await Sponsor.create(payload);
    return res.status(201).json({ sponsor });
  } catch (err) {
    console.error('Create sponsor error:', err);
    return res.status(500).json({ message: 'Failed to create sponsor' });
  }
}

// PUT /api/sponsors/:id
async function updateSponsor(req, res) {
  try {
    const organizerId = req.currentUser.id;
    const sponsor = await Sponsor.findByPk(req.params.id);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    if (sponsor.organizerId !== organizerId) return res.status(403).json({ message: 'Forbidden' });
    await sponsor.update(req.body);
    return res.json({ sponsor });
  } catch (err) {
    console.error('Update sponsor error:', err);
    return res.status(500).json({ message: 'Failed to update sponsor' });
  }
}

// DELETE /api/sponsors/:id
async function deleteSponsor(req, res) {
  try {
    const organizerId = req.currentUser.id;
    const sponsor = await Sponsor.findByPk(req.params.id);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    if (sponsor.organizerId !== organizerId) return res.status(403).json({ message: 'Forbidden' });
    await sponsor.destroy();
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete sponsor error:', err);
    return res.status(500).json({ message: 'Failed to delete sponsor' });
  }
}

module.exports = { listSponsors, createSponsor, updateSponsor, deleteSponsor };


