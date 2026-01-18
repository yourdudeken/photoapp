import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/QRCode.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Auth from './pages/Auth';
import Capture from './pages/Capture';
import Gallery from './pages/Gallery';
import QRLogin from './pages/QRLogin';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
      if (!e.target.closest('.mobile-nav') && !e.target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    navigate('/auth');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '', exact: true },
    { path: '/capture', label: 'Capture', icon: '' },
    { path: '/gallery', label: 'Gallery', icon: '' },
    { path: '/qr-login', label: 'QR Login', icon: '' },
  ];

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            {user && (
              <button
                className="mobile-menu-button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle menu"
              >
                {showMobileMenu ? 'Close' : 'Menu'}
              </button>
            )}
            <Link to="/" className="app-logo">
              <span className="logo-text">PhotoApp</span>
            </Link>
          </div>

          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>

            {user && (
              <div className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <span className="user-name">{user.username}</span>
                  <span className="dropdown-arrow">{showUserMenu ? '^' : 'v'}</span>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}>
                      Settings
                    </button>
                    <button onClick={handleLogout} className="danger">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {user && (
        <>
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => isActive && (item.exact ? location.pathname === item.path : true) ? 'active' : ''}
                    end={item.exact}
                  >
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Navigation */}
          <nav className={`mobile-nav ${showMobileMenu ? 'show' : ''}`}>
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => isActive && (item.exact ? location.pathname === item.path : true) ? 'active' : ''}
                    end={item.exact}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Overlay */}
          {showMobileMenu && <div className="mobile-overlay" onClick={() => setShowMobileMenu(false)} />}
        </>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/auth" element={<Auth onLogin={setUser} />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/qr-login" element={<QRLogin onLogin={setUser} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={user ? <Dashboard /> : <Auth onLogin={setUser} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
