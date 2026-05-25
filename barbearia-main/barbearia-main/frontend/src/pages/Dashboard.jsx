import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { Package, Calendar, DollarSign, UserPlus, X } from '../components/Icons';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [barberData, setBarberData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoading(true);
      try {
        const appRes = await api.get('/api/appointments', { headers: { Authorization: `Bearer ${token}` } });
        setAppointments(appRes.data);
      } catch (err) {
        console.error('Erro ao buscar agendamentos');
      }

      if (user.role === 'admin') {
        try {
          const orderRes = await api.get('/api/products/orders', { headers: { Authorization: `Bearer ${token}` } });
          setOrders(orderRes.data);
        } catch (err) {
          console.error('Erro ao buscar pedidos');
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user.role, user.id]);

  const handleCancelAppointment = (id) => {
    setAppointmentToCancel(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    const id = appointmentToCancel;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      await api.put(`/api/appointments/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      setShowCancelModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao cancelar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Deseja excluir permanentemente este registro?')) return;
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/api/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  const handleRegisterBarber = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', { ...barberData, role: 'barber' });
      alert('Barbeiro cadastrado com sucesso!');
      setShowBarberModal(false);
      setBarberData({ name: '', email: '', password: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao cadastrar barbeiro');
    } finally {
      setLoading(false);
    }
  };

  if (!user.id) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2 style={{ color: 'var(--primary)' }}>Acesso Restrito</h2>
        <p style={{ marginTop: '20px' }}>Você precisa estar logado para acessar seu perfil.</p>
      </div>
    );
  }

  const isStaff = user.role === 'admin' || user.role === 'barber';

  return (
    <div className="container fade-in page-section" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: '2.5rem' }}>{isStaff ? 'Painel' : 'Meu'} <span style={{ color: 'var(--primary)' }}>{isStaff ? 'Profissional' : 'Perfil'}</span></h2>
          <p style={{ color: 'var(--text-muted)' }}>{isStaff ? `Bem-vindo de volta, ${user.name}.` : 'Gerencie seus agendamentos e histórico.'}</p>
        </div>
        {user.role === 'admin' && (
          <button className="premium-btn" onClick={() => setShowBarberModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'auto' }}>
            <UserPlus size={20} /> Cadastrar Barbeiro
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isStaff ? 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))' : '1fr', gap: '30px' }}>
        {/* Appointments History */}
        <div className="glass-card" style={{ width: '100%', maxWidth: isStaff ? 'none' : '600px', margin: isStaff ? '0' : '0 auto' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="var(--primary)" /> {isStaff ? 'Agenda Mustache' : 'Meus Agendamentos'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {appointments.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Nenhum agendamento encontrado.</p> : appointments.map(a => (
              <div key={a.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${a.status === 'cancelled' ? '#666' : 'var(--primary)'}`, opacity: a.status === 'cancelled' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <div style={{ fontWeight: 600, textDecoration: a.status === 'cancelled' ? 'line-through' : 'none' }}>{a.service_name}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '2px' }}>{isStaff ? `Cliente: ${a.user_name}` : 'Horário confirmado'}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: window.innerWidth < 480 ? 'left' : 'right' }}>
                    {new Date(a.appointment_date).toLocaleDateString()}<br/>
                    {new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {a.quiet_service && (
                  <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>🔇 ATENDIMENTO SILENCIOSO</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                   <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: a.status === 'cancelled' ? '#666' : 'var(--primary)', fontWeight: 700 }}>
                    {a.status === 'cancelled' ? 'CANCELADO' : a.status}
                  </div>
                  
                  {a.status !== 'cancelled' ? (
                    <button 
                      onClick={() => handleCancelAppointment(a.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ff4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      CANCELAR
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleDeleteAppointment(a.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      APAGAR
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders History (Only for Admins) */}
        {user.role === 'admin' && (
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={20} color="var(--primary)" /> Pedidos da Loja
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orders.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Nenhum pedido realizado.</p> : orders.map(o => (
                <div key={o.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pedido #{o.id}</span>
                    <span style={{ fontWeight: 700 }}>R$ {o.total_price}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>Status: {o.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Summary (Only for Admins) */}
        {user.role === 'admin' && (
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={20} color="var(--primary)" /> Resumo Geral
            </h3>
            <div style={{ padding: '20px', background: 'var(--primary)', color: 'var(--secondary)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Faturamento Total (Est.)</p>
              <h2 style={{ fontSize: 'clamp(1.5rem, 8vw, 2.5rem)', marginTop: '10px' }}>R$ { (appointments.length * 60 + orders.reduce((a, b) => a + parseFloat(b.total_price), 0)).toFixed(2) }</h2>
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Baseado em todos os atendimentos e vendas da loja.
            </p>
          </div>
        )}
      </div>


      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '30px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', border: '2px solid #ff4444' }}>
              <X size={32} color="#ff4444" />
            </div>
            <h3 style={{ marginBottom: '15px', color: 'white' }}>Confirmar Cancelamento</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.6' }}>
              Deseja realmente cancelar seu agendamento? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button 
                onClick={() => setShowCancelModal(false)}
                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                VOLTAR
              </button>
              <button 
                onClick={confirmCancel}
                disabled={loading}
                style={{ padding: '12px', background: '#ff4444', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                {loading ? 'LIMPANDO...' : 'CANCELAR AGORA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barber Registration Modal */}
      {showBarberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '100%', position: 'relative' }}>
            <button onClick={() => setShowBarberModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
              <UserPlus size={24} /> Novo Barbeiro
            </h3>
            <form onSubmit={handleRegisterBarber} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="input-group">
                <label>NOME COMPLETO</label>
                <input type="text" value={barberData.name} onChange={e => setBarberData({...barberData, name: e.target.value})} placeholder="Ex: Marcos Silva" required />
              </div>
              <div className="input-group">
                <label>E-MAIL PROFISSIONAL</label>
                <input type="email" value={barberData.email} onChange={e => setBarberData({...barberData, email: e.target.value})} placeholder="marcos@mustache.club" required />
              </div>
              <div className="input-group">
                <label>SENHA DE ACESSO</label>
                <input type="password" value={barberData.password} onChange={e => setBarberData({...barberData, password: e.target.value})} placeholder="••••••••" required />
              </div>
              <button type="submit" className="premium-btn" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? 'CADASTRANDO...' : 'CONFIRMAR CADASTRO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
