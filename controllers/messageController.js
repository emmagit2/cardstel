const path = require('path');
const pool = require('../db');

// GET messages (private or department)
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
        WHERE m.type = 'private'
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
        WHERE m.type = 'department'
          AND m.department_id = $1
        ORDER BY m.sent_at ASC
      `;
      values = [department_id];
    } else {
      return res.status(400).json({ error: 'Missing or invalid parameters' });
    }

    const { rows } = await pool.query(query, values);
    res.json(rows);

  } catch (err) {
    console.error('Get message error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// SEND voice message (audio upload)
exports.sendVoiceMessage = async (req, res) => {
  try {
    const file = req.file;
    const { sender_id, receiver_id, department_id, message_type } = req.body;

    if (!file || !sender_id || (!receiver_id && !department_id)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fileUrl = `/uploads/audio/${file.filename}`;
    const fileType = file.mimetype;
    const fileName = file.originalname;

    const chatType = department_id ? 'department' : 'private';

    const insertQuery = `
      INSERT INTO messages (sender_id, receiver_id, department_id, type, content, file_url, file_type, file_name, message_type)
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

    res.json({
      ...rows[0],
      file_url: fileUrl,
      file_type: fileType,
      file_name: fileName
    });

  } catch (err) {
    console.error('Send voice error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
