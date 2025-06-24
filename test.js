const { admin } = require('./firebase/firebaseConfig');

async function test() {
  try {
    // List users (just a quick check)
    const listUsersResult = await admin.auth().listUsers(10);
    console.log('Users:', listUsersResult.users.map(u => u.uid));
    console.log('Firebase Admin SDK initialized and connected!');
  } catch (error) {
    console.error('Firebase Admin SDK error:', error);
  }
}

test();
