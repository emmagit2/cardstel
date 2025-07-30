const path = require('path');
const pool = require('../db');

// ✅ SEND TEXT MESSAGE
exports.sendTextMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, department_id, content } = req.body;

    if (!content || !sender_id || (!receiver_id && !department_id)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chatType = department_id ? 'department' : 'private';

    const insertQuery = `
      INSERT INTO messages (sender_id, receiver_id, department_id, chat_type, content, message_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      sender_id,
      receiver_id || null,
      department_id || null,
      chatType,
      content.trim(),
      'text'
    ];

    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('❌ Send text message error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ GET MESSAGES (Private or Department)
exports.getMessages = async (req, res) => {
  const { type, user_id, department_id } = req.query;

  try {
    let query = '';
    let values = [];

    if (type === 'private' && user_id) {
      query = `
        SELECT 
          m.*, 
          u.name AS sender_name,
          encode(u.profile_picture, 'base64') AS sender_profile
        FROM messages m
        LEFT JOIN users u ON u.id = m.sender_id
        WHERE m.chat_type = 'private'
          AND (m.sender_id = $1 OR m.receiver_id = $1)
        ORDER BY m.sent_at ASC
      `;
      values = [user_id];

    } else if (type === 'department' && department_id) {
      query = `
        SELECT 
          m.*, 
          u.name AS sender_name,
          encode(u.profile_picture, 'base64') AS sender_profile
        FROM messages m
        LEFT JOIN users u ON u.id = m.sender_id
        WHERE m.chat_type = 'department'
          AND m.department_id = $1
        ORDER BY m.sent_at ASC
      `;
      values = [department_id];

    } else {
      return res.status(400).json({ error: 'Missing or invalid parameters' });
    }

    const { rows } = await pool.query(query, values);
    res.status(200).json(rows);

  } catch (err) {
    console.error('❌ Get messages error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ SEND VOICE MESSAGE
exports.sendVoiceMessage = async (req, res) => {
  try {
    const file = req.file;
    const { sender_id, receiver_id, department_id, message_type } = req.body;

    if (!file || !sender_id || (!receiver_id && !department_id)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chatType = department_id ? 'department' : 'private';
    const fileUrl = `/uploads/audio/${file.filename}`;
    const fileType = file.mimetype;
    const fileName = file.originalname;

    const insertQuery = `
      INSERT INTO messages (
        sender_id, receiver_id, department_id, chat_type, 
        content, file_url, file_type, file_name, message_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      sender_id,
      receiver_id || null,
      department_id || null,
      chatType,
      '[Voice message]',
      fileUrl,
      fileType,
      fileName,
      message_type || 'voice'
    ];

    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({
      ...rows[0],
      file_url: fileUrl,
      file_type: fileType,
      file_name: fileName
    });

  } catch (err) {
    console.error('❌ Send voice message error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ SEND IMAGE MESSAGE
exports.sendImageMessage = async (req, res) => {
  try {
    const file = req.file;
    const { sender_id, receiver_id, department_id } = req.body;

    if (!file || !sender_id || (!receiver_id && !department_id)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chatType = department_id ? 'department' : 'private';
    const fileUrl = `/uploads/images/${file.filename}`;
    const fileType = file.mimetype;
    const fileName = file.originalname;

    const insertQuery = `
      INSERT INTO messages (
        sender_id, receiver_id, department_id, chat_type, 
        content, file_url, file_type, file_name, message_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      sender_id,
      receiver_id || null,
      department_id || null,
      chatType,
      '[Image message]',
      fileUrl,
      fileType,
      fileName,
      'image'
    ];

    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({
      ...rows[0],
      file_url: fileUrl,
      file_type: fileType,
      file_name: fileName
    });

  } catch (err) {
    console.error('❌ Send image message error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// In controllers/messageTroller.js or wherever your controllers are

// ✅ SEND FILE MESSAGE (Documents, PDFs, etc)
exports.sendFileMessage = async (req, res) => {
  try {
    const file = req.file;
    const { sender_id, receiver_id, department_id } = req.body;

    if (!file || !sender_id || (!receiver_id && !department_id)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chatType = department_id ? 'department' : 'private';
    const fileUrl = `/uploads/files/${file.filename}`;
    const fileType = file.mimetype;
    const fileName = file.originalname;

    const insertQuery = `
      INSERT INTO messages (
        sender_id, receiver_id, department_id, chat_type, 
        content, file_url, file_type, file_name, message_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      sender_id,
      receiver_id || null,
      department_id || null,
      chatType,
      '[File message]',
      fileUrl,
      fileType,
      fileName,
      'file' // message_type for documents/files
    ];

    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({
      ...rows[0],
      file_url: fileUrl,
      file_type: fileType,
      file_name: fileName
    });

  } catch (err) {
    console.error('❌ Send file message error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
