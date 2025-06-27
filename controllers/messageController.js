// controllers/messageController.js
const pool = require('../db'); // your PostgreSQL pool instance

exports.getMessages = async (req, res) => {
  const { type, user_id, department_id } = req.query;

  try {
    if (type === 'private' && user_id) {
      // get private messages for user_id (sent or received)
      const query = `
        SELECT * FROM messages
        WHERE type = 'private' AND
          (sender_id = $1 OR receiver_id = $1)
        ORDER BY sent_at ASC
      `;
      const { rows } = await pool.query(query, [user_id]);
      return res.json(rows);

    } else if (type === 'department' && department_id) {
      // get department messages for department_id
      const query = `
        SELECT * FROM messages
        WHERE type = 'department' AND department_id = $1
        ORDER BY sent_at ASC
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
