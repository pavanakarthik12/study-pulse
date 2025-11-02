import React, { useState, useId, useEffect, memo, useRef } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useAnimation, useInView, useMotionTemplate, useMotionValue } from 'framer-motion';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Eye, EyeOff } from 'lucide-react';

// ==================== Ripple Component ====================
const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 11,
  className = '',
}) {
  return (
    <section
      className={`absolute inset-0 flex items-center justify-center ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
      }}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';

        return (
          <span
            key={i}
            className='absolute rounded-full border'
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              animationDelay: animationDelay,
              borderStyle: borderStyle,
              borderWidth: '1px',
              borderColor: 'rgba(139, 92, 246, 0.2)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'ripple 2s ease infinite',
              background: 'rgba(139, 92, 246, 0.05)'
            }}
          />
        );
      })}
    </section>
  );
});

// ==================== BoxReveal Component ====================
const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor = '#8b5cf6',
  duration = 0.5,
  className = '',
}) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    } else {
      slideControls.start('hidden');
      mainControls.start('hidden');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        width,
        overflow: 'hidden',
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        animate={mainControls}
        transition={{ duration, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial='hidden'
        animate={slideControls}
        transition={{ duration, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor,
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== Enhanced Input Component ====================
const EnhancedInput = memo(function EnhancedInput({ 
  className = '', 
  type = 'text', 
  ...props 
}) {
  const radius = 120;
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
            rgba(139, 92, 246, 0.5),
            transparent 80%
          )
        `,
        borderRadius: '12px',
        padding: '2px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <input
        type={type}
        style={{
          width: '100%',
          height: '42px',
          padding: '10px 14px',
          fontSize: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '10px',
          color: 'white',
          outline: 'none',
          transition: 'all 0.3s ease',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
        onFocus={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.08)';
          e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)';
          e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 20px rgba(139, 92, 246, 0.3)';
        }}
        onBlur={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.03)';
          e.target.style.border = '1px solid rgba(255, 255, 255, 0.18)';
          e.target.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
        className={className}
        {...props}
      />
    </motion.div>
  );
});

// ==================== Sparkles Component ====================
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
        transition: { duration: 1 },
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
            background: { color: { value: "transparent" } },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: true,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: { value: ["#8b5cf6", "#ec4899", "#06b6d4"] },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: false,
                speed: { min: 0.1, max: 0.5 },
                straight: false,
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: 80,
              },
              opacity: {
                value: { min: 0.1, max: 0.5 },
                animation: { enable: true, speed: 1, sync: false },
              },
              shape: { type: "circle" },
              size: { value: { min: 0.5, max: 2 } },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};

// ==================== Main Login Component ====================
const keyframeAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=Momo+Trust+Display&family=Outfit:wght@100..900&family=Playwrite+AU+TAS:wght@100..400&display=swap');
  
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.02); }
  }
  @keyframes ripple {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(0.9); }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
      overflow: 'hidden',
      background: '#0a0a0f',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <style>{keyframeAnimations}</style>
      
      {/* Left Side - Decorative */}
      <div style={{
        position: 'relative',
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}
      className="max-lg:hidden">
        <SparklesCore />
        <Ripple mainCircleSize={100} />
        
        {/* Gradient backgrounds */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 50%)`,
          filter: 'blur(60px)',
          animation: 'pulseGlow 8s ease-in-out infinite'
        }} />

        {/* Floating orbs */}
        <motion.div 
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
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

        {/* Main tagline */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            maxWidth: '600px'
          }}
        >
          <h1 
            style={{
              fontSize: '4rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1rem',
              lineHeight: 1.2,
              cursor: 'pointer',
              position: 'relative',
              display: 'inline-block',
              fontFamily: "'Outfit', sans-serif"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span
              style={{
                position: 'relative',
                display: 'inline-block',
                textShadow: isHovered ? '0 0 40px rgba(139, 92, 246, 1), 0 0 80px rgba(139, 92, 246, 0.8)' : '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.6)',
                transition: 'text-shadow 0.3s ease'
              }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
                style={{ display: 'inline-block' }}
              >
                Study{' '}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                style={{ display: 'inline-block' }}
              >
                in{' '}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ display: 'inline-block' }}
              >
                Flow.
              </motion.span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ 
                  width: '100%'
                }}
                transition={{ 
                  duration: 1,
                  delay: 0.8,
                  ease: "easeOut"
                }}
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  height: '3px',
                  background: 'linear-gradient(to right, #8b5cf6, #ec4899, #06b6d4)',
                  borderRadius: '2px',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)'
                }}
              />
            </span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 300
            }}
          >
            Learn smarter, not harder with AI-powered study tools
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div style={{
        position: 'relative',
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '2rem',
        paddingTop: '15vh',
        background: 'rgba(10, 10, 15, 0.8)'
      }}
      className="max-lg:w-full">
        {/* Glass card container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '420px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(0, 0, 0, 0.2)',
            padding: '2.5rem 2rem',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.2)',
              margin: '0 auto 1.5rem',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <span style={{ fontSize: '2rem' }}>✨</span>
          </motion.div>
          
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '0.5rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Welcome Back
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '1.75rem',
              fontSize: '0.9375rem'
            }}
          >
            Sign in to your account to continue
          </motion.p>
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem',
                width: '100%'
              }}
            >
              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '0.4rem'
                }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                
                <EnhancedInput
                  placeholder="Enter your email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '0.5rem'
                }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                
                <div style={{ position: 'relative' }}>
                  <EnhancedInput
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255, 255, 255, 0.6)',
                      padding: '4px',
                      transition: 'color 0.2s',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(139, 92, 246, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {showPassword ? (
                      <Eye style={{ width: '20px', height: '20px' }} />
                    ) : (
                      <EyeOff style={{ width: '20px', height: '20px' }} />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: '0.875rem',
                    color: '#fca5a5',
                    textAlign: 'left',
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              style={{ marginTop: '1.75rem' }}
            >
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.9))',
                  color: 'white',
                  fontWeight: 600,
                  padding: '0.875rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 30px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
                }}
              >
                Sign in →
              </motion.button>
              
              <div style={{
                width: '100%',
                textAlign: 'center',
                marginTop: '1.5rem'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#9ca3af'
                }}>
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    style={{
                      color: '#a78bfa',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#c084fc'}
                    onMouseLeave={(e) => e.target.style.color = '#a78bfa'}
                  >
                    Sign Up
                  </Link>
                </span>
              </div>
            </motion.div>
          </form>
        </motion.div>
        
        {/* Bottom user avatars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{
            marginTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <p style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            marginBottom: '0.75rem'
          }}>
            Join <span style={{ fontWeight: 600, color: 'white' }}>thousands</span> of students studying smarter
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="user"
              style={{
                width: '36px',
                height: '36px',
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
                width: '36px',
                height: '36px',
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
                width: '36px',
                height: '36px',
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
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '2px solid #0a0a0f',
                objectFit: 'cover',
                marginLeft: '-8px'
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;