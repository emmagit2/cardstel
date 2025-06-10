const express = require('express');
const { addStaff, getDepartments } = require('../controllers/adminController');
const router = express.Router();

router.post('/add-staff', addStaff);
router.get('/departments', getDepartments);

module.exports = router;
