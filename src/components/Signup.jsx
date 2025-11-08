import React, { useState, useId, useEffect, memo, useRef } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useAnimation, useMotionTemplate, useMotionValue } from 'framer-motion';
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
        borderRadius: '10px',
        padding: '1.5px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <input
        type={type}
        style={{
          width: '95%',
          height: '38px',
          padding: '8px 12px',
          fontSize: '15px',
          fontFamily: "'Outfit', sans-serif",
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

// ==================== Main Signup Component ====================
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

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    // Check for at least one digit
    const hasDigit = /\d/.test(password);
    // Check for at least one special character
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    // Check minimum length
    const hasMinLength = password.length >= 8;
    
    return { hasDigit, hasSpecialChar, hasMinLength };
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    // Validate password requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!passwordValidation.hasDigit) {
      setError("Password must contain at least one digit (0-9).");
      return;
    }
    if (!passwordValidation.hasSpecialChar) {
      setError("Password must contain at least one special character (!@#$%^&*...).");
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      localStorage.setItem('firebaseToken', token);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
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
              fontSize: '3.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1rem',
              lineHeight: 1.3,
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
                style={{ 
                  display: 'inline-block',
                  position: 'relative'
                }}
              >
                You
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: '100%'
                  }}
                  transition={{ 
                    duration: 0.6,
                    delay: 0.3,
                    ease: "easeOut"
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    height: '3px',
                    background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)'
                  }}
                />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                style={{ display: 'inline-block' }}
              >
                {' '}don't need more time
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ display: 'inline-block' }}
              >
                {' '}— just more{' '}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                style={{ 
                  display: 'inline-block',
                  position: 'relative'
                }}
              >
                focus
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: '100%'
                  }}
                  transition={{ 
                    duration: 0.6,
                    delay: 0.8,
                    ease: "easeOut"
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    height: '3px',
                    background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)'
                  }}
                />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{ display: 'inline-block' }}
              >
                .
              </motion.span>
            </span>
          </h1>
        </motion.div>
      </div>

      {/* Right Side - Signup Form */}
      <div style={{
        position: 'relative',
        width: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        zIndex: 10
      }}
      className="max-lg:w-full">
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '380px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '20px',
            padding: '1.5rem 2rem',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.3))',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 0.75rem',
              fontSize: '1.25rem',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            ✨
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              textAlign: 'center',
              color: 'white',
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '0.375rem'
            }}
          >
            Create Account
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}
          >
            Sign up to start your journey
          </motion.p>
          
          {/* Form */}
          <form onSubmit={handleSignup} style={{ width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                width: '100%'
              }}
            >
              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '0.25rem'
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
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '0.25rem'
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
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'rgba(255, 255, 255, 0.6)',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div style={{
                  marginTop: '0.375rem',
                  padding: '0.5rem 0.625rem',
                  background: 'rgba(139, 92, 246, 0.08)',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <p style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '0.25rem',
                    fontWeight: 500
                  }}>
                    Password must contain:
                  </p>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.125rem',
                    fontSize: '0.6875rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.4'
                  }}>
                    <li style={{ 
                      color: password.length >= 8 ? '#86efac' : 'rgba(255, 255, 255, 0.6)',
                      transition: 'color 0.2s'
                    }}>
                      At least 8 characters
                    </li>
                    <li style={{ 
                      color: /\d/.test(password) ? '#86efac' : 'rgba(255, 255, 255, 0.6)',
                      transition: 'color 0.2s'
                    }}>
                      At least one digit (0-9)
                    </li>
                    <li style={{ 
                      color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '#86efac' : 'rgba(255, 255, 255, 0.6)',
                      transition: 'color 0.2s'
                    }}>
                      At least one special character (!@#$%^&*...)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '0.25rem'
                }}>
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                
                <div style={{ position: 'relative' }}>
                  <EnhancedInput
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'rgba(255, 255, 255, 0.6)',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontSize: '0.875rem',
                    textAlign: 'center'
                  }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.9))',
                  color: 'white',
                  fontWeight: 600,
                  padding: '0.625rem 1rem',
                  borderRadius: '10px',
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
                  e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(168, 85, 247, 1))';
                  e.target.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.9))';
                  e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
                }}
              >
                Create Account →
              </motion.button>
              
              <div style={{
                width: '100%',
                textAlign: 'center',
                marginTop: '0.75rem'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#9ca3af'
                }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#a78bfa',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#c084fc'}
                    onMouseLeave={(e) => e.target.style.color = '#a78bfa'}
                  >
                    Login
                  </Link>
                </span>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;