const admin = require('firebase-admin');

let serviceAccount;

if (process.env.NODE_ENV === 'production') {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
  // for local development
  serviceAccount = require('../config/firebase-admin.json');
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };




