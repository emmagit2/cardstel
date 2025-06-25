// sockets/chatSocket.js
const {admin } = require('../firebase/firebaseConfig');
const db = require('../db');

module.exports = function (io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      socket.firebase_uid = decoded.uid;

      const result = await db.query(
        'SELECT id, department_id FROM users WHERE firebase_uid = $1',
        [decoded.uid]
      );
      const user = result.rows[0];
      if (!user) return next(new Error('User not found in DB'));

      socket.dbUserId = user.id;
      socket.departmentId = user.department_id;

      socket.join(`user_${user.id}`);
      socket.join(`department_${user.department_id}`);
      next();
    } catch (err) {
      console.log("Socket Auth Error:", err.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.dbUserId}`);

    socket.on('chat message', async (data) => {
      const { content, type, receiver_id } = data;

      await db.query(
        `INSERT INTO messages (sender_id, receiver_id, department_id, content, type)
         VALUES ($1, $2, $3, $4, $5)`,
        [socket.dbUserId, receiver_id, socket.departmentId, content, type]
      );

      const msg = {
        sender_id: socket.dbUserId,
        content,
        type
      };

      if (type === 'private') {
        io.to(`user_${receiver_id}`).emit('chat message', msg);
      } else if (type === 'department') {
        io.to(`department_${socket.departmentId}`).emit('chat message', msg);
      } else {
        io.emit('chat message', msg);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.dbUserId}`);
    });
  });
};
