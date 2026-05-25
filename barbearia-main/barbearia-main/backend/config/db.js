import fs from 'fs';
import path from 'path';

const LOG_FILE = path.resolve('./debug.log');
const log = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
  console.log(msg);
};

// Pure in-memory database object
const inMemoryDB = {
  users: [],
  services: [],
  appointments: [],
  products: [],
  orders: []
};

// Seeding initial services directly into memory
inMemoryDB.services.push(
  { id: 1, category: 'Barba', name: 'Barba', description: 'Tratamento completo para a sua barba.', price: 35.00, duration: 30, image: '/services/beard.png' },
  { id: 2, category: 'Barba', name: 'Bigode', description: 'Aparo e alinhamento do bigode.', price: 15.00, duration: 15, image: '/services/beard.png' },
  { id: 3, category: 'Combos', name: 'Cabelo Barba e Graxa', description: 'Corte, barba e alisamento (graxa).', price: 90.00, duration: 90, image: '/services/signature.png' },
  { id: 4, category: 'Combos', name: 'Cabelo e Barba', description: 'Corte de cabelo e barba.', price: 70.00, duration: 60, image: '/services/signature.png' },
  { id: 5, category: 'Cabelo', name: 'Corte', description: 'Corte de cabelo do seu estilo.', price: 35.00, duration: 40, image: '/services/fade.png' },
  { id: 6, category: 'Tratamentos', name: 'Graxa, alisamento', description: 'Alisamento capilar (graxa).', price: 35.00, duration: 45, image: '/services/modern.png' },
  { id: 7, category: 'Estética', name: 'Sombrancelha', description: 'Alinhamento da sobrancelha.', price: 15.00, duration: 15, image: '/services/classic.png' }
);

// Pre-seeding an admin user (Pass: 123)
inMemoryDB.users.push({
  id: 999,
  name: 'Marcos',
  email: 'adm@adm',
  password: '$2b$10$mhHTdiuE5dO0vTDoRnygE.pGly/EzX8yrcnEx5Ty6.x966U7ygnBG',
  role: 'admin',
  subscription: 'premium',
  image: '/services/imagem.jpg'
});

const db = {
  query: async (sql, params) => {
    log(`[QUERY] ${sql} | Params: ${JSON.stringify(params)}`);
    if (sql.includes('INSERT')) {
      return db.execute(sql, params);
    }
    if (sql.includes('SELECT * FROM users WHERE email = ?')) {
      const match = inMemoryDB.users.filter(u => u.email == params[0]);
      log(`[QUERY] Found ${match.length} users`);
      return [match];
    }
    if (sql.includes('SELECT * FROM services')) {
      return [inMemoryDB.services];
    }
    if (sql.includes('SELECT a.*')) {
      const filtered = inMemoryDB.appointments.filter(a => {
        // If user is admin, show all. If user is barber, show those assigned to them (simulated).
        // If user is customer, show their own.
        if (params[1] === 'admin') return true;
        if (params[1] === 'barber') return a.barber_id == params[0] || !a.barber_id; // Show unassigned or assigned to them
        return a.user_id == params[0];
      });
      log(`[QUERY] Appointments total: ${inMemoryDB.appointments.length} | Filtered: ${filtered.length} for user ${params[0]} (role: ${params[1]})`);
      return [filtered];
    }
    if (sql.includes('SELECT id, name FROM users') || sql.includes('SELECT id, name, image FROM users')) {
      return [inMemoryDB.users.filter(u => u.role === 'barber' || u.role === 'admin').map(u => ({ id: u.id, name: u.name, image: u.image || '/services/imagem.jpg' }))];
    }
    if (sql.includes('SELECT * FROM products')) {
      return [inMemoryDB.products];
    }
    if (sql.includes('SELECT * FROM appointments WHERE id = ?')) {
      const match = inMemoryDB.appointments.filter(a => a.id == params[0]);
      return [match];
    }
    if (sql.includes('SELECT * FROM appointments WHERE appointment_date = ?')) {
      return [inMemoryDB.appointments.filter(a => a.appointment_date == params[0] && a.status != 'cancelled')];
    }
    return [[]];
  },
  execute: async (sql, params) => {
    log(`[EXECUTE] ${sql} | Params: ${JSON.stringify(params)}`);
    if (sql.includes('UPDATE users SET subscription = ? WHERE id = ?')) {
      const user = inMemoryDB.users.find(u => u.id == params[1]);
      if (user) {
        user.subscription = params[0];
        log(`[EXECUTE] User ${user.id} subscription updated to ${user.subscription}`);
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }
    if (sql.includes('UPDATE appointments SET status = ? WHERE id = ?')) {
      const app = inMemoryDB.appointments.find(a => a.id == params[1]);
      if (app) {
        app.status = params[0];
        log(`[EXECUTE] Appointment ${app.id} status updated to ${app.status}`);
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }
    if (sql.includes('INSERT INTO users')) {
      // Allow role from params if provided (params[3] would be role if we update authController)
      const role = params[3] || 'customer';
      const newUser = { id: Date.now(), name: params[0], email: params[1], password: params[2], role: role, subscription: null };
      inMemoryDB.users.push(newUser);
      log(`[EXECUTE] User registered: ${newUser.id} | Role: ${role} | Total: ${inMemoryDB.users.length}`);
      return [{ insertId: newUser.id }];
    }
    if (sql.includes('INSERT INTO services')) {
      const s = { id: Date.now(), name: params[0], description: params[1], price: params[2], duration: params[3] };
      inMemoryDB.services.push(s);
      return [{ insertId: s.id }];
    }
    if (sql.includes('INSERT INTO appointments')) {
      const user = inMemoryDB.users.find(u => u.id == params[0]);
      const appointmentDate = params[2];
      const a = { 
        id: Date.now(), 
        user_id: params[0], 
        user_name: user ? user.name : 'Cliente',
        service_id: params[1], 
        appointment_date: appointmentDate, 
        status: 'pending',
        service_name: inMemoryDB.services.find(s => s.id == params[1])?.name || 'Serviço',
        barber_id: params[3] || null,
        quiet_service: params[4] || false
      };
      inMemoryDB.appointments.push(a);
      log(`[EXECUTE] Appointment created: ${a.id} for user ${a.user_id} | Total: ${inMemoryDB.appointments.length} | Quiet: ${a.quiet_service}`);
      return [{ insertId: a.id }];
    }
    if (sql.includes('DELETE FROM appointments WHERE id = ?')) {
      const initialLength = inMemoryDB.appointments.length;
      inMemoryDB.appointments = inMemoryDB.appointments.filter(a => a.id != params[0]);
      log(`[EXECUTE] Appointment deleted: ${params[0]} | Affected: ${initialLength - inMemoryDB.appointments.length}`);
      return [{ affectedRows: initialLength - inMemoryDB.appointments.length }];
    }
    return [{ insertId: 0 }];
  },
  release: () => {},
  getConnection: async () => ({
    query: async () => {},
    release: () => {}
  })
};

export default db;
