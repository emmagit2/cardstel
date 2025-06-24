const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Setup multer for uploads
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Routes
router.post('/invite', staffController.sendInvite);

// GET staff profile by Firebase UID
router.get('/profile', staffController.getStaffProfile);
router.get('/all', staffController.getAllStaff);
router.get('/invite-info', staffController.getInviteInfo);
router.post('/complete-registration', staffController.completeRegistration);
router.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ photo_url: `/uploads/${req.file.filename}` });
});

module.exports = router;
