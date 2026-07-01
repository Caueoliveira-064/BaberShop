import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '../api.js';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/scheduling');
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 40%, rgba(255,204,0,0.07) 0%, transparent 60%), var(--bg-main)',
      padding: '20px',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,204,0,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,204,0,0.03)', pointerEvents: 'none' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--primary)', boxShadow: '0 0 40px rgba(255,204,0,0.35)',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '2rem' }}>✂️</span>
          </div>
          <h1 className="premium-font" style={{ fontSize: '1.6rem', margin: 0 }}>
            Tchesco <span style={{ color: 'var(--primary)' }}>Barbershop</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.9rem' }}>Entre na sua conta</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '20px',
          padding: '36px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* E-mail */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>E-MAIL</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '13px 14px 13px 42px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-main)', borderRadius: '12px', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>SENHA</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '13px 42px 13px 42px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-main)', borderRadius: '12px', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px', padding: '14px', borderRadius: '12px',
                background: loading ? 'rgba(255,204,0,0.5)' : 'var(--primary)',
                color: '#000', fontWeight: 800, fontSize: '0.95rem',
                letterSpacing: '1px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 8px 24px rgba(255,204,0,0.25)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'ENTRANDO...' : <><span>ACESSAR</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              Não tem conta?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Admin hint */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
          Admin demo: adm@adm / 123
        </p>
      </div>
    </div>
  );
};

export default Login;
