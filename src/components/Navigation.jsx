import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'framer-motion';

const Navigation = () => {
  const [user] = useAuthState(auth);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Momo+Trust+Display&family=Outfit:wght@100..900&family=Playwrite+AU+TAS:wght@100..400&display=swap');
      `}</style>
      
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 -1px 0 rgba(139, 92, 246, 0.1)',
        fontFamily: "'Outfit', sans-serif"
      }}>
        {/* Subtle gradient glow at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6) 20%, rgba(192, 132, 252, 0.6) 50%, rgba(139, 92, 246, 0.6) 80%, transparent)',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
        }} />
        
        {/* Ambient background glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          width: '200px',
          height: '100%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          position: 'absolute',
          top: 0,
          right: '20%',
          width: '200px',
          height: '100%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          <Link 
            to="/" 
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              position: 'relative',
              transition: 'all 0.3s ease',
              display: 'inline-block'
            }}
          >
            <span style={{
              position: 'relative',
              display: 'inline-block'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(139, 92, 246, 0.4)'
              }}>S</span>
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, #8b5cf6 0%, #c084fc 100%)',
                borderRadius: '1px',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)'
              }} />
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(139, 92, 246, 0.4)'
            }}>tudy Pulse</span>
          </Link>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/dashboard" 
                    style={{
                      padding: '0.625rem 1.5rem',
                      color: '#c4b5fd',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                    }}
                  >
                    Dashboard
                  </Link>
                </motion.div>
                
                <motion.button 
                  onClick={() => auth.signOut()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.625rem 1.5rem',
                    background: 'rgba(43, 55, 80, 0.15)',
                    backdropFilter: 'blur(12px)',
                    color: '#e9d5ff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: `inset 0 0 0 1px rgba(170, 202, 255, 0.2),
                                inset 0 0 12px 0 rgba(170, 202, 255, 0.08),
                                0 2px 8px 0 rgba(0, 0, 0, 0.3)`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `inset 0 0 0 1px rgba(170, 202, 255, 0.3),
                                                       inset 0 0 16px 0 rgba(170, 202, 255, 0.12),
                                                       0 4px 12px 0 rgba(139, 92, 246, 0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `inset 0 0 0 1px rgba(170, 202, 255, 0.2),
                                                       inset 0 0 12px 0 rgba(170, 202, 255, 0.08),
                                                       0 2px 8px 0 rgba(0, 0, 0, 0.3)`;
                  }}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/login" 
                    style={{
                      padding: '0.625rem 1.5rem',
                      color: '#c4b5fd',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                    }}
                  >
                    Login
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/signup" 
                    style={{
                      padding: '0.625rem 1.5rem',
                      background: 'rgba(43, 55, 80, 0.15)',
                      backdropFilter: 'blur(12px)',
                      color: '#e9d5ff',
                      textDecoration: 'none',
                      borderRadius: '10px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      boxShadow: `inset 0 0 0 1px rgba(170, 202, 255, 0.2),
                                  inset 0 0 12px 0 rgba(170, 202, 255, 0.08),
                                  0 2px 8px 0 rgba(0, 0, 0, 0.3)`,
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `inset 0 0 0 1px rgba(170, 202, 255, 0.3),
                                                         inset 0 0 16px 0 rgba(170, 202, 255, 0.12),
                                                         0 4px 12px 0 rgba(139, 92, 246, 0.3)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `inset 0 0 0 1px rgba(170, 202, 255, 0.2),
                                                         inset 0 0 12px 0 rgba(170, 202, 255, 0.08),
                                                         0 2px 8px 0 rgba(0, 0, 0, 0.3)`;
                    }}
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;