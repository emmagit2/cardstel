// controllers/messageController.js
const pool = require('../db'); // your PostgreSQL pool instance
exports.getMessages = async (req, res) => {
  const { type, user_id, department_id } = req.query;

  try {
    if (type === 'private' && user_id) {
      const query = `
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
      const { rows } = await pool.query(query, [user_id]);
      return res.json(rows);

    } else if (type === 'department' && department_id) {
      const query = `
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
      const { rows } = await pool.query(query, [department_id]);
      return res.json(rows);

    } else {
      return res.status(400).json({ error: 'Missing or invalid parameters' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
