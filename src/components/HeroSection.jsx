import React, { useId, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
  },
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const waveVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 0.3,
    transition: {
      pathLength: { duration: 2, ease: "easeInOut" },
      opacity: { duration: 0.5 },
    },
  },
};

// HoverButton Component
const HoverButton = ({ children, href, custom, variants, primary = false }) => {
  const buttonRef = React.useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [circles, setCircles] = useState([]);
  const lastAddedRef = React.useRef(0);

  const createCircle = React.useCallback((x, y) => {
    const buttonWidth = buttonRef.current?.offsetWidth || 0;
    const xPos = x / buttonWidth;
    const color = primary 
      ? `linear-gradient(to right, rgba(139, 92, 246, 0.6) ${xPos * 100}%, rgba(168, 85, 247, 0.8) ${xPos * 100}%)`
      : `linear-gradient(to right, rgba(139, 92, 246, 0.4) ${xPos * 100}%, rgba(192, 132, 252, 0.6) ${xPos * 100}%)`;

    setCircles((prev) => [
      ...prev,
      { id: Date.now(), x, y, color, fadeState: null },
    ]);
  }, [primary]);

  const handlePointerMove = React.useCallback(
    (event) => {
      if (!isListening) return;
      
      const currentTime = Date.now();
      if (currentTime - lastAddedRef.current > 100) {
        lastAddedRef.current = currentTime;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        createCircle(x, y);
      }
    },
    [isListening, createCircle]
  );

  const handlePointerEnter = React.useCallback(() => {
    setIsListening(true);
  }, []);

  const handlePointerLeave = React.useCallback(() => {
    setIsListening(false);
  }, []);

  React.useEffect(() => {
    circles.forEach((circle) => {
      if (!circle.fadeState) {
        setTimeout(() => {
          setCircles((prev) =>
            prev.map((c) =>
              c.id === circle.id ? { ...c, fadeState: "in" } : c
            )
          );
        }, 0);

        setTimeout(() => {
          setCircles((prev) =>
            prev.map((c) =>
              c.id === circle.id ? { ...c, fadeState: "out" } : c
            )
          );
        }, 1000);

        setTimeout(() => {
          setCircles((prev) => prev.filter((c) => c.id !== circle.id));
        }, 2200);
      }
    });
  }, [circles]);

  return (
    <motion.a
      ref={buttonRef}
      href={href}
      custom={custom}
      variants={variants}
      whileHover="hover"
      whileTap="tap"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '1.125rem 2.25rem',
        borderRadius: '9999px',
        fontSize: '1.125rem',
        fontWeight: 600,
        textDecoration: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        isolation: 'isolate',
        ...(primary ? {
          background: 'rgba(43, 55, 80, 0.15)',
          backdropFilter: 'blur(16px)',
          color: '#e9d5ff',
          boxShadow: `inset 0 0 0 1px rgba(170, 202, 255, 0.2),
                      inset 0 0 16px 0 rgba(170, 202, 255, 0.1),
                      inset 0 -3px 12px 0 rgba(170, 202, 255, 0.15),
                      0 1px 3px 0 rgba(0, 0, 0, 0.50),
                      0 4px 12px 0 rgba(0, 0, 0, 0.45)`,
        } : {
          background: 'rgba(43, 55, 80, 0.1)',
          backdropFilter: 'blur(16px)',
          color: '#c4b5fd',
          boxShadow: `inset 0 0 0 1px rgba(139, 92, 246, 0.3),
                      inset 0 0 12px 0 rgba(139, 92, 246, 0.08),
                      0 1px 3px 0 rgba(0, 0, 0, 0.40),
                      0 4px 12px 0 rgba(0, 0, 0, 0.35)`,
        })
      }}
    >
      {circles.map(({ id, x, y, color, fadeState }) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: -1,
            background: color,
            opacity: fadeState === "in" ? 0.75 : fadeState === "out" ? 0 : 0,
            transition: fadeState === "out" ? 'opacity 1.2s' : 'opacity 0.3s'
          }}
        />
      ))}
      {children}
    </motion.a>
  );
};

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

// Keyframe animations as strings
const keyframeAnimations = `
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.02); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

// Hero Section Component
const HeroSection = () => {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#0a0a0f'
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
      
      {/* Floating decorative waveform */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '200px',
          height: '100px',
          opacity: 0.5,
          zIndex: 1
        }}
        variants={floatingVariants}
        initial="initial"
        animate="animate"
      >
        <svg style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 4px 20px rgba(139, 92, 246, 0.4))'
        }} viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M0 50 Q 25 20, 50 50 T 100 50 T 150 50 T 200 50"
            stroke="url(#gradient)"
            strokeWidth="2"
            variants={waveVariants}
            initial="initial"
            animate="animate"
          />
          <motion.path
            d="M0 60 Q 25 40, 50 60 T 100 60 T 150 60 T 200 60"
            stroke="url(#gradient)"
            strokeWidth="1.5"
            variants={waveVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          />
          <motion.path
            d="M0 40 Q 25 15, 50 40 T 100 40 T 150 40 T 200 40"
            stroke="url(#gradient)"
            strokeWidth="1.5"
            variants={waveVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

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
      
      <motion.div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25), transparent)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1,
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          y: [0, -15, 0],
          opacity: [0.25, 0.55, 0.25],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Main content */}
      <motion.div 
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '900px',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Mood badge */}
        <motion.div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            padding: '0.625rem 1.25rem',
            background: 'rgba(20, 20, 30, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '9999px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 4px 24px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(139, 92, 246, 0.1)'
          }}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <span style={{ fontSize: '1.25rem' }}>✨</span>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.03em'
          }}>Focus · Calm · Flow</span>
        </motion.div>

        {/* Main title with gradient and underline */}
        <motion.h1 
          style={{
            fontSize: '5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 30%, #f472b6 70%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            textShadow: '0 0 80px rgba(139, 92, 246, 0.5)',
            position: 'relative',
            display: 'inline-block',
            paddingBottom: '0.5rem'
          }}
          variants={itemVariants}
        >
          Plan. Study. Reflect.
          <span style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #8b5cf6 20%, #c084fc 50%, #8b5cf6 80%, transparent)',
            borderRadius: '2px',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
          }} />
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          style={{
            fontSize: '1.375rem',
            color: '#a1a1aa',
            fontWeight: 500,
            marginBottom: '1rem',
            lineHeight: 1.6,
            maxWidth: '650px',
            marginLeft: 'auto',
            marginRight: 'auto',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
          }}
          variants={itemVariants}
        >
          A quiet place to build unstoppable habits & consistency.
        </motion.p>
        
        {/* Secondary subtitle */}
        <motion.p 
          style={{
            fontSize: '1.125rem',
            color: '#71717a',
            fontWeight: 400,
            marginBottom: '3rem',
            lineHeight: 1.5,
            maxWidth: '550px',
            marginLeft: 'auto',
            marginRight: 'auto',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
          }}
          variants={itemVariants}
        >
          Calm music & personal playlists for deep work
        </motion.p>

        {/* CTA Buttons with stagger */}
        <motion.div 
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}
          variants={itemVariants}
        >
          <HoverButton 
            href="/focus" 
            custom={0} 
            variants={buttonVariants}
            primary={true}
          >
            <span style={{ fontSize: '1.375rem' }}>🎯</span>
            Start a Focus Session
          </HoverButton>
          
          <HoverButton 
            href="/study" 
            custom={1} 
            variants={buttonVariants}
            primary={false}
          >
            <span style={{ fontSize: '1.375rem' }}>📚</span>
            Enter Study Mode
          </HoverButton>
        </motion.div>
        
        {/* Quick action links */}
        <motion.div 
          style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
          variants={itemVariants}
        >
          <motion.a
            href="/plan"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(139, 92, 246, 0.08)',
              color: '#a78bfa',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              borderColor: 'rgba(139, 92, 246, 0.4)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ fontSize: '1.125rem' }}>📅</span>
            Plan Today
          </motion.a>
          
          <motion.a
            href="/now"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(236, 72, 153, 0.08)',
              color: '#f472b6',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(236, 72, 153, 0.2)'
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: 'rgba(236, 72, 153, 0.15)',
              borderColor: 'rgba(236, 72, 153, 0.4)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ fontSize: '1.125rem' }}>⚡</span>
            Start Now
          </motion.a>
          
          <motion.a
            href="/block"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(6, 182, 212, 0.08)',
              color: '#22d3ee',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              borderColor: 'rgba(6, 182, 212, 0.4)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ fontSize: '1.125rem' }}>⏱️</span>
            Begin Focus Block
          </motion.a>
        </motion.div>
      </motion.div>
      
      {/* Progressive enhancement - fallback for reduced motion */}
      <noscript>
        <style>{`
          .motion-safe {animation: none !important; transition: none !important;}
        `}</style>
      </noscript>
    </section>
  );
};

export default HeroSection;