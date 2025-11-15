import express from 'express';

const router = express.Router();

// Placeholder route - will implement safe locations later
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'locations' });
});

export default router;