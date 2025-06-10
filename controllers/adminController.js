const { db } = require('../firebase/firebaseConfig');
const bcrypt = require('bcrypt');

const addStaff = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Check if staff already exists
    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(400).json({ message: 'Staff already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const docRef = await db.collection('users').add({
      name,
      email,
      role: 'staff',
      approved: false,
      department,
      password: hashedPassword,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Staff added successfully', id: docRef.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add staff', error: err.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = [];
    const snapshot = await db.collection('departments').get();
    snapshot.forEach(doc => departments.push({ id: doc.id, ...doc.data() }));

    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
};

module.exports = { addStaff, getDepartments };
