const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ✅ Import controllers
const {
  getMessages,
  sendTextMessage,
  sendVoiceMessage,
  sendImageMessage,
   sendFileMessage,
} = require('../controllers/messageTroller');

// ✅ Ensure directory exists
function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ✅ Create dynamic multer storage
function createStorage(folderName) {
  const uploadPath = path.join(__dirname, `../uploads/${folderName}`);
  ensureDirSync(uploadPath);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

// ✅ Setup multer uploaders
const audioUpload = multer({ storage: createStorage('audio') });
const imageUpload = multer({ storage: createStorage('images') });
const fileUpload = multer({ storage: createStorage('files') });

// ✅ Message routes
router.get('/', getMessages);
router.post('/send-text', sendTextMessage);
router.post('/send/voice', audioUpload.single('file'), sendVoiceMessage);
router.post('/send/image', imageUpload.single('file'), sendImageMessage);
router.post('/send/file', fileUpload.single('file'), sendFileMessage);

module.exports = router;
