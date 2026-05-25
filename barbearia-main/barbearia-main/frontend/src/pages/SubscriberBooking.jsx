import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { Calendar as CalendarIcon, Clock, CheckCircle, Star, User } from '../components/Icons';

const SubscriberBooking = () => {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
  });
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [quietService, setQuietService] = useState(false);
  const [showAllTimes, setShowAllTimes] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, barberRes] = await Promise.all([
          api.get('/api/services'),
          api.get('/api/auth/barbers')
        ]);
        setServices(serviceRes.data);
        setBarbers(barberRes.data);
      } catch (err) {
        console.error('Erro ao buscar dados');
      }
    };
    fetchData();
  }, []);

  const allowedCategories = user?.subscription === 'premium' 
    ? ['Cabelo', 'Combos', 'Barba'] 
    : user?.subscription === 'basic' 
      ? ['Cabelo'] 
      : [];

  const filteredServices = services.filter(s => allowedCategories.includes(s.category));
  const categories = [...new Set(filteredServices.map(s => s.category || 'Outros'))];

  const generateTimes = () => {
    const times = [];
    for (let h = 9; h <= 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 18 && m > 0) break; // Limit to 18:00
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        times.push(`${hh}:${mm}`);
      }
    }
    return times;
  };

  const availableTimes = generateTimes();

  const nextDays = React.useMemo(() => {
    const days = [];
    for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedService || !date || !time || !selectedBarber) return alert('Preencha a data, horário e barbeiro selecionados');

    const token = localStorage.getItem('token');
    if (!token) return alert('Sua assinatura não foi validada. (Faça login)');

    setLoading(true);
    try {
      const appointment_date = `${date} ${time}:00`;
      await api.post('/api/appointments', 
        { service_id: selectedService.id, appointment_date, barber_id: selectedBarber.id, quiet_service: quietService },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao agendar');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    if (selectedService?.id === service.id) {
      setSelectedService(null);
    } else {
      setSelectedService(service);
    }
  };

  if (success) {
    return (
      <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CheckCircle size={80} color="var(--primary)" />
        <h2 style={{ marginTop: '20px' }}>Agendamento VIP Confirmado!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Obrigado por ser nosso assinante, aguardamos você.</p>
        <button className="premium-btn" onClick={() => { setSuccess(false); setTime(''); setDate(''); setSelectedBarber(null); }}>Agendar Novo Horário</button>
      </div>
    );
  }

  return (
    <div className="container fade-in page-section" style={{ paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <Star color="var(--primary)" size={32} />
          Área do <span style={{ color: 'var(--primary)' }}>Assinante</span>
          <Star color="var(--primary)" size={32} />
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Horários exclusivos de 15 em 15 minutos para quem faz parte do clube.</p>
      </div>
      
      <div className="booking-grid">
        {/* Step 1: Select Service */}
        <div className="glass-card" style={{ maxHeight: '80vh', overflowY: 'auto', padding: '30px' }}>
          <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
            <CalendarIcon size={24} /> 1. Escolha o Serviço
          </h3>
          
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: '30px' }}>
              <h4 style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--primary)', marginBottom: '15px', borderBottom: '1px solid rgba(196, 30, 58, 0.2)', paddingBottom: '5px' }}>
                {cat.toUpperCase()}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                {filteredServices.filter(s => (s.category || 'Outros') === cat).map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => handleServiceSelect(s)}
                    className={`service-card service-card-container ${selectedService?.id === s.id ? 'active' : ''}`}
                    style={{ 
                      border: selectedService?.id === s.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                      background: selectedService?.id === s.id ? 'rgba(196, 30, 58, 0.15)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: selectedService?.id === s.id ? 'scale(1.02)' : 'none'
                    }}
                  >
                    <div className="service-card-img-wrapper">
                      <img src={s.image || '/services/fade.png'} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="service-card-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                         <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.name}</span>
                        {/* We hide the price since subscribers already paid */}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px solid var(--text-muted)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Incluso</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>{s.description}</p>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          ))}

          {/* New Step 3: Choose Barber */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
              <User size={24} /> 2. Escolha o Barbeiro
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
              {barbers.map(barber => (
                <div 
                  key={barber.id}
                  className={`slot-item ${selectedBarber?.id === barber.id ? 'active' : ''}`}
                  onClick={() => setSelectedBarber(barber)}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    border: selectedBarber?.id === barber.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                    background: selectedBarber?.id === barber.id ? 'rgba(196, 30, 58, 0.15)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: '2px solid var(--primary)' }}>
                    <img src={barber.image || '/services/imagem.jpg'} alt={barber.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{barber.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Date & Modular Grid Time */}
        <div className="glass-card sticky-panel" style={{ position: 'sticky', top: '100px', padding: '30px' }}>
          <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
            <Clock size={24} /> 3. Data e Horário
          </h3>
          <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>DATA</label>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'thin' }}>
                {nextDays.map((d) => {
                  const tzOffset = d.getTimezoneOffset() * 60000;
                  const fulldate = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
                  const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
                  const dayNum = d.getDate();
                  const isSelected = date === fulldate;
                  return (
                    <div 
                      key={fulldate}
                      className={`slot-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setDate(fulldate)}
                      style={{
                        flex: '0 0 auto',
                        width: '70px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                        transform: isSelected ? 'scale(1.05)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? 'white' : 'var(--text-muted)' }}>{dayName}</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isSelected ? 'white' : 'var(--text-main)', marginTop: '2px' }}>{dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>HORÁRIOS DISPONÍVEIS</label>
              <div style={{ paddingBottom: '5px' }}>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: showAllTimes ? 'wrap' : 'nowrap',
                  gap: '10px', 
                  maxHeight: showAllTimes ? '1000px' : '65px', 
                  overflowX: showAllTimes ? 'hidden' : 'auto',
                  overflowY: 'hidden', 
                  paddingBottom: showAllTimes ? '5px' : '15px',
                  scrollbarWidth: 'thin',
                  transition: 'max-height 0.4s ease-in-out' 
                }}>
                  {availableTimes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`slot-item ${time === t ? 'active' : ''}`}
                      onClick={() => setTime(t)}
                      style={{
                        flex: '0 0 auto',
                        width: '85px',
                        padding: '12px 0',
                        borderRadius: '8px',
                        border: time === t ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                        background: time === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: time === t ? 'white' : 'var(--text-main)',
                        fontWeight: time === t ? 800 : 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                
                <div 
                  onClick={() => setShowAllTimes(!showAllTimes)}
                  style={{
                     marginTop: '12px',
                     textAlign: 'center',
                     cursor: 'pointer',
                     padding: '10px',
                     background: 'rgba(255,255,255,0.02)',
                     borderRadius: '8px',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '6px',
                     border: '1px solid rgba(255,255,255,0.05)',
                     transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                    {showAllTimes ? 'Ocultar horários' : 'Ver todas opções'}
                  </span>
                </div>
              </div>
              {!time && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Selecione um horário na lista acima.</p>}
            </div>
            
            <div style={{ padding: '20px', background: 'rgba(196, 30, 58, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600, color: 'var(--primary)' }}>RESUMO DO SEU AGENDAMENTO</p>
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '5px' }}>
                  {selectedService ? selectedService.name : 'Selecione um serviço'}
                </p>
                {date && time && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    📅 {date.split('-').reverse().join('/')} às {time}
                  </p>
                )}
              </div>
            </div>

            {/* Quiet Service Toggle */}
            <div 
              onClick={() => setQuietService(!quietService)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px',
                background: quietService ? 'rgba(255, 204, 0, 0.1)' : 'rgba(255,255,255,0.02)',
                borderRadius: '10px',
                border: quietService ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: quietService ? 'var(--primary)' : 'white' }}>ATENDIMENTO SILENCIOSO</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sem conversas desnecessárias</p>
              </div>
              <div style={{
                width: '44px',
                height: '24px',
                background: quietService ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                position: 'relative',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '3px',
                  left: quietService ? '23px' : '3px',
                  transition: 'all 0.3s'
                }} />
              </div>
            </div>

            <button type="submit" className="premium-btn" disabled={loading} style={{ padding: '16px', fontSize: '1rem', letterSpacing: '2px', width: '100%', marginTop: '10px' }}>
              {loading ? 'PROCESSANDO...' : 'CONFIRMAR VISITA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriberBooking;
