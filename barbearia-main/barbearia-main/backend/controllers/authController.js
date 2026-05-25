import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(400).json({ message: 'E-mail já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = req.body.role || 'customer';
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      message: 'Usuário cadastrado com sucesso', 
      token,
      user: { id: userId, name, email, role, subscription: null }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ message: 'Usuário não encontrado' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, subscription: user.subscription }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

export const subscribe = async (req, res) => {
  const { plan } = req.body;
  const userId = req.user.id;
  try {
    await db.execute('UPDATE users SET subscription = ? WHERE id = ?', [plan, userId]);
    res.json({ message: 'Assinatura ativada com sucesso', subscription: plan });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

export const getBarbers = async (req, res) => {
  try {
    const [barbers] = await db.query('SELECT id, name, image FROM users WHERE role = "barber" OR role = "admin"');
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar barbeiros', error: error.message });
  }
};
