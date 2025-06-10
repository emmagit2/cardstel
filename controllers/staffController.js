const { db } = require('../firebase/firebaseConfig');
const bcrypt = require('bcrypt');

const staffLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const snapshot = await db.collection('users').where('email', '==', email).where('role', '==', 'staff').get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    if (!user.approved) {
      return res.status(403).json({ message: 'Staff not approved yet' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.json({ message: 'Login successful', staff: user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

module.exports = { staffLogin };
