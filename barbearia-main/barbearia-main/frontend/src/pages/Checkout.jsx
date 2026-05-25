import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api.js';
import { CreditCard, CheckCircle } from '../components/Icons';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const plan = queryParams.get('plan') || 'basic';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix' or 'local'

  const planName = plan === 'premium' ? 'Assinatura Completa' : 'Assinatura Corte';
  const planPrice = plan === 'premium' ? 'R$ 110/mês' : 'R$ 60/mês';

  const handleCheckout = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Você precisa estar logado para assinar.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we activate it regardless of method
      const res = await api.post('/api/auth/subscribe', 
        { plan, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local storage user object
      const user = JSON.parse(localStorage.getItem('user'));
      user.subscription = plan;
      localStorage.setItem('user', JSON.stringify(user));
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/subscriber-booking');
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao processar assinatura');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CheckCircle size={80} color="var(--primary)" />
        <h2 style={{ marginTop: '20px' }}>{paymentMethod === 'pix' ? 'Pagamento Confirmado!' : 'Solicitação Enviada!'}</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {paymentMethod === 'pix' 
            ? `Você agora é um assinante VIP ${plan === 'premium' ? 'Completo' : 'Corte'}.`
            : `Sua assinatura ${plan === 'premium' ? 'Completa' : 'Corte'} foi pré-ativada. Valide o pagamento no local.`}
        </p>
        <p style={{ color: 'var(--text-main)', marginTop: '20px', fontSize: '0.8rem' }}>Redirecionando para a área exclusiva...</p>
      </div>
    );
  }

  return (
    <div className="container fade-in page-section" style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '60px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontFamily: 'Playfair Display' }}>Finalize sua <span style={{ color: 'var(--primary)' }}>Assinatura</span></h2>
      
      <div className="glass-card" style={{ padding: '30px' }}>
        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '5px' }}>Plano Selecionado: {planName}</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>Total: {planPrice}</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div className="checkout-grid" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', gridColumn: '1 / -1' }}>FORMA DE PAGAMENTO</label>
            <div 
              onClick={() => setPaymentMethod('pix')}
              className="glass-card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: paymentMethod === 'pix' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                background: paymentMethod === 'pix' ? 'rgba(255,204,0,0.1)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s'
              }}
            >
              <p style={{ fontWeight: 700, color: paymentMethod === 'pix' ? 'var(--primary)' : 'white' }}>PIX</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>Liberação imediata</p>
            </div>
            <div 
              onClick={() => setPaymentMethod('local')}
              className="glass-card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: paymentMethod === 'local' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                background: paymentMethod === 'local' ? 'rgba(255,204,0,0.1)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s'
              }}
            >
              <p style={{ fontWeight: 700, color: paymentMethod === 'local' ? 'var(--primary)' : 'white' }}>NO LOCAL</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>Pague na barbearia</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {paymentMethod === 'pix' ? (
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Escaneie o QR Code ou copie a chave abaixo:</p>
              <div style={{ width: '150px', height: '150px', background: 'white', margin: '0 auto 15px', padding: '10px', borderRadius: '8px' }}>
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TchescoBarbershopPix" alt="QR Code Pix" style={{ width: '100%' }} />
              </div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', wordBreak: 'break-all' }}>CHAVE PIX: tchesco.barbearia@pix.com.br</p>
              <button type="button" onClick={() => alert('Chave Pix Copiada!')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}>Copiar Chave</button>
            </div>
          ) : (
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                Você escolheu pagar presencialmente. Sua assinatura será marcada como <strong>Pendente</strong> até que você realize o pagamento em nossa unidade.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '10px' }}>
                *Apresente seu nome/e-mail no balcão.
              </p>
            </div>
          )}

          <button type="submit" className="premium-btn" disabled={loading} style={{ padding: '16px', fontSize: '1rem', letterSpacing: '2px', marginTop: '10px' }}>
            {loading ? 'PROCESSANDO...' : paymentMethod === 'pix' ? 'CONCLUÍDO (JÁ PAGUEI)' : 'CONFIRMAR ASSINATURA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
