const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes'); // ✅ should export an Express Router

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // serve static files like CSS

// Use routes
app.use('/api/auth', authRoutes); // ✅ correct usage

// Serve HTML views
const path = require('path');
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views/auth.html')));
app.get('/admin2.html', (req, res) => res.sendFile(path.join(__dirname, 'views/admin2.html')));
app.get('/staff-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views/staffDashboard.html')));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
