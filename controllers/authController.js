const admin = require('firebase-admin');
const db = admin.firestore();

const loginUser = async (req, res) => {
  try {
    const idToken = req.body.token;

    if (!idToken) {
      return res.status(400).json({ error: 'Token not provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.status(200).json({ uid, ...userData }); // ✅ Always return JSON

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid or expired token' }); // ✅ Always return JSON
  }
};

module.exports = loginUser;
