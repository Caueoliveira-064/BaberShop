import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Clock, Award, TchescoLogo } from '../components/Icons';
import api from '../api';

const Home = () => {
  const [nextSlot, setNextSlot] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/api/appointments/availability');
        const occupied = res.data;
        
        const today = new Date();
        const tzOffset = today.getTimezoneOffset() * 60000;
        let found = null;
        
        for (let i = 0; i < 7; i++) {
          const d = new Date(today.getTime() + i * 86400000);
          const dateStr = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
          
          for (let h = 9; h <= 18; h++) {
            for (let m = 0; m < 60; m += 15) {
              if (h === 18 && m > 0) break;
              
              const hh = h.toString().padStart(2, '0');
              const mm = m.toString().padStart(2, '0');
              const timeStr = `${hh}:${mm}:00`;
              const fullStr = `${dateStr} ${timeStr}`;
              
              if (i === 0) {
                const nowH = today.getHours();
                const nowM = today.getMinutes();
                if (h < nowH || (h === nowH && m <= nowM)) continue;
              }
              
              const isOccupied = occupied.some(a => a.appointment_date === fullStr);
              if (!isOccupied) {
                found = { dateStr, timeStr: `${hh}:${mm}` };
                break;
              }
            }
            if (found) break;
          }
          if (found) break;
        }
        
        if (found) {
          const isToday = found.dateStr === new Date(today.getTime() - tzOffset).toISOString().split('T')[0];
          const isTomorrow = found.dateStr === new Date(today.getTime() + 86400000 - tzOffset).toISOString().split('T')[0];
          
          let dayText = found.dateStr.split('-').reverse().join('/');
          if (isToday) dayText = 'hoje';
          else if (isTomorrow) dayText = 'amanhã';
          
          setNextSlot(`${dayText} às ${found.timeStr}`);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAvailability();
  }, []);

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
          
          {nextSlot && (
            <div style={{ background: 'rgba(255, 204, 0, 0.1)', border: '1px solid var(--primary)', borderRadius: '30px', padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '25px', animation: 'fadeIn 1s ease' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>Próximo horário livre: <span style={{ color: 'var(--primary)' }}>{nextSlot}</span></span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/scheduling" className="premium-btn" style={{ padding: '18px 45px' }}>
            RESERVAR AGORA
          </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container services-section" style={{ padding: '6rem 2rem' }}>
        <h2 className="section-title premium-font" style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '60px' }}>Nossa <span style={{ color: 'var(--primary)' }}>Assinatura</span></h2>
        <div className="home-services-grid">
          {[
            { plan: 'basic', name: 'Assinatura Corte', price: 'R$ 60', desc: 'Corte 4 vezes ao mês.', popular: false },
            { plan: 'premium', name: 'Assinatura Completa', price: 'R$ 110', desc: 'Corte e barba 4 vezes ao mês.', popular: true }
          ].map((s, i) => (
            <div key={i} className="glass-panel service-card" style={{ padding: '50px 30px', textAlign: 'center' }}>
              {s.popular && <div className="popular-badge">Mais Popular</div>}
              <h3 className="premium-font" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '15px' }}>{s.name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.desc}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{s.price}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mês</span></span>
                <Link to={`/checkout?plan=${s.plan}`} className="premium-btn" style={{ width: '100%', padding: '15px' }}>Assinar Agora</Link>
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
