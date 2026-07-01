import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, BellOff, Star } from 'lucide-react';
import api from '../api';

const BARBER_COLORS = ['#ffcc00', '#4ade80', '#3b82f6', '#ec4899', '#a855f7'];

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const SuccessAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--primary)', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.1)', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'scaleIn 0.5s ease' }}>
          <Check size={40} color="#4ade80" />
        </div>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Agendamento VIP Confirmado!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Obrigado por ser nosso assinante, aguardamos você.</p>
        <style>{`
          @keyframes scaleIn { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
        `}</style>
      </div>
    </div>
  );
};

const SubscriberBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [quietService, setQuietService] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          api.get('/api/services'),
          api.get('/api/auth/barbers')
        ]);
        setServices(servicesRes.data);
        setBarbers(barbersRes.data);
        
        const dates = [];
        const today = new Date();
        const tzOffset = today.getTimezoneOffset() * 60000;
        for (let i = 0; i < 7; i++) {
          const d = new Date(today.getTime() + i * 86400000 - tzOffset);
          dates.push(d.toISOString().split('T')[0]);
        }
        if (dates.length > 0) setSelectedDate(dates[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchOccupiedAndCalculate();
    }
  }, [selectedDate, selectedBarber]);

  const fetchOccupiedAndCalculate = async () => {
    try {
      const res = await api.get('/api/appointments/availability');
      const occupied = res.data;
      
      const times = [];
      const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const nowH = new Date().getHours();
      const nowM = new Date().getMinutes();
      
      for (let h = 9; h <= 18; h++) {
        for (let m = 0; m < 60; m += 15) {
          if (h === 18 && m > 0) break;
          const hh = h.toString().padStart(2, '0');
          const mm = m.toString().padStart(2, '0');
          const timeStr = `${hh}:${mm}`;
          
          if (selectedDate === todayStr && (h < nowH || (h === nowH && m <= nowM))) {
             continue; 
          }
          
          const fullStr = `${selectedDate} ${timeStr}:00`;
          const isOccupied = occupied.some(a => a.appointment_date === fullStr && (!selectedBarber || a.barber_id === selectedBarber.id));
          
          if (!isOccupied) {
            times.push(timeStr);
          }
        }
      }
      setAvailableTimes(times);
    } catch (e) {
      console.error(e);
      // Fallback
      setAvailableTimes(["09:00", "09:30", "10:00", "11:00", "14:00", "15:00", "16:30"]);
    }
  };

  const allowedCategories = user?.subscription === 'premium' 
    ? ['Cabelo', 'Combos', 'Barba'] 
    : user?.subscription === 'basic' 
      ? ['Cabelo'] 
      : [];

  const filteredServices = services.filter(s => allowedCategories.includes(s.category));

  const handleConfirm = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sua assinatura não pôde ser validada. Faça login novamente.');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const appointment_date = `${selectedDate} ${selectedTime}:00`;
      await api.post('/api/appointments', {
        service_id: selectedService.id,
        appointment_date,
        barber_id: selectedBarber.id === 'any' ? null : selectedBarber.id,
        quiet_service: quietService
      });
      setShowSuccess(true);
    } catch (err) {
      alert('Erro ao agendar: ' + (err.response?.data?.message || err.message));
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-section container" style={{textAlign:'center'}}><p>Carregando...</p></div>;

  if (!user || !user.subscription) {
    return (
      <div className="page-section container fade-in" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Acesso Restrito</h2>
        <p style={{ color: 'var(--text-muted)' }}>Você precisa ser um assinante ativo para acessar esta área.</p>
        <button className="premium-btn" onClick={() => navigate('/checkout?plan=basic')} style={{ marginTop: '30px' }}>
          Conhecer Assinaturas
        </button>
      </div>
    );
  }

  return (
    <div className="page-section container fade-in" style={{ paddingBottom: '100px' }}>
      
      {showSuccess && <SuccessAnimation onComplete={() => navigate('/dashboard')} />}

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 className="page-title premium-font" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', margin: 0 }}>
          <Star color="var(--primary)" size={32} />
          Área do <span style={{ color: 'var(--primary)' }}>Assinante</span>
          <Star color="var(--primary)" size={32} />
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Horários exclusivos e sem custo adicional para o seu plano.</p>
      </div>

      {/* PROGRESS INDICATOR */}
      <div className="booking-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <span className="step-label">Serviço</span>
        </div>
        <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <span className="step-label">Profissional</span>
        </div>
        <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span className="step-label">Horário</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        
        {/* LEFT COLUMN: MAIN SELECTION AREA */}
        <div style={{ flex: '1 1 600px', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* STEP 1: SERVICES */}
          {step === 1 && (
            <div className="fade-in">
              <h2 className="premium-font" style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                Serviços do seu Plano
              </h2>
              
              <div style={{ background: 'linear-gradient(45deg, rgba(255,204,0,0.1), rgba(255,204,0,0.02))', border: '1px solid rgba(255,204,0,0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'var(--primary)', color: '#000', padding: '12px', borderRadius: '50%', boxShadow: '0 0 15px rgba(255,204,0,0.4)' }}><Star size={24} fill="#000" /></div>
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Benefícios Exclusivos do Plano {user?.subscription === 'premium' ? 'Completo' : 'Corte'}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {user?.subscription === 'premium' 
                      ? 'Como assinante Premium, você tem direito a Toalha Quente, Massagem Capilar e Cerveja Artesanal como cortesia em todos os seus agendamentos.'
                      : 'Como assinante, você tem direito a Lavagem Especial e Café Expresso como cortesia em todos os seus agendamentos.'}
                  </p>
                </div>
              </div>

              {filteredServices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Nenhum serviço disponível para o seu plano atual.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {filteredServices.map(s => (
                    <div 
                      key={s.id}
                      className={`service-card-premium ${selectedService?.id === s.id ? 'active' : ''}`}
                      onClick={() => { setSelectedService(s); setStep(2); }}
                    >
                      <div className="service-img-wrap">
                        <img src={s.image || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={s.name} />
                      </div>
                      <div className="service-content">
                        <div className="service-header">
                          <span className="service-title">{s.name}</span>
                          <span className="service-price" style={{ fontSize: '0.8rem', border: '1px solid var(--text-muted)', padding: '2px 8px', borderRadius: '4px' }}>Incluso</span>
                        </div>
                        <p className="service-desc">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: BARBERS */}
          {step === 2 && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <h2 className="premium-font" style={{ color: 'var(--primary)', margin: 0 }}>
                  Escolha o Profissional
                </h2>
                <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Voltar</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                <div 
                  className={`barber-card ${selectedBarber?.id === 'any' ? 'active' : ''}`}
                  onClick={() => { setSelectedBarber({ id: 'any', name: 'Qualquer Profissional' }); setStep(3); }}
                >
                  <div className="barber-avatar" style={{ borderStyle: 'dashed' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>💈</span>
                    </div>
                  </div>
                  <span className="barber-name">Qualquer um</span>
                </div>
                
                {barbers.map((b, idx) => {
                  const color = BARBER_COLORS[b.id % BARBER_COLORS.length];
                  return (
                    <div 
                      key={b.id}
                      className={`barber-card ${selectedBarber?.id === b.id ? 'active' : ''}`}
                      onClick={() => { setSelectedBarber(b); setStep(3); }}
                      style={selectedBarber?.id === b.id ? { borderColor: color, boxShadow: `0 8px 24px ${color}33` } : {}}
                    >
                      <div className="barber-avatar" style={{ borderColor: selectedBarber?.id === b.id ? color : 'var(--glass-border)' }}>
                        {b.image ? (
                          <img src={b.image} alt={b.name} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            {getInitials(b.name)}
                          </div>
                        )}
                      </div>
                      <span className="barber-name" style={{ color: selectedBarber?.id === b.id ? color : 'var(--text-main)' }}>{b.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3: DATE AND TIME */}
          {step === 3 && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <h2 className="premium-font" style={{ color: 'var(--primary)', margin: 0 }}>
                  Data e Horário
                </h2>
                <button onClick={() => setStep(2)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Voltar</button>
              </div>

              {/* Date Flipper */}
              <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                {[...Array(14)].map((_, i) => {
                  const d = new Date(new Date().getTime() + i * 86400000 - new Date().getTimezoneOffset() * 60000);
                  const dateStr = d.toISOString().split('T')[0];
                  const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getUTCDay()];
                  const dayNum = d.getUTCDate();
                  return (
                    <div 
                      key={dateStr}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                      style={{ 
                        flexShrink: 0, padding: '10px 15px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                        background: selectedDate === dateStr ? 'var(--primary)' : 'var(--bg-card)',
                        color: selectedDate === dateStr ? '#000' : 'var(--text-main)',
                        border: `1px solid ${selectedDate === dateStr ? 'var(--primary)' : 'var(--glass-border)'}`
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>{dayName}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{dayNum}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
                {availableTimes.length > 0 ? availableTimes.map(time => (
                  <button
                    key={time}
                    className={`time-slot ${selectedTime === time ? 'active' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                )) : (
                  <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum horário disponível para esta data.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HIGHLIGHT SUMMARY */}
        {selectedService && (
          <div style={{ flex: '1 1 350px', maxWidth: '450px' }}>
            <div className="summary-card-highlight fade-in" style={{ position: 'sticky', top: '100px' }}>
              <h3 className="premium-font" style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>Resumo VIP</h3>
              
              <div className="summary-item">
                <div className="summary-icon-wrap"><Check size={20} /></div>
                <div className="summary-details">
                  <h5>Serviço</h5>
                  <p>{selectedService.name}</p>
                </div>
              </div>

              {selectedBarber && (
                <div className="summary-item">
                  <div className="summary-icon-wrap"><Check size={20} /></div>
                  <div className="summary-details">
                    <h5>Profissional</h5>
                    <p>{selectedBarber.name}</p>
                  </div>
                </div>
              )}

              {selectedTime && (
                <div className="summary-item">
                  <div className="summary-icon-wrap"><Check size={20} /></div>
                  <div className="summary-details">
                    <h5>Horário</h5>
                    <p>{selectedDate.split('-').reverse().join('/')} às {selectedTime}</p>
                  </div>
                </div>
              )}

              <div style={{ margin: '2rem 0', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BellOff size={20} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Serviço Silencioso</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem conversas durante o corte</div>
                  </div>
                </div>
                <div 
                  className={`toggle-switch ${quietService ? 'active' : ''}`}
                  onClick={() => setQuietService(!quietService)}
                />
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '20px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '1px', marginBottom: '15px' }}>CORTESIAS INCLUSAS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '4px', borderRadius: '50%' }}><Check size={14} color="#4ade80" /></div>
                    Bebida Cortesia (Café/Cerveja)
                  </div>
                  {user?.subscription === 'premium' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '4px', borderRadius: '50%' }}><Check size={14} color="#4ade80" /></div>
                      Toalha Quente & Massagem
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '4px', borderRadius: '50%' }}><Check size={14} color="#4ade80" /></div>
                    Lavagem Premium
                  </div>
                </div>
              </div>

              <div className="summary-total" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="summary-total-label" style={{ color: 'var(--text-muted)' }}>Custo Adicional</span>
                <span className="summary-total-value" style={{ color: '#4ade80', fontSize: '1.5rem' }}>R$ 0,00</span>
              </div>

              {step === 3 && selectedTime && (
                <button 
                  className="premium-btn fade-in" 
                  style={{ width: '100%', marginTop: '2rem', padding: '1.25rem' }}
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar VIP'}
                </button>
              )}
              
              {/* Sticky mobile button helper */}
              {step === 3 && selectedTime && (
                <div className="sticky-mobile-bottom" style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
                  <button 
                    className="premium-btn" 
                    onClick={handleConfirm}
                    disabled={submitting}
                  >
                    Confirmar VIP
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriberBooking;
