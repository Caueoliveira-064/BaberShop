import db from '../config/db.js';

export const getAppointments = async (req, res) => {
  try {
    const [appointments] = await db.query(`
      SELECT a.*, s.name as service_name, u.name as user_name 
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ? OR ? = 'admin' OR ? = 'barber'
    `, [req.user.id, req.user.role, req.user.role]);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
  }
};

export const createAppointment = async (req, res) => {
  const { service_id, appointment_date, barber_id, quiet_service } = req.body;
  const user_id = req.user.id;

  if (!barber_id) return res.status(400).json({ message: 'Por favor, selecione um barbeiro.' });

  try {
    // Conflict check: same date, time AND barber
    const [conflicts] = await db.query(
      'SELECT * FROM appointments WHERE appointment_date = ? AND status != "cancelled"',
      [appointment_date]
    );

    // In a real DB we would filter by barber_id in SQL. In our mock, we can do it here or let db.query handle it if we updated it.
    // Let's assume we want to prevent overlapping for the SAME barber.
    const barberConflict = conflicts.find(c => c.barber_id == barber_id);

    if (barberConflict) {
      return res.status(400).json({ message: 'Este barbeiro já possui um agendamento neste horário.' });
    }

    const [result] = await db.query(
      'INSERT INTO appointments (user_id, service_id, appointment_date, barber_id, quiet_service) VALUES (?, ?, ?, ?, ?)',
      [user_id, service_id, appointment_date, barber_id, quiet_service || false]
    );

    res.status(201).json({ message: 'Agendamento realizado com sucesso', appointmentId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao agendar', error: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Check ownership if not admin/barber
    if (userRole !== 'admin' && userRole !== 'barber') {
      const [appointments] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
      if (appointments.length === 0) return res.status(404).json({ message: 'Agendamento não encontrado' });
      if (appointments[0].user_id != userId) return res.status(403).json({ message: 'Você não tem permissão para cancelar este agendamento' });
    }

    await db.execute('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', id]);
    res.json({ message: 'Agendamento cancelado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar agendamento', error: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Staff can delete anything. Customers can only delete their own.
    if (userRole !== 'admin' && userRole !== 'barber') {
      const [appointments] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
      if (appointments.length === 0) return res.status(404).json({ message: 'Agendamento não encontrado' });
      if (appointments[0].user_id != userId) return res.status(403).json({ message: 'Você não tem permissão para excluir este agendamento' });
    }

    await db.execute('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir agendamento', error: error.message });
  }
};
