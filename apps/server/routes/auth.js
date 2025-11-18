const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || '55f2b35553327ef6fa0a4518bcda0065795d5595d8d4f91ad4d6d52ef7ae16ab';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_change_me';

router.post('/register', async (req, res) => {
  const db = req.app.get('db');
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const [user] = await db('users').insert({ username, password: hash }).returning(['id', 'username']);
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: 'exists' });
  }
});

router.post('/login', async (req, res) => {
  const db = req.app.get('db');
  const { username, password } = req.body;
  const user = await db('users').where({ username }).first();
  if (!user) return res.status(401).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'invalid' });

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '15m' });
  const refresh = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '30d' });
  // store refresh in DB if you want revocation
  res.json({ token, refresh, user: { id: user.id, username: user.username } });
});

module.exports = router;
