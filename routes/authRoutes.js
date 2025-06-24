const express = require('express');
const router = express.Router();

const { loginUser, checkRoleUser } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/check-role', checkRoleUser);

module.exports = router;
