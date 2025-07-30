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
      const { content, chat_type, receiver_id } = data;

      // Simple validation
      if (!content || !chat_type || (chat_type === 'private' && !receiver_id)) {
        console.warn('❌ Invalid chat message payload received');
        return;
      }

      try {
        // Save to database
        await db.query(
          `INSERT INTO messages (sender_id, receiver_id, department_id, content, chat_type)
           VALUES ($1, $2, $3, $4, $5)`,
          [socket.dbUserId, receiver_id, socket.departmentId, content, chat_type]
        );

        const msg = {
          sender_id: socket.dbUserId,
          receiver_id,
          content,
          chat_type,
          sender_name: socket.senderName || 'Unknown',
          sent_at: new Date().toISOString()
        };

        if (chat_type === 'private') {
          // ✅ Emit only to the receiver
          if (receiver_id !== socket.dbUserId) {
            io.to(`user_${receiver_id}`).emit('chat message', msg);
          }
        } else if (chat_type === 'department') {
          io.to(`department_${socket.departmentId}`).emit('chat message', msg);
        } else {
          io.emit('chat message', msg); // fallback (e.g., global)
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
