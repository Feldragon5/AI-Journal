const express = require('express');
const router = express.Router();
const GeminiService = require('../services/gemini-service');
const storageService = require('../services/storage-service');

const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

// Generate questions based on entry excerpt
router.post('/questions', async (req, res) => {
  try {
    const { excerpt } = req.body;

    if (!excerpt || excerpt.trim().length < 10) {
      return res.status(400).json({ error: 'Entry excerpt too short' });
    }

    const questions = await geminiService.generateQuestions(excerpt);
    res.json({ questions });
  } catch (error) {
    console.error('AI questions error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Enhance entry for coherence
router.post('/enhance', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: 'Content too short to enhance' });
    }

    const settings = await storageService.getSettings();
    const writingStyle = settings.writingStyle || 'natural';

    const enhancedContent = await geminiService.enhanceEntry(content, writingStyle);
    res.json({ enhancedContent });
  } catch (error) {
    console.error('AI enhance error:', error);
    res.status(500).json({ error: 'Failed to enhance entry' });
  }
});

// Insert question answer into entry
router.post('/insert-answer', async (req, res) => {
  try {
    const { originalEntry, question, answer } = req.body;

    console.log('\n=== INSERT ANSWER REQUEST ===');
    console.log('Original Entry Length:', originalEntry?.length || 0);
    console.log('Question:', question);
    console.log('Answer:', answer);

    if (!originalEntry || !question || !answer) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (answer.trim().length < 2) {
      console.error('Answer too short');
      return res.status(400).json({ error: 'Answer too short' });
    }

    console.log('Calling geminiService.insertAnswer...');
    const updatedContent = await geminiService.insertAnswer(originalEntry, question, answer);

    console.log('✓ Success! Updated Content Length:', updatedContent?.length || 0);
    console.log('Updated Content Preview:', updatedContent?.substring(0, 100) + '...');

    res.json({ updatedContent });
  } catch (error) {
    console.error('✗ AI insert answer error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to insert answer: ' + error.message });
  }
});

// Get settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await storageService.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/settings', async (req, res) => {
  try {
    const settings = await storageService.updateSettings(req.body);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
