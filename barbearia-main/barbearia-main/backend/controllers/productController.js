import db from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
  }
};

export const createOrder = async (req, res) => {
  const { items, total_price } = req.body;
  const user_id = req.user.id;

  try {
    const [result] = await db.query(
      'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
      [user_id, total_price]
    );
    res.status(201).json({ message: 'Pedido realizado', orderId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar pedido', error: error.message });
  }
};
