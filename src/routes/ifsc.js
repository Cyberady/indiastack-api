const express = require('express');
const router = express.Router();
const { lookupIFSC } = require('../services/ifscService');
const { authMiddleware, deductCredit } = require('../middleware/auth');

router.get('/:ifsc', authMiddleware, async (req, res) => {
  try {
    const { data, fromCache } = await lookupIFSC(req.params.ifsc.toUpperCase());
    if (!fromCache) deductCredit(req);
    res.json({
      status: 'success',
      source: fromCache ? 'cache' : 'live',
      data,
      meta: {
        credits_used: fromCache ? 0 : 1,
        credits_remaining: req.user.credits
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

module.exports = router;