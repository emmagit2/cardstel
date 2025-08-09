// sockets/chatSocket.js
const { admin } = require('../firebase/firebaseConfig');
const db = require('../db');

module.exports = function (io) {
  // Middleware for authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      socket.firebase_uid = decoded.uid;

      const result = await db.query(
        'SELECT id, department_id, name FROM users WHERE firebase_uid = $1',
        [decoded.uid]
      );

      const user = result.rows[0];
      if (!user) return next(new Error('User not found in DB'));

      socket.dbUserId = user.id;
      socket.departmentId = user.department_id;
      socket.senderName = user.name;

      socket.join(`user_${user.id}`);
      socket.join(`department_${user.department_id}`);

      next();
    } catch (err) {
      console.log("Socket Auth Error:", err.message);
      next(new Error('Authentication failed'));
    }
  });

  // On new connection
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.dbUserId}`);

    socket.on('chat message', async (data) => {
      const { content, chat_type, receiver_id, message_type } = data;

      // Basic validation
      if (!content || !chat_type || (chat_type === 'private' && !receiver_id)) {
        console.warn('❌ Invalid chat message payload received');
        return;
      }

      const allowedTypes = ['text', 'voice', 'file'];
      const msgType = allowedTypes.includes(message_type) ? message_type : 'text';

      try {
        // Save to database and return inserted message
        const result = await db.query(
          `INSERT INTO messages (sender_id, receiver_id, department_id, content, chat_type, message_type)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [socket.dbUserId, receiver_id, socket.departmentId, content, chat_type, msgType]
        );

        const message = result.rows[0];

        const msg = {
          id: message.id,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          department_id: message.department_id,
          content: message.content,
          chat_type: message.chat_type,
          message_type: message.message_type,
          sender_name: socket.senderName || 'Unknown',
          sent_at: message.sent_at,
        };

        if (chat_type === 'private') {
          // Send to both sender and receiver
          io.to(`user_${receiver_id}`).emit('chat message', msg);
          io.to(`user_${socket.dbUserId}`).emit('chat message', msg);
        } else if (chat_type === 'department') {
          io.to(`department_${socket.departmentId}`).emit('chat message', msg);
        } else {
          io.emit('chat message', msg); // fallback (global)
        }
      } catch (err) {
        console.error('💥 DB Insertion Error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❎ Socket disconnected: ${socket.dbUserId}`);
    });
  });
};
