import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { Calendar as CalendarIcon, Clock, CheckCircle, User, X, LogIn, UserPlus } from '../components/Icons';

const Scheduling = () => {
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [quietService, setQuietService] = useState(false);
  const [showAllTimes, setShowAllTimes] = useState(false);

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

  const categories = [...new Set(services.map(s => s.category || 'Outros'))];

  const generateTimes = () => {
    const times = [];
    for (let h = 9; h <= 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 18 && m > 0) break;
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
    if (!selectedService || !date || !time || !selectedBarber) return alert('Preencha todos os campos, incluindo o barbeiro');

    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuthModal(true);
      return;
    }

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

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const res = await api.post('/api/auth/login', { email: authEmail, password: authPassword });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setShowAuthModal(false);
        // Automatically try to book after login
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => {} };
          handleBooking(fakeEvent);
        }, 500);
      } else {
        const res = await api.post('/api/auth/register', { name: authName, email: authEmail, password: authPassword });
        // Auto Login after register
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setShowAuthModal(false);
        
        // Wait a bit for state/storage and trigger booking
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => {} };
          handleBooking(fakeEvent);
        }, 500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erro na autenticação');
    } finally {
      setAuthLoading(false);
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
        <h2 style={{ marginTop: '20px' }}>Agendamento Confirmado!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Enviamos os detalhes para o seu e-mail.</p>
        <button className="premium-btn" style={{ marginTop: '30px' }} onClick={() => setSuccess(false)}>Novo Agendamento</button>
      </div>
    );
  }

  return (
    <div className="container fade-in page-section" style={{ paddingBottom: '60px' }}>
      <h2 className="page-title">Agende sua Visita</h2>
      
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
                {services.filter(s => (s.category || 'Outros') === cat).map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => handleServiceSelect(s)}
                    className={`service-card service-card-container ${selectedService?.id === s.id ? 'active' : ''}`}
                    style={{ 
                      border: selectedService?.id === s.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                      background: selectedService?.id === s.id ? 'rgba(196, 30, 58, 0.15)' : 'rgba(255,255,255,0.02)',
                    }}>
                    <div className="service-card-img-wrapper">
                      <img src={s.image || '/services/fade.png'} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="service-card-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.name}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800, whiteSpace: 'nowrap' }}>R$ {s.price}</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
              {barbers.map(barber => (
                <div 
                  key={barber.id}
                  className={`glass-card service-card ${selectedBarber?.id === barber.id ? 'active' : ''}`}
                  onClick={() => setSelectedBarber(barber)}
                  style={{
                    padding: '15px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'center',
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

        {/* Step 2: Date & Time */}
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
            
            <div style={{ marginTop: '10px', padding: '20px', background: 'rgba(196, 30, 58, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600, color: 'var(--primary)' }}>RESUMO DO AGENDAMENTO</p>
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '5px' }}>
                  {selectedService ? selectedService.name : 'Selecione um serviço'}
                </p>
                {date && time && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    📅 {date.split('-').reverse().join('/')} às {time}
                  </p>
                )}
                {selectedService && (
                  <p style={{ marginTop: '10px', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
                    TOTAL: R$ {selectedService.price}
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

            <button type="submit" className="premium-btn" disabled={loading} style={{ padding: '16px', fontSize: '1rem', letterSpacing: '2px' }}>
              {loading ? 'PROCESSANDO...' : 'CONFIRMAR AGENDAMENTO'}
            </button>
          </form>
        </div>
      </div>


      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ position: 'relative', padding: '40px 30px' }}>
              <button 
                onClick={() => setShowAuthModal(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(255, 204, 0, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                  {authMode === 'login' ? <LogIn color="var(--primary)" size={30} /> : <UserPlus color="var(--primary)" size={30} />}
                </div>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>
                  {authMode === 'login' ? 'BEM-VINDO DE VOLTA' : 'CRIE SUA CONTA'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>
                  {authMode === 'login' ? 'Acesse sua conta para finalizar o agendamento' : 'Cadastre-se rapidinho para reservar seu horário'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {authMode === 'register' && (
                  <input 
                    type="text" 
                    placeholder="Nome Completo" 
                    required 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                  />
                )}
                <input 
                  type="email" 
                  placeholder="Seu E-mail" 
                  required 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                />
                <input 
                  type="password" 
                  placeholder="Sua Senha" 
                  required 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                />
                <button type="submit" className="premium-btn" disabled={authLoading} style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}>
                  {authLoading ? 'PROCESSANDO...' : authMode === 'login' ? 'ENTRAR E AGENDAR' : 'CADASTRAR CONTA'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {authMode === 'login' ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, marginLeft: '8px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {authMode === 'login' ? 'Cadastre-se' : 'Faça Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
