// const express = require('express');
// const router = express.Router();
// const path = require('path');
// const multer = require('multer');
// const fs = require('fs');
// const { getMessages, sendVoiceMessage } = require('../controllers/messageTroller');

// const uploadDir = path.join(__dirname, '../uploads/audio');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//     cb(null, name);
//   }
// });

// const audioUpload = multer({ storage });

// router.get('/', getMessages);
// router.post('/send', audioUpload.single('file'), sendVoiceMessage);

// module.exports = router;
