const bcrypt = require('bcryptjs');
const { sign } = require('../auth');
const { UsersRepository } = require('../repositories/users.repository');

const repo = new UsersRepository();

async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const user = await repo.findByEmail(email);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = sign({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
}

async function register(req, res) {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Correo, usuario y contraseña son obligatorios' });
  }

  const existingEmail = await repo.findByEmail(email);
  if (existingEmail) {
    return res.status(409).json({ error: 'Este correo ya está registrado' });
  }

  const existingUsername = await repo.findByUsername(username);
  if (existingUsername) {
    return res.status(409).json({ error: 'Este usuario ya está en uso' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await repo.create({
    email,
    username,
    passwordHash,
    role: 'user',
  });

  const token = sign({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
}

async function getMe(req, res) {
  const user = await repo.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  return res.json(user);
}

module.exports = { loginUser, register, getMe };
