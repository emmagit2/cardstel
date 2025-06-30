const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const messageRoutes = require('./routes/messageRoute');

const initChatSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://cardstel.onrender.com',  // Your frontend domain
  'http://localhost:5000'            // Optional: your local dev frontend
];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static('public'));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/messages', messageRoutes);

// Views
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views/auth.html')));
app.get('/admin2.html', (req, res) => res.sendFile(path.join(__dirname, 'views/admin2.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'views/admin.html')));
app.get('/staff-register', (req, res) => res.sendFile(path.join(__dirname, 'views/staffRegister.html')));
app.get('/staffdashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'views/staffdashboard.html')));

// Optional health check route
app.get('/', (req, res) => {
  res.send('🟢 Server is running.');
});

// Initialize Socket.IO logic
initChatSocket(io);

// Start server with dynamic port for Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
