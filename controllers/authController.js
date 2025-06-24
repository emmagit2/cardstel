const { admin } = require('../firebase/firebaseConfig'); // ✅ correct destructuring
const pool = require('../db');

// Login user and return user info + role
const loginUser = async (req, res) => {
  try {
    if (!admin.apps || admin.apps.length === 0) {
      return res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
    }

    const idToken = req.body.token;
    if (!idToken) return res.status(400).json({ error: 'Token not provided' });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found in database' });

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        uid: user.firebase_uid,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        profile_picture: user.profile_picture,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Check role endpoint for auth state check
const checkRoleUser = async (req, res) => {
  try {
    if (!admin.apps || admin.apps.length === 0) {
      return res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
    }

    const idToken = req.body.token;
    if (!idToken) return res.status(400).json({ error: 'Token not provided' });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    const result = await pool.query('SELECT role FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });

    const userRole = result.rows[0].role;

    return res.status(200).json({
      success: true,
      user: {
        role: userRole
      }
    });
  } catch (error) {
    console.error('Check role error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { loginUser, checkRoleUser };
