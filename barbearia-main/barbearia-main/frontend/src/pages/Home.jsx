import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Clock, Award, TchescoLogo } from '../components/Icons';

const Home = () => {
  return (
    <main className="reveal">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'var(--primary)', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>SINCE 2024</p>
          <h1 className="hero-title solid">
            <span style={{ fontWeight: 900, textShadow: '2px 2px 10px rgba(0,0,0,1)' }}>BARBERSHOP</span>
            <div className="hero-tchesco-wrapper">
              <div className="hero-tchesco-line"></div>
              <span className="hero-tchesco-text">TCHESCO</span>
              <div className="hero-tchesco-line"></div>
            </div>
          </h1>
          <p className="hero-subtitle">
            A excelência em barbearia clássica. Estilo, precisão e o visual que você merece.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/scheduling" className="premium-btn" style={{ padding: '18px 45px' }}>
            RESERVAR AGORA
          </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container services-section">
        <h2 className="section-title" style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '60px' }}>Nossa <span style={{ color: 'var(--primary)' }}>Assinatura</span></h2>
        <div className="home-services-grid">
          {[
            { plan: 'basic', name: 'Assinatura Corte', price: 'R$ 60', desc: 'Corte 4 vezes ao mês.' },
            { plan: 'premium', name: 'Assinatura Completa', price: 'R$ 110', desc: 'Corte e barba 4 vezes ao mês.' }
          ].map((s, i) => (
            <div key={i} className="glass-panel service-card" style={{ padding: '40px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '15px' }}>{s.name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', minHeight: '50px' }}>{s.desc}</p>
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>{s.price}</span>
                <Link to={`/checkout?plan=${s.plan}`} className="premium-btn" style={{ width: '100%', padding: '12px' }}>Assinar Agora</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us Section */}
      <section className="features-section">
        <div className="features-grid">
          <div style={{ textAlign: 'center' }}><Award size={40} color="var(--primary)" /><h4 style={{ marginTop: '10px' }}>ELITE</h4></div>
          <div style={{ textAlign: 'center' }}><ShieldCheck size={40} color="var(--primary)" /><h4 style={{ marginTop: '10px' }}>CONFIANÇA</h4></div>
          <div style={{ textAlign: 'center' }}><Clock size={40} color="var(--primary)" /><h4 style={{ marginTop: '10px' }}>PONTUAL</h4></div>
          <div style={{ textAlign: 'center' }}><Star size={40} color="var(--primary)" /><h4 style={{ marginTop: '10px' }}>PREMIUM</h4></div>
        </div>
      </section>

    </main>
  );
};

export default Home;
