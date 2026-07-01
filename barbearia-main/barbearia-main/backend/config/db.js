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
  // ── BARBA ──────────────────────────────────────────────
  { id: 1,  category: 'Barba',      name: 'Barba Completa',        description: 'Modelagem, aparo e hidratação da barba.',              price: 35,  duration: 30, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop' },
  { id: 2,  category: 'Barba',      name: 'Bigode',                description: 'Aparo e alinhamento do bigode.',                      price: 15,  duration: 15, image: 'https://images.unsplash.com/photo-1589570910256-05fceafa5432?w=800&auto=format&fit=crop' },
  { id: 3,  category: 'Barba',      name: 'Barba com Toalha Quente', description: 'Barba completa com estufa e toalha quente.',         price: 50,  duration: 40, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop' },
  { id: 4,  category: 'Barba',      name: 'Barba Degradê',         description: 'Degradê na barba com acabamento perfeito.',           price: 45,  duration: 35, image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&auto=format&fit=crop' },

  // ── CABELO ─────────────────────────────────────────────
  { id: 5,  category: 'Cabelo',     name: 'Corte Clássico',        description: 'Corte tradicional com tesoura e pente.',              price: 35,  duration: 40, image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop' },
  { id: 6,  category: 'Cabelo',     name: 'Fade / Degradê',        description: 'Degradê moderno nas laterais e nuca.',                price: 40,  duration: 45, image: 'https://images.unsplash.com/photo-1634302086498-7aa00d6dbc97?w=800&auto=format&fit=crop' },
  { id: 7,  category: 'Cabelo',     name: 'Corte Navalhado',       description: 'Acabamento com navalha para um visual afiado.',       price: 45,  duration: 50, image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop' },
  { id: 8,  category: 'Cabelo',     name: 'Corte Infantil',        description: 'Corte especial para os pequenos da casa.',            price: 25,  duration: 30, image: 'https://images.unsplash.com/photo-1560066984-138daaa4e3e9?w=800&auto=format&fit=crop' },

  // ── COMBOS ─────────────────────────────────────────────
  { id: 9,  category: 'Combos',     name: 'Cabelo + Barba',        description: 'Corte de cabelo e barba completa.',                   price: 70,  duration: 60, image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&auto=format&fit=crop' },
  { id: 10, category: 'Combos',     name: 'Cabelo + Barba + Graxa',description: 'Corte, barba e alisamento com graxa.',                price: 90,  duration: 90, image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a176?w=800&auto=format&fit=crop' },
  { id: 11, category: 'Combos',     name: 'Combo Premium VIP',     description: 'Corte, barba, sobrancelha e hidratação capilar.',     price: 120, duration: 100,image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop' },
  { id: 12, category: 'Combos',     name: 'Noivos & Eventos',      description: 'Pacote completo para noivos e ocasiões especiais.',   price: 150, duration: 120,image: 'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=800&auto=format&fit=crop' },

  // ── TRATAMENTOS ────────────────────────────────────────
  { id: 13, category: 'Tratamentos',name: 'Hidratação Capilar',    description: 'Máscara nutritiva para cabelos ressecados.',         price: 40,  duration: 45, image: 'https://images.unsplash.com/photo-1620188526357-882ed42b1c0f?w=800&auto=format&fit=crop' },
  { id: 14, category: 'Tratamentos',name: 'Graxa / Alisamento',    description: 'Alisamento capilar com graxa de acabamento.',        price: 35,  duration: 45, image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&auto=format&fit=crop' },
  { id: 15, category: 'Tratamentos',name: 'Relaxamento Capilar',   description: 'Tratamento suavizante para cabelos crespos.',        price: 60,  duration: 60, image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=800&auto=format&fit=crop' },
  { id: 16, category: 'Tratamentos',name: 'Coloração / Pintura',   description: 'Coloração profissional com pigmentos premium.',      price: 80,  duration: 75, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop' },

  // ── ESTÉTICA ───────────────────────────────────────────
  { id: 17, category: 'Estética',   name: 'Sobrancelha',           description: 'Alinhamento da sobrancelha com linha ou navalha.',   price: 15,  duration: 15, image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&auto=format&fit=crop' },
  { id: 18, category: 'Estética',   name: 'Limpeza de Pele',       description: 'Limpeza profunda dos poros e remoção de cravos.',    price: 55,  duration: 50, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop' },
  { id: 19, category: 'Estética',   name: 'Massagem Capilar',      description: 'Relaxamento e estimulação do couro cabeludo.',       price: 30,  duration: 20, image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&auto=format&fit=crop' }
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

// Pre-seeded barber team
inMemoryDB.users.push(
  {
    id: 1001,
    name: 'Rafael Costa',
    email: 'rafael@tchesco.com',
    password: '$2b$10$mhHTdiuE5dO0vTDoRnygE.pGly/EzX8yrcnEx5Ty6.x966U7ygnBG',
    role: 'barber',
    subscription: null,
    image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 1002,
    name: 'Diego Alves',
    email: 'diego@tchesco.com',
    password: '$2b$10$mhHTdiuE5dO0vTDoRnygE.pGly/EzX8yrcnEx5Ty6.x966U7ygnBG',
    role: 'barber',
    subscription: null,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 1003,
    name: 'Bruno Ferreira',
    email: 'bruno@tchesco.com',
    password: '$2b$10$mhHTdiuE5dO0vTDoRnygE.pGly/EzX8yrcnEx5Ty6.x966U7ygnBG',
    role: 'barber',
    subscription: null,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 1004,
    name: 'Gustavo Lima',
    email: 'gustavo@tchesco.com',
    password: '$2b$10$mhHTdiuE5dO0vTDoRnygE.pGly/EzX8yrcnEx5Ty6.x966U7ygnBG',
    role: 'barber',
    subscription: null,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face'
  }
);

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
