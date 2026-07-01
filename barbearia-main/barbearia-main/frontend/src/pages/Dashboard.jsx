import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { Package, Calendar, DollarSign, UserPlus, X } from '../components/Icons';
import { User, Settings, Clock, Star, Bell, BellOff, Scissors, Heart, ChevronRight, Edit3, Check, Shield } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────── */
const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

const AVATAR_COLORS = [
  '#ffcc00', '#4ade80', '#3b82f6', '#ec4899', '#a855f7', '#f97316'
];
const colorFor = (id = 0) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const statusLabel = (s) => ({
  cancelled: { label: 'Cancelado', color: '#666' },
  pending:   { label: 'Pendente',  color: '#ffcc00' },
  confirmed: { label: 'Confirmado',color: '#4ade80' },
}[s] ?? { label: s, color: 'var(--primary)' });

/* ─── sub-components ──────────────────────────────── */
const TabBtn = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 20px', borderRadius: '50px',
      background: active ? 'var(--primary)' : 'transparent',
      color: active ? '#000' : 'var(--text-muted)',
      border: active ? 'none' : '1px solid var(--glass-border)',
      fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
      transition: 'all 0.25s', letterSpacing: '0.5px',
    }}
  >
    <Icon size={16} /> {label}
  </button>
);

const PrefToggle = ({ label, desc, value, onChange, icon: Icon }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', background: value ? 'rgba(255,204,0,0.05)' : 'rgba(255,255,255,0.02)',
    borderRadius: '12px', border: `1px solid ${value ? 'rgba(255,204,0,0.25)' : 'var(--glass-border)'}`,
    transition: 'all 0.3s',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ background: value ? 'rgba(255,204,0,0.15)' : 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
        <Icon size={18} color={value ? 'var(--primary)' : 'var(--text-muted)'} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: value ? 'var(--text-main)' : 'var(--text-muted)' }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
      </div>
    </div>
    <div
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: value ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        position: 'relative', cursor: 'pointer', transition: 'all 0.3s', flexShrink: 0,
      }}
    >
      <div style={{
        width: '18px', height: '18px', background: 'white', borderRadius: '50%',
        position: 'absolute', top: '3px', left: value ? '23px' : '3px', transition: 'all 0.3s',
      }} />
    </div>
  </div>
);

/* ─── main component ──────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [barberData, setBarberData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const nameInputRef = useRef(null);

  /* preferences – stored in localStorage only */
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userPrefs') || '{}'); }
    catch { return {}; }
  });
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userFavorites') || '[]'); }
    catch { return []; }
  });

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  });

  const savePrefs = (next) => { setPrefs(next); localStorage.setItem('userPrefs', JSON.stringify(next)); };
  const togglePref = (key) => savePrefs({ ...prefs, [key]: !prefs[key] });

  const toggleFav = (serviceName) => {
    const next = favorites.includes(serviceName)
      ? favorites.filter(f => f !== serviceName)
      : [...favorites, serviceName];
    setFavorites(next);
    localStorage.setItem('userFavorites', JSON.stringify(next));
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoading(true);
      try {
        const appRes = await api.get('/api/appointments', { headers: { Authorization: `Bearer ${token}` } });
        setAppointments(appRes.data);
      } catch { /* silent */ }
      if (user.role === 'admin') {
        try {
          const orderRes = await api.get('/api/products/orders', { headers: { Authorization: `Bearer ${token}` } });
          setOrders(orderRes.data);
        } catch { /* silent */ }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  const handleCancelAppointment = (id) => { setAppointmentToCancel(id); setShowCancelModal(true); };
  const confirmCancel = async () => {
    const id = appointmentToCancel;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      await api.put(`/api/appointments/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      setShowCancelModal(false);
    } catch (err) { alert(err.response?.data?.message || 'Erro ao cancelar'); }
    finally { setLoading(false); }
  };
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Deseja excluir permanentemente este registro?')) return;
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/api/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Erro ao excluir'); }
  };
  const handleRegisterBarber = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/api/auth/register', { ...barberData, role: 'barber' });
      alert('Barbeiro cadastrado com sucesso!');
      setShowBarberModal(false);
      setBarberData({ name: '', email: '', password: '' });
    } catch (err) { alert(err.response?.data?.message || 'Erro ao cadastrar barbeiro'); }
    finally { setLoading(false); }
  };

  const saveName = () => {
    if (!tempName.trim()) { setEditingName(false); return; }
    const updated = { ...user, name: tempName.trim() };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    setEditingName(false);
  };

  if (!user.id) return (
    <div className="container page-section" style={{ textAlign: 'center', padding: '100px 0' }}>
      <h2 style={{ color: 'var(--primary)' }}>Acesso Restrito</h2>
      <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Você precisa estar logado para acessar seu perfil.</p>
      <button className="premium-btn" onClick={() => navigate('/login')} style={{ marginTop: '30px' }}>Fazer Login</button>
    </div>
  );

  const isStaff = user.role === 'admin' || user.role === 'barber';
  const avatarColor = colorFor(user.id);
  const upcoming = appointments.filter(a => a.status !== 'cancelled' && new Date(a.appointment_date) >= new Date());
  const past = appointments.filter(a => a.status === 'cancelled' || new Date(a.appointment_date) < new Date());

  /* ─── unique service names from appointment history (for favourites) */
  const serviceNames = [...new Set(appointments.map(a => a.service_name).filter(Boolean))];

  const planLabel = user.subscription === 'premium' ? 'Plano Completo' : user.subscription === 'basic' ? 'Plano Corte' : 'Sem assinatura';
  const planColor = user.subscription === 'premium' ? '#a855f7' : user.subscription === 'basic' ? '#4ade80' : 'var(--text-muted)';

  return (
    <div className="container fade-in page-section" style={{ paddingBottom: '80px' }}>

      {/* ── HERO HEADER ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,204,0,0.08), rgba(255,255,255,0.02))',
        border: '1px solid var(--glass-border)', borderRadius: '20px',
        padding: 'clamp(24px,4vw,40px)', marginBottom: '32px',
        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: avatarColor, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem', fontWeight: 800,
            color: '#000', boxShadow: `0 0 0 4px rgba(${avatarColor},0.2), 0 0 24px ${avatarColor}44`,
            border: `3px solid ${avatarColor}`,
          }}>
            {getInitials(user.name)}
          </div>
          {user.subscription && (
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              background: planColor, borderRadius: '50%', padding: '4px',
              border: '2px solid var(--bg-main)',
            }}>
              <Star size={10} fill="#000" color="#000" />
            </div>
          )}
        </div>

        {/* Name + plan */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <input
                ref={nameInputRef}
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary)',
                  color: 'var(--text-main)', borderRadius: '8px', padding: '6px 12px',
                  fontSize: '1.4rem', fontWeight: 800, width: '220px',
                }}
              />
              <button onClick={saveName} style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                <Check size={16} color="#000" />
              </button>
              <button onClick={() => setEditingName(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="var(--text-muted)" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 className="premium-font" style={{ fontSize: 'clamp(1.2rem,3vw,1.8rem)', margin: 0 }}>{user.name}</h2>
              <button
                onClick={() => { setTempName(user.name); setEditingName(true); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                title="Editar nome"
              >
                <Edit3 size={16} color="var(--text-muted)" />
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</span>
            <span style={{ padding: '3px 10px', borderRadius: '20px', background: `${planColor}22`, color: planColor, fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${planColor}44` }}>
              {planLabel}
            </span>
            {isStaff && (
              <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,204,0,0.1)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                {user.role === 'admin' ? '⚡ Admin' : '✂️ Barbeiro'}
              </span>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Agendamentos', value: appointments.length },
            { label: 'Próximos', value: upcoming.length },
            { label: 'Favoritos', value: favorites.length },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', minWidth: '60px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Admin action */}
        {user.role === 'admin' && (
          <button className="premium-btn" onClick={() => setShowBarberModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', padding: '10px 20px' }}>
            <UserPlus size={18} /> Cadastrar Barbeiro
          </button>
        )}
      </div>

      {/* ── TAB NAVIGATION ──────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <TabBtn active={tab === 'overview'}     icon={User}      label="Visão Geral"   onClick={() => setTab('overview')} />
        <TabBtn active={tab === 'appointments'} icon={Calendar}  label="Agendamentos"  onClick={() => setTab('appointments')} />
        <TabBtn active={tab === 'preferences'}  icon={Settings}  label="Preferências"  onClick={() => setTab('preferences')} />
        {isStaff && <TabBtn active={tab === 'admin'} icon={Shield} label="Painel Admin" onClick={() => setTab('admin')} />}
      </div>

      {/* ── TAB: OVERVIEW ───────────────────────────── */}
      {tab === 'overview' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,340px),1fr))', gap: '20px' }}>
          
          {/* Next appointment */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Clock size={16} /> Próximo Agendamento
            </h4>
            {upcoming.length > 0 ? (() => {
              const a = upcoming.sort((x,y) => new Date(x.appointment_date) - new Date(y.appointment_date))[0];
              const st = statusLabel(a.status);
              return (
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>{a.service_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
                    📅 {new Date(a.appointment_date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' '} às {new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', background: `${st.color}22`, color: st.color, fontSize: '0.75rem', fontWeight: 700 }}>
                    {st.label}
                  </span>
                </div>
              );
            })() : (
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Nenhum agendamento futuro.</p>
                <button className="premium-btn" onClick={() => navigate('/scheduling')} style={{ width: '100%', padding: '12px' }}>
                  Agendar Agora
                </button>
              </div>
            )}
          </div>

          {/* Favorites */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Heart size={16} /> Meus Favoritos
            </h4>
            {favorites.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Marque serviços como favoritos na aba Preferências.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {favorites.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,204,0,0.05)', borderRadius: '10px', border: '1px solid rgba(255,204,0,0.15)' }}>
                    <Scissors size={14} color="var(--primary)" />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscription card */}
          <div style={{
            background: user.subscription ? `linear-gradient(135deg, ${planColor}22, rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${user.subscription ? planColor + '44' : 'var(--glass-border)'}`,
            borderRadius: '16px', padding: '24px',
          }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: planColor, marginBottom: '16px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Star size={16} /> Meu Plano
            </h4>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: planColor }}>{planLabel}</div>
            {user.subscription ? (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px' }}>
                  {user.subscription === 'premium'
                    ? 'Você tem acesso a todos os serviços: Cabelo, Barba e Combos. + Toalha Quente, Massagem e Cerveja Artesanal como cortesia.'
                    : 'Você tem acesso a serviços de Cabelo. + Lavagem Especial e Café Expresso como cortesia.'}
                </p>
                <button onClick={() => navigate('/subscriber-booking')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `1px solid ${planColor}`, color: planColor, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                  Agendar como VIP <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>Torne-se assinante e ganhe acesso exclusivo a serviços e cortesias.</p>
                <button className="premium-btn" onClick={() => navigate('/checkout?plan=basic')} style={{ padding: '10px 20px', width: '100%' }}>
                  Ver Planos
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: APPOINTMENTS ───────────────────────── */}
      {tab === 'appointments' && (
        <div className="fade-in">
          {upcoming.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Próximos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcoming.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)).map(a => {
                  const st = statusLabel(a.status);
                  return (
                    <div key={a.id} style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', borderLeft: `4px solid ${st.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{a.service_name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(a.appointment_date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {a.quiet_service && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>🔇 Silencioso</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', background: `${st.color}22`, color: st.color, fontSize: '0.75rem', fontWeight: 700 }}>{st.label}</span>
                        <button onClick={() => handleCancelAppointment(a.id)} style={{ background: 'transparent', border: '1px solid #ff444488', color: '#ff4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', borderRadius: '8px', padding: '6px 12px' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Histórico</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {past.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)).map(a => {
                  const st = statusLabel(a.status);
                  return (
                    <div key={a.id} style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', borderLeft: `4px solid ${st.color}`, opacity: 0.7, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', textDecoration: a.status === 'cancelled' ? 'line-through' : 'none', marginBottom: '4px' }}>{a.service_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(a.appointment_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', background: `${st.color}22`, color: st.color, fontSize: '0.72rem', fontWeight: 700 }}>{st.label}</span>
                        <button onClick={() => handleDeleteAppointment(a.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}>
                          Apagar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {appointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Calendar size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
              <p>Você ainda não tem agendamentos.</p>
              <button className="premium-btn" onClick={() => navigate('/scheduling')} style={{ marginTop: '20px', padding: '12px 30px' }}>
                Agendar Agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PREFERENCES ────────────────────────── */}
      {tab === 'preferences' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,400px),1fr))', gap: '24px' }}>

          {/* Notif / behavior prefs */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Comportamento</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PrefToggle label="Serviço Silencioso" desc="Sem conversas durante o atendimento" value={!!prefs.quietService} onChange={() => togglePref('quietService')} icon={BellOff} />
              <PrefToggle label="Notificações" desc="Receber lembretes de agendamento" value={!!prefs.notifications} onChange={() => togglePref('notifications')} icon={Bell} />
              <PrefToggle label="Mesmo Barbeiro" desc="Preferir sempre o mesmo profissional" value={!!prefs.sameBarber} onChange={() => togglePref('sameBarber')} icon={User} />
            </div>
            {prefs.quietService && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(255,204,0,0.06)', borderRadius: '10px', border: '1px solid rgba(255,204,0,0.2)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>✓ Serviço Silencioso ativado</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Seus agendamentos futuros virão com este modo pré-ativado.</p>
              </div>
            )}
          </div>

          {/* Horários preferidos */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Horários Preferidos
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {['Manhã (9–12h)', 'Tarde (12–15h)', 'Tarde (15–18h)'].map(slot => {
                const active = prefs[`slot_${slot}`];
                return (
                  <div
                    key={slot}
                    onClick={() => togglePref(`slot_${slot}`)}
                    style={{
                      padding: '12px 8px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                      background: active ? 'rgba(255,204,0,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? 'rgba(255,204,0,0.4)' : 'var(--glass-border)'}`,
                      color: active ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: active ? 700 : 400, fontSize: '0.78rem', transition: 'all 0.2s',
                    }}
                  >
                    {slot.split(' ')[0]}<br />
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{slot.split(' ').slice(1).join(' ')}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Dias preferidos:</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => {
                  const active = prefs[`day_${d}`];
                  return (
                    <div
                      key={d}
                      onClick={() => togglePref(`day_${d}`)}
                      style={{
                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                        background: active ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                        color: active ? '#000' : 'var(--text-muted)',
                        fontWeight: active ? 800 : 400, fontSize: '0.82rem',
                        border: `1px solid ${active ? 'var(--primary)' : 'var(--glass-border)'}`,
                        transition: 'all 0.2s',
                      }}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Favorites from history */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Heart size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Serviços Favoritos
            </h4>
            {serviceNames.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Faça agendamentos para ver seus serviços aqui.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {serviceNames.map(s => {
                  const isFav = favorites.includes(s);
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: isFav ? 'rgba(255,204,0,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${isFav ? 'rgba(255,204,0,0.2)' : 'var(--glass-border)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Scissors size={14} color={isFav ? 'var(--primary)' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.9rem', fontWeight: isFav ? 700 : 400 }}>{s}</span>
                      </div>
                      <button onClick={() => toggleFav(s)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <Heart size={18} fill={isFav ? 'var(--primary)' : 'none'} color={isFav ? 'var(--primary)' : 'var(--text-muted)'} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: ADMIN ──────────────────────────────── */}
      {tab === 'admin' && isStaff && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,350px),1fr))', gap: '20px' }}>

          {/* All appointments for staff */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', gridColumn: '1/-1' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary)' }}>
              <Calendar size={20} /> Agenda Completa ({appointments.length} agendamentos)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {appointments.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Nenhum agendamento.</p>
                : appointments.map(a => {
                  const st = statusLabel(a.status);
                  return (
                    <div key={a.id} style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: `4px solid ${st.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{a.service_name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Cliente: {a.user_name || '—'} · {new Date(a.appointment_date).toLocaleDateString('pt-BR')} {new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', background: `${st.color}22`, color: st.color, fontSize: '0.72rem', fontWeight: 700 }}>{st.label}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Orders */}
          {user.role === 'admin' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary)' }}>
                <Package size={20} /> Pedidos da Loja
              </h3>
              {orders.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Nenhum pedido.</p>
                : orders.map(o => (
                  <div key={o.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pedido #{o.id} — {o.status}</span>
                    <span style={{ fontWeight: 700 }}>R$ {o.total_price}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Financial */}
          {user.role === 'admin' && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary)' }}>
                <DollarSign size={20} /> Faturamento Estimado
              </h3>
              <div style={{ padding: '24px', background: 'var(--primary)', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000', marginBottom: '8px' }}>Total Estimado</p>
                <h2 style={{ fontSize: '2rem', color: '#000' }}>
                  R$ {(appointments.length * 60 + orders.reduce((a, b) => a + parseFloat(b.total_price || 0), 0)).toFixed(2)}
                </h2>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ──────────────────────────────────── */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(255,68,68,0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', border: '2px solid #ff4444' }}>
              <X size={32} color="#ff4444" />
            </div>
            <h3 style={{ marginBottom: '15px', color: 'white' }}>Confirmar Cancelamento</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.6' }}>Deseja realmente cancelar este agendamento? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button onClick={() => setShowCancelModal(false)} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>VOLTAR</button>
              <button onClick={confirmCancel} disabled={loading} style={{ padding: '12px', background: '#ff4444', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>{loading ? 'CANCELANDO...' : 'CANCELAR'}</button>
            </div>
          </div>
        </div>
      )}

      {showBarberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '100%', position: 'relative' }}>
            <button onClick={() => setShowBarberModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
              <UserPlus size={24} /> Cadastrar Barbeiro
            </h3>
            <form onSubmit={handleRegisterBarber} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="input-group"><label>NOME COMPLETO</label><input type="text" value={barberData.name} onChange={e => setBarberData({...barberData, name: e.target.value})} placeholder="Ex: Rafael Costa" required /></div>
              <div className="input-group"><label>E-MAIL</label><input type="email" value={barberData.email} onChange={e => setBarberData({...barberData, email: e.target.value})} placeholder="rafael@barbershop.com" required /></div>
              <div className="input-group"><label>SENHA</label><input type="password" value={barberData.password} onChange={e => setBarberData({...barberData, password: e.target.value})} placeholder="••••••••" required /></div>
              <button type="submit" className="premium-btn" disabled={loading} style={{ marginTop: '10px' }}>{loading ? 'CADASTRANDO...' : 'CONFIRMAR CADASTRO'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
