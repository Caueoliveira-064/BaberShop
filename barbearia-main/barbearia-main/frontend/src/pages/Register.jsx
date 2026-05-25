import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Cadastro realizado com sucesso! Você já está logado.');
      navigate('/scheduling');
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao cadastrar');
    }
  };

  return (
    <div className="container fade-in page-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>CADASTRO</h2>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            type="text" 
            placeholder="Nome Completo" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '5px' }} 
          />
          <input 
            type="email" 
            placeholder="E-mail" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '5px' }} 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '5px' }} 
          />
          <button type="submit" className="premium-btn">REGISTRAR</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--primary)' }}>Entre aqui</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
