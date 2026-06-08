const express = require('express');
const router = express.Router();
const { lookupPincode } = require('../services/pincodeService');
const { authMiddleware, deductCredit } = require('../middleware/auth');

router.get('/:pincode', authMiddleware, async (req, res) => {
  try {
    const { data, fromCache } = await lookupPincode(req.params.pincode);
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