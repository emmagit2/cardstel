const pool = require('../db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// === 1. Admin Sends Invite ===
exports.sendInvite = async (req, res) => {
  const { email, role, department_id } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role required' });
  }

  try {
    const existing = await pool.query(`
      SELECT * FROM staff_invites 
      WHERE email = $1 AND used = false 
      ORDER BY created_at DESC LIMIT 1
    `, [email]);

    let token;

    if (existing.rowCount > 0) {
      token = existing.rows[0].token;
    } else {
      token = crypto.randomBytes(32).toString('hex');
      await pool.query(`
        INSERT INTO staff_invites(email, role, department_id, token, invited_by)
        VALUES ($1, $2, $3, $4, $5)
      `, [email, role, department_id || null, token, 1]); // 1 = system/admin user
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const link = `${baseUrl}/staff-register?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'basseyanikan22@gmail.com',
        pass: 'eeef bsly lemd irge', // ⚠️ move to .env before production
      },
    });

    await transporter.sendMail({
      from: 'basseyanikan22@gmail.com',
      to: email,
      subject: 'Staff Registration Invitation',
      html: `<p>You were invited to register. <a href="${link}">Click here</a> to complete your registration.</p>`
    });

    res.json({ message: 'Invitation sent!' });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ message: 'Failed to send invite', error: err.message });
  }
};

// === 2. Staff Completes Registration ===
exports.completeRegistration = async (req, res) => {
  const { full_name, username, email, firebase_uid, photo_url, token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Missing token' });
  }

  try {
    const invite = await pool.query(
      'SELECT * FROM staff_invites WHERE token = $1 AND used = false',
      [token]
    );

    if (invite.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { department_id, role } = invite.rows[0];

    await pool.query(`
      INSERT INTO users(firebase_uid, username, name, email, role, department_id, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      firebase_uid,
      username,
      full_name,
      email,
      role,
      department_id,
      photo_url || null
    ]);

    await pool.query('UPDATE staff_invites SET used = true WHERE token = $1', [token]);

    res.json({ message: 'Registration completed successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error completing registration', error: err.message });
  }
};

// === 3. Get Email by Token ===
exports.getInviteInfo = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Missing token' });
  }

  try {
    const result = await pool.query(
      'SELECT email FROM staff_invites WHERE token = $1 AND used = false',
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    res.json({ email: result.rows[0].email });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// === 4. Get Staff Profile by Firebase UID ===
exports.getStaffProfile = async (req, res) => {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: 'Missing Firebase UID' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        users.id, 
        users.name, 
        users.username,
        users.firebase_uid,
        users.profile_picture,
        departments.name AS department_name
      FROM users
      LEFT JOIN departments ON users.department_id = departments.id
      WHERE users.firebase_uid = $1
      LIMIT 1
    `, [uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching staff profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// === 5. Get All Staff Members ===
exports.getAllStaff = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        username,
        email, 
        role, 
        department_id, 
        firebase_uid,
        profile_picture,
        created_at
      FROM users
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
