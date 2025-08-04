const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const staffController = require('../controllers/staffController');

// ✅ Setup multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/images'));  // ✅ store in /public/uploads/images
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ✅ ROUTES
router.post('/invite', staffController.sendInvite);

router.get('/profile', staffController.getStaffProfile);
router.get('/all', staffController.getAllStaff);
router.get('/invite-info', staffController.getInviteInfo);
router.post('/complete-registration', staffController.completeRegistration);

// ✅ Upload profile photo
router.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // ✅ Return the public image path
  const imageUrl = `/uploads/images/${req.file.filename}`;
  res.json({ photo_url: imageUrl });
});

module.exports = router;
