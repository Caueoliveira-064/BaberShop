import React, { useState, useEffect } from 'react';
import { Settings, Eye, Type, X } from 'lucide-react';

const A11yButton = () => {
  const [open, setOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (highContrast) {
      html.classList.add('a11y-high-contrast');
    } else {
      html.classList.remove('a11y-high-contrast');
    }
    
    if (largeFont) {
      html.classList.add('a11y-font-large');
    } else {
      html.classList.remove('a11y-font-large');
    }
  }, [highContrast, largeFont]);

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999 }}>
      {open && (
        <div className="glass-card" style={{ marginBottom: '15px', padding: '15px', width: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary)' }}>Acessibilidade</span>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className="secondary-btn" 
            style={{ padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', borderColor: highContrast ? 'var(--primary)' : 'var(--glass-border)' }}
          >
            <Eye size={18} color={highContrast ? 'var(--primary)' : 'var(--text-main)'} /> 
            Alto Contraste {highContrast ? 'ON' : 'OFF'}
          </button>
          
          <button 
            onClick={() => setLargeFont(!largeFont)}
            className="secondary-btn" 
            style={{ padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', borderColor: largeFont ? 'var(--primary)' : 'var(--glass-border)' }}
          >
            <Type size={18} color={largeFont ? 'var(--primary)' : 'var(--text-main)'} /> 
            Fonte Maior {largeFont ? 'ON' : 'OFF'}
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setOpen(!open)}
        className="premium-btn"
        style={{ width: '50px', height: '50px', borderRadius: '25px', padding: 0, justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
        aria-label="Opções de Acessibilidade"
      >
        <Settings size={24} color="var(--bg-dark)" />
      </button>
    </div>
  );
};

export default A11yButton;
