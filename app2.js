const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const messageRoutes = require('./routes/messageRoutes'); // ✅ ensure filename matches

const initChatSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ MIDDLEWARES
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES
app.use(express.static('public')); // For frontend assets (if any)
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads')));

app.use('/uploads/audio', express.static(path.join(__dirname, 'uploads/audio'))); // ✅ Serve uploaded voice files

// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/messages', messageRoutes);

// ✅ VIEWS (HTML PAGES)
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views/auth.html')));
app.get('/admin2.html', (req, res) => res.sendFile(path.join(__dirname, 'views/admin2.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'views/admin.html')));
app.get('/staff-register', (req, res) => res.sendFile(path.join(__dirname, 'views/staffRegister.html')));
app.get('/staffdashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'views/staffdashboard.html')));

// ✅ SOCKET.IO INIT
initChatSocket(io);

// ✅ START SERVER
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
