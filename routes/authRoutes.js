const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { token, role } = req.body;

  // For now, just return success
  res.json({
    success: true,
    message: 'Login successful',
    role: role
  });
});

module.exports = router; // ✅ Export the router directly
