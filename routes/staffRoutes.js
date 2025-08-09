const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const staffController = require('../controllers/staffController');

// ✅ Store staff images in /uploads/images/staff (NOT in /public)
const staffUploadDir = path.join(__dirname, '../uploads/images/staff');

// ✅ Ensure staff folder exists
if (!fs.existsSync(staffUploadDir)) {
  fs.mkdirSync(staffUploadDir, { recursive: true });
}

// ✅ Multer storage setup with custom filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, staffUploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.body.uid || 'unknown';
    const extension = path.extname(file.originalname).toLowerCase();

    // Format date and time
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS

    const newFilename = `${userId}_${date}_${time}${extension}`;

    // ✅ Delete old files for the same user
    const existingFiles = fs.readdirSync(staffUploadDir);
    existingFiles.forEach(file => {
      if (file.startsWith(userId)) {
        fs.unlinkSync(path.join(staffUploadDir, file));
      }
    });

    cb(null, newFilename);
  }
});

// ✅ Allow only image files
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, jpg, webp).'), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ Upload staff profile photo
router.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No valid image file uploaded' });
  }

  const imageUrl = `/uploads/images/staff/${req.file.filename}`;
  res.json({ photo_url: imageUrl });
});

// ✅ Staff routes
router.post('/invite', staffController.sendInvite);
router.get('/profile', staffController.getStaffProfile);
router.get('/all', staffController.getAllStaff);
router.get('/invite-info', staffController.getInviteInfo);
router.post('/complete-registration', staffController.completeRegistration);

module.exports = router;
