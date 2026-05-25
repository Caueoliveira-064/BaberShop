import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, ShoppingCart, X } from '../components/Icons';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    // Mock products since seeding failed
    const mockProducts = [
      { id: 1, name: 'Pomada Modeladora', price: 45.00, description: 'Efeito matte e alta fixação.' },
      { id: 2, name: 'Óleo para Barba', price: 35.00, description: 'Hidrata e amacia os fios.' },
      { id: 3, name: 'Shampoo de Carvão', price: 50.00, description: 'Limpeza profunda do couro cabeludo.' }
    ];
    setProducts(mockProducts);
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="container fade-in page-section" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem' }}>Coleção <span style={{ color: 'var(--primary)' }}>Tchesco</span></h2>
        <button 
          onClick={() => setShowCart(true)}
          style={{ background: 'var(--glass)', color: 'white', padding: '10px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}
        >
          <ShoppingCart size={20} />
          Carrinho ({cart.length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        {products.map(p => (
          <div key={p.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={60} color="var(--primary)" opacity={0.3} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>{p.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexGrow: 1 }}>{p.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>R$ {p.price}</span>
              <button 
                className="premium-btn" 
                style={{ padding: '8px 15px', fontSize: '0.8rem' }}
                onClick={() => addToCart(p)}
              >
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCart && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: 'min(400px, 100%)', height: '100vh', background: 'var(--bg-card)', zIndex: 1000, padding: '30px', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3>Meu Carrinho</h3>
            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowCart(false)} />
          </div>
          
          <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Carrinho vazio...</p> : cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass)', padding: '15px', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem' }}>{item.name}</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: 600 }}>R$ {item.price}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.9rem' }}>x{item.qty}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 700, fontSize: '1.2rem' }}>
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button className="premium-btn" style={{ width: '100%' }} onClick={() => alert('Pedido finalizado!')}>FINALIZAR PEDIDO</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
