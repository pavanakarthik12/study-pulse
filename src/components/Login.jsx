import React, { useState, useId, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Sparkles Component
const SparklesCore = () => {
  const [init, setInit] = useState(false);
  const controls = useAnimation();
  const generatedId = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 1,
        },
      });
    }
  };

  return (
    <motion.div 
      animate={controls} 
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: 0,
        zIndex: 2
      }}
    >
      {init && (
        <Particles
          id={generatedId}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
          particlesLoaded={particlesLoaded}
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fullScreen: {
              enable: false,
              zIndex: 1,
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: false,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: ["#8b5cf6", "#ec4899", "#06b6d4"],
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "out",
                },
                random: false,
                speed: {
                  min: 0.1,
                  max: 0.5,
                },
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  width: 400,
                  height: 400,
                },
                value: 80,
              },
              opacity: {
                value: {
                  min: 0.1,
                  max: 0.5,
                },
                animation: {
                  enable: true,
                  speed: 1,
                  sync: false,
                },
              },
              shape: {
                type: "circle",
              },
              size: {
                value: {
                  min: 0.5,
                  max: 2,
                },
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};

const keyframeAnimations = `
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.02); }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#0a0a0f',
      paddingTop: '80px'
    }}>
      {/* Inject keyframe animations */}
      <style>{keyframeAnimations}</style>
      
      {/* Sparkles Effect Layer */}
      <SparklesCore />
      
      {/* Dark gradient background with glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                     radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 50%),
                     radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)`,
        filter: 'blur(60px)',
        animation: 'pulseGlow 8s ease-in-out infinite'
      }} />
      
      {/* Additional background elements */}
      <div style={{
        position: 'absolute',
        top: '25%',
        right: '25%',
        width: '384px',
        height: '384px',
        background: 'rgba(139, 92, 246, 0.08)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '25%',
        width: '320px',
        height: '320px',
        background: 'rgba(6, 182, 212, 0.08)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />

      {/* Ambient floating orbs */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div 
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25), transparent)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        animate={{
          y: [0, 15, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Centered glass card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '400px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(18, 18, 18, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(139, 92, 246, 0.2)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
        }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
        </div>
        
        {/* Title */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'white',
          marginBottom: '1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #f472b6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Welcome Back
        </h2>
        
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%'
          }}>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
            />
            
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }}
            />
            
            {error && (
              <div style={{
                fontSize: '0.875rem',
                color: '#f87171',
                textAlign: 'left'
              }}>
                {error}
              </div>
            )}
          </div>
          
          <hr style={{
            margin: '1.5rem 0',
            opacity: 0.1,
            border: 'none',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }} />
          
          <div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: 'rgba(139, 92, 246, 0.8)',
                color: 'white',
                fontWeight: 600,
                padding: '0.75rem 1.25rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 1)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.8)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
              }}
            >
              Sign in
            </motion.button>
            
            <div style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  style={{
                    textDecoration: 'underline',
                    color: 'rgba(255, 255, 255, 0.8)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'white'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
                >
                  Sign Up
                </Link>
              </span>
            </div>
          </div>
        </form>
      </motion.div>
      
      {/* User count and avatars */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        marginTop: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'absolute',
        bottom: '2rem'
      }}>
        <p style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
          marginBottom: '0.5rem'
        }}>
          Join <span style={{ fontWeight: 500, color: 'white' }}>thousands</span> of
          students already studying smarter.
        </p>
        <div style={{ display: 'flex', gap: '-8px' }}>
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #0a0a0f',
              objectFit: 'cover',
              marginLeft: '-8px'
            }}
          />
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="user"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #0a0a0f',
              objectFit: 'cover',
              marginLeft: '-8px'
            }}
          />
          <img
            src="https://randomuser.me/api/portraits/men/54.jpg"
            alt="user"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #0a0a0f',
              objectFit: 'cover',
              marginLeft: '-8px'
            }}
          />
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="user"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #0a0a0f',
              objectFit: 'cover',
              marginLeft: '-8px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;