import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TchescoLogo, LogIn, LogOut, Layout, X } from './Icons';

const MenuIcon = ({ size=28, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20 || location.pathname !== '/') {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll(); // Check immediately
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location]); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className={`nav-fixed ${scrolled ? 'nav-scrolled' : 'nav-transparent'}`} style={{ borderBottom: scrolled ? '2px solid var(--primary)' : 'none', padding: scrolled ? '10px 0' : '20px 0', transition: 'all 0.4s ease' }}>
      <div className="container nav-container">
        
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <TchescoLogo className="nav-logo-icon" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.9 }}>
            <span className="nav-brand-text">BARBERSHOP</span>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '5px' }}>
              <div style={{ flex: 1, height: '1px', background: 'white', opacity: 0.5 }}></div>
              <span className="nav-brand-sub">TCHESCO</span>
              <div style={{ flex: 1, height: '1px', background: 'white', opacity: 0.5 }}></div>
            </div>
          </div>
        </Link>
        
        <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <MenuIcon />}
        </div>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            INÍCIO
          </Link>
          <Link 
            to="/scheduling" 
            className={`nav-link ${location.pathname === '/scheduling' ? 'active' : ''}`}
          >
            AGENDAR
          </Link>
          
          {user?.subscription && (
            <Link 
              to="/subscriber-booking" 
              className={`nav-link ${location.pathname === '/subscriber-booking' ? 'active' : ''}`}
            >
              ASSINANTES
            </Link>
          )}

          {(user?.role === 'admin' || user?.role === 'barber') ? (
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <Layout size={18} /> PAINEL {user.name.toUpperCase()}
            </Link>
          ) : user && (
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              MEU PERFIL
            </Link>
          )}

          {user ? (
            <button 
              onClick={handleLogout} 
              className="nav-link" 
              style={{ 
                padding: '8px 16px', 
                border: '1px solid var(--primary)', 
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} /> SAIR
            </button>
          ) : (
            <Link 
              to="/login" 
              className="nav-link"
              style={{ 
                padding: '8px 16px', 
                border: '1px solid var(--primary)',
                background: 'transparent'
              }}
            >
              <LogIn size={16} /> ENTRAR
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
