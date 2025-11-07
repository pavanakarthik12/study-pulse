import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X, Coffee, Clock, Target, CheckCircle, Zap, TrendingUp, BookOpen, Bell } from 'lucide-react';
import NotificationSidebar from './NotificationSidebar';

const SequentialTimers = ({ schedule, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSubjects, setCompletedSubjects] = useState([]);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [skippedSubjects, setSkippedSubjects] = useState([]);
  const [pausedSubjects, setPausedSubjects] = useState([]);
  
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
        onComplete({
          completedSubjects,
          skippedSubjects,
          pausedSubjects
        });
      }
      
      setTimeout(() => {
        alert('🎉 Session Complete! You finished all your study sessions! Amazing work! 🌟');
      }, 1000);
    }
  }, [currentIndex, currentItem, schedule, completedSubjects, onComplete, skippedSubjects, pausedSubjects]);
  
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
    if (currentItem?.subject && !pausedSubjects.includes(currentItem.subject)) {
      setPausedSubjects(prev => [...prev, currentItem.subject]);
    }
  };
  
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  const skipSubject = () => {
    const itemName = isCurrentBreak ? 'this break' : currentItem?.subject || 'this session';
    if (window.confirm(`Skip ${itemName}?`)) {
      if (currentItem?.subject) {
        setSkippedSubjects(prev => [...prev, currentItem.subject]);
      }
      handleTimerComplete();
    }
  };
  
  const cancelAll = () => {
    if (window.confirm('Cancel all study sessions?')) {
      setIsRunning(false);
      setIsPaused(false);
      if (onCancel) {
        onCancel({
          completedSubjects,
          skippedSubjects,
          pausedSubjects
        });
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
          padding: '40px 30px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          color: 'rgba(255, 255, 255, 0.7)'
        }}
      >
        <Clock size={48} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
        <p style={{ fontSize: '1rem', margin: 0 }}>No subjects to study. Generate a study plan first!</p>
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
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
          }
        }
        
        .timer-progress {
          transition: all 0.3s ease;
        }
      `}</style>
      
      {/* Sticky Active Timer Card at the Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'sticky',
          top: '1rem',
          zIndex: 100,
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(22px)',
          borderRadius: '18px',
          border: '1px solid rgba(139, 92, 246, 0.32)',
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {isCurrentBreak ? (
              <Coffee size={24} color="#4ade80" />
            ) : (
              <BookOpen size={24} color="#8b5cf6" />
            )}
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'white',
                margin: 0
              }}>
                {isCurrentBreak ? '☕ Break Time' : currentItem.subject}
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0
              }}>
                {isCurrentBreak 
                  ? `Relax for ${currentItem.break} minutes` 
                  : `${currentItem.duration} minutes study session`}
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              textAlign: 'right'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '0.25rem'
              }}>
                Session {currentIndex + 1} of {schedule.length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#a78bfa',
                fontWeight: 600
              }}>
                {currentItem.start} - {currentItem.end}
              </div>
            </div>
            
            {/* Notification Button */}
            <button
              onClick={() => setShowNotifications(true)}
              style={{
                padding: '0.5rem',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.2)'}
            >
              <Bell size={20} color="#a78bfa" />
            </button>
          </div>
        </div>
        
        {/* Circular Progress Timer */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '1.25rem 0'
        }}>
          <div style={{
            position: 'relative',
            width: '240px',
            height: '240px'
          }}>
            {/* Background Circle */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '6px solid rgba(255, 255, 255, 0.1)'
            }} />
            
            {/* Progress Circle */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${isCurrentBreak ? '#4ade80' : '#8b5cf6'} 0%, ${isCurrentBreak ? '#4ade80' : '#8b5cf6'} ${getProgress()}%, transparent ${getProgress()}%, transparent 100%)`,
              mask: 'radial-gradient(black 55%, transparent 56%)',
              WebkitMask: 'radial-gradient(black 55%, transparent 56%)'
            }} />
            
            {/* Center Content */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: '0.25rem',
                fontFamily: 'monospace'
              }}>
                {formatTime(timeRemaining)}
              </div>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                {isCurrentBreak ? 'Break Remaining' : 'Time Remaining'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.25rem'
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRunning && !isPaused ? pauseTimer : isPaused ? resumeTimer : startTimer}
            style={{
              padding: '0.9rem 1.6rem',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 6px 22px rgba(139, 92, 246, 0.42)'
            }}
          >
            {isRunning && !isPaused ? (
              <>
                <Pause size={18} />
                Pause
              </>
            ) : (
              <>
                <Play size={18} style={{ marginLeft: '2px' }} />
                {isPaused ? 'Resume' : 'Start'}
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={skipSubject}
            style={{
              padding: '0.9rem 1.6rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <SkipForward size={16} />
            Skip
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cancelAll}
            style={{
              padding: '0.9rem 1.6rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '14px',
              color: '#fca5a5',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <X size={16} />
            Cancel
          </motion.button>
        </div>
      </motion.div>
      
      {/* Schedule Overview */}
      <div style={{
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(22px)',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 10px 34px rgba(0, 0, 0, 0.32)'
      }}>
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'white',
          margin: '0 0 1.1rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <TrendingUp size={18} color="#8b5cf6" />
          Study Schedule
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
          maxHeight: '340px',
          overflowY: 'auto'
        }}>
          {schedule.map((item, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: '14px',
                background: index === currentIndex 
                  ? 'rgba(139, 92, 246, 0.2)' 
                  : index < currentIndex
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(255, 255, 255, 0.03)',
                border: index === currentIndex 
                  ? '1px solid rgba(139, 92, 246, 0.5)' 
                  : index < currentIndex
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              {index < currentIndex ? (
                <CheckCircle size={18} color="#4ade80" style={{ marginRight: '0.75rem' }} />
              ) : index === currentIndex ? (
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#8b5cf6',
                  marginRight: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'white'
                  }} />
                </div>
              ) : (
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  marginRight: '0.75rem'
                }} />
              )}
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: index === currentIndex ? 600 : 400,
                  color: 'white',
                  marginBottom: '0.125rem'
                }}>
                  {item.break ? `☕ Break (${item.break} min)` : item.subject}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  {item.start} - {item.end}
                </div>
              </div>
              
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: index < currentIndex ? '#4ade80' : 'rgba(255, 255, 255, 0.6)'
              }}>
                {item.duration || item.break} min
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Notification Panel - Slide-in when triggered */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '80px',
              right: 0,
              bottom: 0,
              width: '320px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(139, 92, 246, 0.3)',
              zIndex: 1200,
              padding: '1.25rem',
              overflowY: 'auto'
            }}
          >
            <NotificationSidebar 
              currentSubject={currentItem}
              timeRemaining={timeRemaining}
              isBreak={isCurrentBreak}
              schedule={schedule}
              currentIndex={currentIndex}
              onClose={() => setShowNotifications(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SequentialTimers;