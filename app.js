const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoute');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

const PORT = ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
