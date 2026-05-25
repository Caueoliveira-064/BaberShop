import db from './config/db.js';

const seedServices = async () => {
  try {
    const services = [
      { name: 'Barba', description: 'Tratamento completo para a sua barba.', price: 35.00, duration: 30 },
      { name: 'Bigode', description: 'Aparo e alinhamento do bigode.', price: 15.00, duration: 15 },
      { name: 'Cabelo Barba e Graxa', description: 'Corte, barba e alisamento (graxa).', price: 90.00, duration: 90 },
      { name: 'Cabelo e Barba', description: 'Corte de cabelo e barba.', price: 70.00, duration: 60 },
      { name: 'Corte', description: 'Corte de cabelo do seu estilo.', price: 35.00, duration: 40 },
      { name: 'Graxa, alisamento', description: 'Alisamento capilar (graxa).', price: 35.00, duration: 45 },
      { name: 'Sombrancelha', description: 'Alinhamento da sobrancelha.', price: 15.00, duration: 15 }
    ];

    for (const service of services) {
      await db.execute(
        'INSERT INTO services (name, description, price, duration) VALUES (?, ?, ?, ?)',
        [service.name, service.description, service.price, service.duration]
      );
    }
    console.log('✅ Services seeded successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding services:', error.message);
    process.exit(1);
  }
};

seedServices();
