const express = require('express');
const router = express.Router();
const storageService = require('../services/storage-service');

// Get all entries
router.get('/', async (req, res) => {
  try {
    const entries = await storageService.getAllEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Get entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await storageService.getEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Get entry by date
router.get('/date/:date', async (req, res) => {
  try {
    const entry = await storageService.getEntryByDate(req.params.date);
    if (!entry) {
      return res.status(404).json({ error: 'No entry found for this date' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Get entries by date range
router.get('/range/:start/:end', async (req, res) => {
  try {
    const entries = await storageService.getEntriesByDateRange(
      req.params.start,
      req.params.end
    );
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Search entries
router.get('/search/:query', async (req, res) => {
  try {
    const entries = await storageService.searchEntries(req.params.query);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search entries' });
  }
});

// Create new entry
router.post('/', async (req, res) => {
  try {
    const entry = await storageService.createEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Update entry
router.put('/:id', async (req, res) => {
  try {
    const entry = await storageService.updateEntry(req.params.id, req.body);
    res.json(entry);
  } catch (error) {
    if (error.message === 'Entry not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete entry
router.delete('/:id', async (req, res) => {
  try {
    await storageService.deleteEntry(req.params.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Entry not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
