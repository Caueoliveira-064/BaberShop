import db from '../config/db.js';

export const getServices = async (req, res) => {
  try {
    const [services] = await db.query('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar serviços', error: error.message });
  }
};

export const createService = async (req, res) => {
  const { name, description, price, duration, image_url } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO services (name, description, price, duration, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, duration, image_url]
    );
    res.status(201).json({ message: 'Serviço criado', serviceId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar serviço', error: error.message });
  }
};
