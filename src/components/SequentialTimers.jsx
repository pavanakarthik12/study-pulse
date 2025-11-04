import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X, Coffee, Clock, Target, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import NotificationSidebar from './NotificationSidebar';

const SequentialTimers = ({ schedule, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSubjects, setCompletedSubjects] = useState([]);
  const [isBreakTime, setIsBreakTime] = useState(false);
  
  console.log('🎬 SequentialTimers initialized with schedule:', schedule);
  
  // Get current item (handles both subjects and breaks)
  const currentItem = schedule[currentIndex];
  const isCurrentBreak = currentItem?.break !== undefined;
  
  // Calculate subject-only items for progress tracking
  const subjectItems = schedule.filter(item => item.subject);
  const currentSubjectIndex = subjectItems.findIndex(s => s.subject === currentItem?.subject);
  
  // Initialize timer with current item duration
  useEffect(() => {
    if (currentItem && !isRunning) {
      if (isCurrentBreak) {
        console.log(`☕ Auto-starting break: ${currentItem.break} minutes`);
        setTimeRemaining(currentItem.break * 60);
        setIsBreakTime(true);
        // Auto-start breaks immediately
        setIsRunning(true);
        setIsPaused(false);
      } else if (currentItem.subject) {
        console.log(`📚 Starting subject: ${currentItem.subject} (${currentItem.duration} min)`);
        setTimeRemaining(currentItem.duration * 60);
        setIsBreakTime(false);
      }
    }
  }, [currentIndex, currentItem, isRunning, isCurrentBreak]);
  
  const handleTimerComplete = useCallback(() => {
    if (!currentItem) return;
    
    // If it was a subject, mark as completed
    if (currentItem.subject) {
      console.log(`✅ Completed: ${currentItem.subject}`);
      setCompletedSubjects(prev => [...prev, currentItem.subject]);
    }
    
    // Check if there are more items
    if (currentIndex < schedule.length - 1) {
      console.log(`➡️ Moving to next item (${currentIndex + 1}/${schedule.length})`);
      setCurrentIndex(prev => prev + 1);
      setIsRunning(false);
      setIsPaused(false);
    } else {
      // All sessions completed - CONFETTI TIME!
      console.log('🎉 All sessions completed!');
      setIsRunning(false);
      triggerConfetti();
      
      if (onComplete) {
        onComplete(completedSubjects);
      }
      
      setTimeout(() => {
        alert('🎉 Session Complete! You finished all your study sessions! Amazing work! 🌟');
      }, 1000);
    }
  }, [currentIndex, currentItem, schedule, completedSubjects, onComplete]);
  
  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };
  
  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    
    if (isRunning && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer completed
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, timeRemaining, handleTimerComplete]);
  
  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };
  
  const pauseTimer = () => {
    setIsPaused(true);
  };
  
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  const skipSubject = () => {
    const itemName = isCurrentBreak ? 'this break' : currentItem?.subject || 'this session';
    if (window.confirm(`Skip ${itemName}?`)) {
      handleTimerComplete();
    }
  };
  
  const cancelAll = () => {
    if (window.confirm('Cancel all study sessions?')) {
      setIsRunning(false);
      setIsPaused(false);
      if (onCancel) {
        onCancel(completedSubjects);
      }
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgress = () => {
    if (!currentItem) return 0;
    const totalSeconds = isCurrentBreak 
      ? (currentItem.break * 60) 
      : (currentItem.duration * 60);
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };
  
  if (!currentItem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: '60px 40px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(30px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          color: 'rgba(255, 255, 255, 0.7)'
        }}
      >
        <Clock size={64} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.25rem', margin: 0 }}>No subjects to study. Generate a study plan first!</p>
      </motion.div>
    );
  }
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes scale-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .timer-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .timer-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .timer-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        
        .timer-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
      
    <div style={{
      display: 'flex',
      gap: '24px',
      alignItems: 'flex-start',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{
        flex: '1'
      }}>
        {/* Hero Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(30px)',
            borderRadius: '24px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '2rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Ambient Background */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a78bfa, #c084fc, #f472b6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem'
                }}>Focus Session</h3>
                <p style={{
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '1rem'
                }}>Stay focused, stay productive</p>
              </div>
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  padding: '1rem',
                  background: 'rgba(139, 92, 246, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Zap size={32} color="#a78bfa" />
              </motion.div>
            </div>
            
            {/* Progress Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem'
            }}>
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <Target size={20} color="#a78bfa" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                  {isCurrentBreak ? '☕' : `${currentSubjectIndex + 1}/${subjectItems.length}`}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
                  {isCurrentBreak ? 'Break Time' : 'Current Session'}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '16px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <CheckCircle size={20} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                  {completedSubjects.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
                  Completed
                </div>
              </div>
              
              <div style={{
                background: 'rgba(244, 114, 182, 0.1)',
                border: '1px solid rgba(244, 114, 182, 0.3)',
                borderRadius: '16px',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <TrendingUp size={20} color="#f472b6" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                  {Math.round(((currentIndex) / subjectItems.length) * 100)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
                  Progress
                </div>
              </div>
            </div>
            
            {/* Overall Progress Bar */}
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                <span>Overall Progress</span>
                <span>{currentIndex} of {subjectItems.length} sessions</span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex) / subjectItems.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #8b5cf6, #a78bfa, #c084fc)',
                    borderRadius: '6px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Progress Overview */}
        <div style={{
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '0.9em',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Subject {currentIndex + 1} of {subjectItems.length}
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s ease',
                width: `${((currentIndex) / subjectItems.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
        
        {/* Break Timer */}
        <AnimatePresence>
          {isBreakTime && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(249, 115, 22, 0.2))',
              backdropFilter: 'blur(30px)',
              borderRadius: '24px',
              border: '1px solid rgba(251, 146, 60, 0.4)',
              padding: '3rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Floating Animation Background */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none'
              }}
            />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontSize: '5rem',
                  marginBottom: '1.5rem',
                  display: 'inline-block'
                }}
              >
                <Coffee size={80} color="#fb923c" />
              </motion.div>
              
              <h4 style={{
                fontSize: '2.5rem',
                margin: '0 0 1rem 0',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Break Time!</h4>
              
              <p style={{
                fontSize: '1.125rem',
                margin: '0 0 2rem 0',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>Relax and recharge before your next session</p>
              
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  fontSize: '4rem',
                  fontWeight: 700,
                  fontFamily: "'Courier New', monospace",
                  background: 'rgba(251, 146, 60, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '1.5rem 3rem',
                  borderRadius: '20px',
                  display: 'inline-block',
                  color: 'white',
                  border: '2px solid rgba(251, 146, 60, 0.4)',
                  boxShadow: '0 8px 32px rgba(251, 146, 60, 0.3)'
                }}
              >
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </motion.div>
              
              <div style={{
                marginTop: '2rem',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                💡 Take a walk, stretch, or grab a snack
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
        
        {/* Current Subject Timer - Impressive Design */}
        <AnimatePresence>
          {!isBreakTime && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.6 }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px)',
                borderRadius: '24px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '2.5rem',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                animation: isRunning && !isPaused ? 'pulse-glow 3s infinite' : 'none',
                opacity: isPaused ? 0.7 : 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              {/* Dynamic Background Glow */}
              <motion.div
                animate={{
                  scale: isRunning ? [1, 1.2, 1] : 1,
                  opacity: isRunning ? [0.3, 0.5, 0.3] : 0.2
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '400px',
                  height: '400px',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                  filter: 'blur(80px)',
                  pointerEvents: 'none'
                }}
              />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <div>
                    <motion.h4
                      animate={{ scale: isRunning && !isPaused ? [1, 1.02, 1] : 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        margin: 0,
                        fontSize: '2.25rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #a78bfa, #c084fc, #f472b6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {currentItem.subject || 'Break Time'}
                    </motion.h4>
                    <p style={{
                      margin: '0.5rem 0 0 0',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '1rem'
                    }}>
                      {isRunning ? (isPaused ? '⏸️ Paused' : '🎯 In Progress') : '⏱️ Ready to start'}
                    </p>
                  </div>
                  
                  {currentItem.start && currentItem.end && (
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#c4b5fd',
                      fontSize: '0.9375rem',
                      fontWeight: 500
                    }}>
                      <Clock size={16} />
                      {currentItem.start} - {currentItem.end}
                    </div>
                  )}
                </div>
                
                {/* Circular Timer Display */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  margin: '2rem 0'
                }}>
                  <motion.div
                    animate={{ rotate: isRunning && !isPaused ? 360 : 0 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: 'relative',
                      width: '280px',
                      height: '280px'
                    }}
                  >
                    {/* Outer Glow Ring */}
                    <div style={{
                      position: 'absolute',
                      inset: '-10px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, rgba(139, 92, 246, 0.3), rgba(244, 114, 182, 0.3), rgba(139, 92, 246, 0.3))',
                      filter: 'blur(20px)',
                      opacity: isRunning && !isPaused ? 0.8 : 0.3,
                      transition: 'opacity 0.5s ease'
                    }} />
                    
                    <svg style={{
                      transform: 'rotate(-90deg)',
                      filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))'
                    }} width="280" height="280">
                      {/* Background Circle */}
                      <circle
                        style={{
                          fill: 'none',
                          stroke: 'rgba(255, 255, 255, 0.1)',
                          strokeWidth: '12'
                        }}
                        cx="140"
                        cy="140"
                        r="120"
                      />
                      {/* Progress Circle */}
                      <motion.circle
                        initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 120 * (1 - getProgress() / 100)
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                          fill: 'none',
                          stroke: 'url(#gradient)',
                          strokeWidth: '12',
                          strokeLinecap: 'round',
                          strokeDasharray: `${2 * Math.PI * 120}`
                        }}
                        cx="140"
                        cy="140"
                        r="120"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                          <stop offset="50%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#f472b6', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Center Time Display */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}>
                      <motion.div
                        animate={{ scale: isRunning && !isPaused && timeRemaining <= 60 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                          fontSize: '3.5rem',
                          fontWeight: 700,
                          fontFamily: "'Courier New', monospace",
                          background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          lineHeight: 1,
                          marginBottom: '0.5rem'
                        }}
                      >
                        {formatTime(timeRemaining)}
                      </motion.div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontWeight: 500
                      }}>
                        {Math.round(getProgress())}% Complete
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Duration Info */}
                  <div style={{
                    marginTop: '2rem',
                    display: 'flex',
                    gap: '2rem',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Duration
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: 'white'
                      }}>
                        {isCurrentBreak ? `${currentItem.break} min` : `${currentItem.duration} min`}
                      </div>
                    </div>
                    
                    <div style={{
                      width: '1px',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }} />
                    
                    <div style={{
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Remaining
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#a78bfa'
                      }}>
                        {Math.ceil(timeRemaining / 60)} min
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {!isRunning ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startTimer}
                      style={{
                        padding: '1rem 3rem',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.9))',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Play size={24} fill="white" />
                      Start Session
                    </motion.button>
                  ) : isPaused ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resumeTimer}
                        style={{
                          padding: '0.875rem 2rem',
                          border: 'none',
                          borderRadius: '14px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))',
                          color: 'white',
                          boxShadow: '0 6px 24px rgba(34, 197, 94, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Play size={20} fill="white" />
                        Resume
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={skipSubject}
                        style={{
                          padding: '0.875rem 2rem',
                          border: '1px solid rgba(251, 146, 60, 0.5)',
                          borderRadius: '14px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: 'rgba(251, 146, 60, 0.2)',
                          color: '#fdba74',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <SkipForward size={20} />
                        Skip
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={pauseTimer}
                        style={{
                          padding: '0.875rem 2rem',
                          border: '1px solid rgba(251, 146, 60, 0.5)',
                          borderRadius: '14px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: 'rgba(251, 146, 60, 0.2)',
                          color: '#fdba74',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Pause size={20} />
                        Pause
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={skipSubject}
                        style={{
                          padding: '0.875rem 2rem',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '14px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <SkipForward size={20} />
                        Skip
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelAll}
                    style={{
                      padding: '0.875rem 2rem',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '14px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <X size={20} />
                    Cancel All
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Upcoming Subjects Queue */}
        {subjectItems.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <h5 style={{
              margin: '0 0 1rem 0',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1.125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={20} color="#a78bfa" />
              Upcoming Sessions
            </h5>
            <div className="timer-scrollbar" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: '400px',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}>
              {subjectItems.map((item, index) => {
                if (index <= currentIndex) return null;
                
                const breakBefore = schedule.find((s, idx) => {
                  const prevSubjectIdx = schedule.findIndex(si => si.subject === subjectItems[index - 1]?.subject);
                  const currSubjectIdx = schedule.findIndex(si => si.subject === item.subject);
                  return idx > prevSubjectIdx && idx < currSubjectIdx && s.break;
                });
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (index - currentIndex) * 0.1 }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '14px',
                      padding: '1rem',
                      borderLeft: '4px solid rgba(139, 92, 246, 0.6)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Subtle Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)',
                      pointerEvents: 'none'
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {breakBefore && (
                        <div style={{
                          fontSize: '0.8125rem',
                          color: '#fb923c',
                          marginBottom: '0.5rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}>
                          <Coffee size={14} />
                          {breakBefore.break} min break before this
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                          <div style={{
                            fontWeight: 600,
                            color: 'white',
                            fontSize: '1rem',
                            marginBottom: '0.25rem'
                          }}>
                            {item.subject}
                          </div>
                          <div style={{
                            fontSize: '0.8125rem',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }}>
                            Session {index + 1} of {subjectItems.length}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.4)',
                            color: '#c4b5fd',
                            padding: '0.375rem 0.875rem',
                            borderRadius: '10px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                          }}>
                            <Clock size={12} />
                            {item.duration} min
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}>
                            {item.start}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        
        {/* Completed Subjects */}
        {completedSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              backdropFilter: 'blur(30px)',
              borderRadius: '20px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '1.5rem'
            }}
          >
            <h5 style={{
              margin: '0 0 1rem 0',
              color: '#22c55e',
              fontSize: '1.125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={20} />
              Completed Sessions
            </h5>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              {completedSubjects.map((subject, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))',
                    color: 'white',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '14px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <CheckCircle size={16} />
                  {subject}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Notification Sidebar */}
      <NotificationSidebar 
        currentSubject={currentItem}
        timeRemaining={timeRemaining}
        isBreak={isBreakTime}
        schedule={subjectItems}
        currentIndex={currentIndex}
      />
    </div>
    </>
  );
};

export default SequentialTimers;