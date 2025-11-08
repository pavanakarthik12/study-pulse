import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X, Coffee, Clock, CheckCircle, TrendingUp, BookOpen, Bell, Check } from 'lucide-react';

const NotificationSidebar = ({ currentSubject, timeRemaining, isBreak, schedule, currentIndex, onClose }) => {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'white',
          margin: 0
        }}>
          Notifications
        </h3>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem',
            background: 'rgba(139, 92, 246, 0.15)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} color="#a78bfa" />
        </button>
      </div>
      
      <div style={{
        padding: '1rem',
        background: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
          Current Session
        </div>
        <div style={{ fontSize: '1rem', color: 'white', fontWeight: 600 }}>
          {isBreak ? 'Break Time' : currentSubject?.subject}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#a78bfa', marginTop: '0.5rem', fontWeight: 600 }}>
          Time Remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      </div>
      
      <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
        Stay focused! You're making great progress.
      </div>
    </div>
  );
};

const SequentialTimers = ({ schedule, onComplete, onCancel, onEditSchedule, handleStartSession, isSessionActive, subjects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSkipConfirmModal, setShowSkipConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showMotivationToast, setShowMotivationToast] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [sessionProgress, setSessionProgress] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentItem = schedule[currentIndex];
  const isCurrentBreak = currentItem?.break !== undefined;
  const subjectItems = schedule.filter(item => item.subject);

  useEffect(() => {
    const initialProgress = subjectItems.map(item => ({
      subject: item.subject,
      status: 'incomplete'
    }));
    setSessionProgress(initialProgress);
  }, [subjectItems]);

  useEffect(() => {
    if (currentItem && !isRunning && !isTransitioning) {
      let durationInSeconds = 0;
      
      if (isCurrentBreak) {
        const breakDuration = parseInt(currentItem.break);
        if (!isNaN(breakDuration) && breakDuration > 0) {
          durationInSeconds = breakDuration * 60;
        }
      } else if (currentItem.subject) {
        const subjectDuration = parseInt(currentItem.duration);
        if (!isNaN(subjectDuration) && subjectDuration > 0) {
          durationInSeconds = subjectDuration * 60;
        }
      }
      
      if (durationInSeconds > 0) {
        setTimeRemaining(durationInSeconds);
        setIsRunning(true);
        setIsPaused(false);
      }
    }
  }, [currentIndex, currentItem, isRunning, isCurrentBreak, isTransitioning]);

  useEffect(() => {
    if (schedule.length > 0 && currentItem && !isTransitioning) {
      let durationInSeconds = 0;
      
      if (isCurrentBreak) {
        const breakDuration = parseInt(currentItem.break);
        if (!isNaN(breakDuration) && breakDuration > 0) {
          durationInSeconds = breakDuration * 60;
        }
      } else if (currentItem.subject) {
        const subjectDuration = parseInt(currentItem.duration);
        if (!isNaN(subjectDuration) && subjectDuration > 0) {
          durationInSeconds = subjectDuration * 60;
        }
      }
      
      if (durationInSeconds > 0 && (!isRunning || currentIndex === 0)) {
        setTimeRemaining(durationInSeconds);
        setIsRunning(true);
        setIsPaused(false);
      }
    }
  }, [schedule, currentItem, isRunning, isCurrentBreak, isTransitioning, currentIndex]);

  useEffect(() => {
    if (schedule.length > 0 && !isRunning && !isTransitioning) {
      setCurrentIndex(0);
    }
  }, []);

  useEffect(() => {
    if (schedule.length > 0) {
      setCurrentIndex(0);
      setTimeRemaining(0);
      setIsRunning(false);
      setIsPaused(false);
      setIsTransitioning(false);
    }
  }, [JSON.stringify(schedule)]);

  const handleTimerComplete = useCallback(() => {
    if (showMotivationToast || isTransitioning) {
      return;
    }
    
    if (!currentItem) {
      return;
    }
    
    if (currentItem.subject) {
      setSessionProgress(prev => {
        const updated = prev.map(item => 
          item.subject === currentItem.subject 
            ? { ...item, status: 'completed' } 
            : item
        );
        return updated;
      });
    }
    
    if (currentIndex < schedule.length - 1) {
      setIsTransitioning(true);
      setIsRunning(false);
      setIsPaused(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 500);
    } else {
      setIsRunning(false);
      setIsPaused(false);
      
      setTimeout(() => {
        const currentProgress = sessionProgress;
        
        const completedSubjects = currentProgress
          .filter(item => item.status === 'completed')
          .map(item => item.subject);
          
        const skippedSubjects = currentProgress
          .filter(item => item.status === 'skipped')
          .map(item => item.subject);
          
        const pausedSubjects = currentProgress
          .filter(item => item.status === 'paused')
          .map(item => item.subject);
          
        const incompleteSubjects = currentProgress
          .filter(item => item.status === 'incomplete')
          .map(item => item.subject);
          
        const result = {
          completedSubjects,
          skippedSubjects,
          pausedSubjects,
          incompleteSubjects
        };
        
        setSessionResult(result);
        setShowSessionSummary(true);
        triggerConfetti();
      }, 100);
    }
  }, [currentIndex, currentItem, schedule, sessionProgress, showMotivationToast, isTransitioning]);

  const triggerConfetti = async () => {
    const confetti = (await import('canvas-confetti')).default;
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };
  
  useEffect(() => {
    let interval = null;
    
    if (isRunning && !isPaused && timeRemaining > 0 && !isTransitioning) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused, timeRemaining, isTransitioning]);
  
  const startTimer = () => {
    if (timeRemaining === 0 && currentItem) {
      let durationInSeconds = 0;
      if (isCurrentBreak) {
        const breakDuration = parseInt(currentItem.break);
        if (!isNaN(breakDuration) && breakDuration > 0) {
          durationInSeconds = breakDuration * 60;
        }
      } else if (currentItem.subject) {
        const subjectDuration = parseInt(currentItem.duration);
        if (!isNaN(subjectDuration) && subjectDuration > 0) {
          durationInSeconds = subjectDuration * 60;
        }
      }
      
      if (durationInSeconds > 0) {
        setTimeRemaining(durationInSeconds);
      }
    }
    
    setIsRunning(true);
    setIsPaused(false);
  };
  
  const pauseTimer = () => {
    setIsPaused(true);
    if (currentItem?.subject) {
      setSessionProgress(prev => prev.map(item => 
        item.subject === currentItem.subject ? { ...item, status: 'paused' } : item
      ));
    }
  };
  
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  const skipSubject = () => {
    setShowSkipConfirmModal(true);
  };
  
  const confirmSkip = () => {
    setShowSkipConfirmModal(false);
    
    if (currentItem?.subject) {
      setSessionProgress(prev => 
        prev.map(item => 
          item.subject === currentItem.subject 
            ? { ...item, status: 'skipped' } 
            : item
        )
      );
    }
    
    const quote = getMotivationalQuote();
    setMotivationalQuote(quote);
    
    setShowMotivationToast(true);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setShowMotivationToast(false);
      setTimeout(() => {
        setIsTransitioning(false);
        handleTimerComplete();
      }, 100);
    }, 2000);
  };
  
  const cancelSkip = () => {
    setShowSkipConfirmModal(false);
  };
  
  const cancelAll = () => {
    setShowCancelModal(true);
  };
  
  const confirmCancel = () => {
    setShowCancelModal(false);
    setIsRunning(false);
    setIsPaused(false);
    
    const remainingSubjects = schedule
      .slice(currentIndex)
      .filter(item => item.subject)
      .map(item => item.subject);
      
    setSessionProgress(prev => 
      prev.map(item => 
        remainingSubjects.includes(item.subject) 
          ? { ...item, status: 'incomplete' } 
          : item
      )
    );
    
    const updatedProgress = sessionProgress.map(item => 
      remainingSubjects.includes(item.subject) 
        ? { ...item, status: 'incomplete' } 
        : item
    );
    
    const completedSubjects = updatedProgress
      .filter(item => item.status === 'completed')
      .map(item => item.subject);
      
    const skippedSubjects = updatedProgress
      .filter(item => item.status === 'skipped')
      .map(item => item.subject);
      
    const pausedSubjects = updatedProgress
      .filter(item => item.status === 'paused')
      .map(item => item.subject);
      
    const incompleteSubjects = updatedProgress
      .filter(item => item.status === 'incomplete')
      .map(item => item.subject);
    
    const result = {
      completedSubjects,
      skippedSubjects,
      pausedSubjects,
      incompleteSubjects
    };
    
    if (onCancel) {
      onCancel(result);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgress = () => {
    if (!currentItem) {
      return 0;
    }
    const totalSeconds = isCurrentBreak 
      ? (currentItem.break * 60) 
      : (currentItem.duration * 60);
    if (isNaN(totalSeconds) || totalSeconds <= 0) {
      return 0;
    }
    return totalSeconds > 0 ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 : 0;
  };
  
  const getMotivationalQuote = () => {
    const currentSubjectProgress = sessionProgress.find(item => item.subject === currentItem?.subject);
    const isCurrentSubjectSkipped = currentSubjectProgress?.status === 'skipped';
    
    if (isCurrentSubjectSkipped) {
      const skipQuotes = [
        "Skipping is okay, but consistency builds champions!",
        "You can do this! Every subject you complete brings you closer to your goals.",
        "Don't let one skip derail your entire journey. Keep going!",
        "Champions aren't made by skipping, but by pushing through!",
        "Your future self will thank you for staying focused now."
      ];
      return skipQuotes[Math.floor(Math.random() * skipQuotes.length)];
    } else {
      const generalQuotes = [
        "You're closer than you think — stay focused!",
        "Push through just a bit more!",
        "Every minute you continue is a victory!",
        "Stay strong — you've got this!",
        "Keep going, champion!"
      ];
      return generalQuotes[Math.floor(Math.random() * generalQuotes.length)];
    }
  };

  const getSessionSummaryMessage = () => {
    const totalSubjects = subjectItems.length;
    const completedCount = sessionResult?.completedSubjects?.length || 0;
    const finishedPercentage = totalSubjects > 0 ? (completedCount / totalSubjects) * 100 : 0;
    
    if (finishedPercentage >= 80) {
      return (
        <div>
          <p style={{
            color: '#a78bfa',
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: '0 0 0.5rem 0'
          }}>
            Excellent work! You stayed focused from start to finish!
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            margin: 0
          }}>
            "Discipline is doing what needs to be done, even when you don't feel like it."
          </p>
        </div>
      );
    } else if (finishedPercentage >= 50) {
      return (
        <div>
          <p style={{
            color: '#c4b5fd',
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: '0 0 0.5rem 0'
          }}>
            You did fairly well today — a little more consistency and you'll crush it!
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            margin: 0
          }}>
            "Success is the sum of small efforts repeated day in and day out."
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <p style={{
            color: '#ddd6fe',
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: '0 0 0.5rem 0'
          }}>
            You ended too soon — success comes to those who stay consistent!
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            margin: 0
          }}>
            "The expert in anything was once a beginner who didn't give up."
          </p>
        </div>
      );
    }
  };

  if (!currentItem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(24px)',
          borderRadius: '16px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          color: 'rgba(255, 255, 255, 0.6)',
          maxWidth: '400px',
          margin: '0 auto'
        }}
      >
        <Clock size={48} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
        <p style={{ fontSize: '1rem', margin: 0, fontWeight: 500 }}>No subjects to study. Generate a study plan first!</p>
      </motion.div>
    );
  }
  
  return (
    <div style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'row',
      gap: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 100px)'
    }}>
      
      {/* Left Panel - Timer (Flashcard Style) */}
      <div style={{ flex: '0 0 480px', display: 'flex', alignItems: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: -90, opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.5,
              type: 'spring',
              stiffness: 100,
              damping: 15
            }}
            style={{
              width: '100%',
              height: '580px',
              padding: '2rem',
              background: 'rgba(17, 24, 39, 0.95)',
              backdropFilter: 'blur(24px)',
              borderRadius: '20px',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 20px 60px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.1) inset',
              display: 'flex',
              flexDirection: 'column',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isCurrentBreak ? 'rgba(34, 197, 94, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                  border: `1.5px solid ${isCurrentBreak ? 'rgba(34, 197, 94, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isCurrentBreak ? (
                    <Coffee size={20} color="#4ade80" />
                  ) : (
                    <BookOpen size={20} color="#a78bfa" />
                  )}
                </div>
                <div>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'white',
                    margin: '0 0 0.125rem 0',
                    letterSpacing: '-0.02em'
                  }}>
                    {isCurrentBreak ? 'Break Time' : currentItem.subject}
                  </h2>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: 'rgba(167, 139, 250, 0.8)',
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {isCurrentBreak 
                      ? `${currentItem.break} min break` 
                      : `${currentItem.duration} min session`}
                  </p>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.6875rem',
                  color: 'rgba(167, 139, 250, 0.6)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}>
                  {currentIndex + 1} / {schedule.length}
                </div>
                <div style={{
                  fontSize: '0.8125rem',
                  color: '#a78bfa',
                  fontWeight: 600,
                  padding: '0.25rem 0.625rem',
                  background: 'rgba(139, 92, 246, 0.15)',
                  borderRadius: '6px',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  {currentItem.start} - {currentItem.end}
                </div>
              </div>
            </div>
            
            {/* Circular Progress Timer */}
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{
                position: 'relative',
                width: '260px',
                height: '260px'
              }}>
                {/* Outer glow */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '-12px',
                  right: '-12px',
                  bottom: '-12px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${isCurrentBreak ? 'rgba(34, 197, 94, 0.2)' : 'rgba(139, 92, 246, 0.2)'} 0%, transparent 70%)`,
                  filter: 'blur(24px)'
                }} />
                
                {/* Background Circle */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'rgba(17, 24, 39, 0.8)',
                  border: '8px solid rgba(139, 92, 246, 0.1)'
                }} />
                
                {/* Progress Circle */}
                <svg style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transform: 'rotate(-90deg)'
                }}>
                  <circle
                    cx="130"
                    cy="130"
                    r="122"
                    fill="none"
                    stroke={isCurrentBreak ? '#4ade80' : '#8b5cf6'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(getProgress() / 100) * 766.72} 766.72`}
                    style={{
                      filter: `drop-shadow(0 0 10px ${isCurrentBreak ? 'rgba(34, 197, 94, 0.6)' : 'rgba(139, 92, 246, 0.6)'})`
                    }}
                  />
                </svg>
                
                {/* Center Content */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '3.75rem',
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: '0.25rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '-0.04em',
                    textShadow: '0 2px 12px rgba(139, 92, 246, 0.4)'
                  }}>
                    {formatTime(timeRemaining)}
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: 'rgba(167, 139, 250, 0.7)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em'
                  }}>
                    Remaining
                  </div>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
              marginTop: '1.5rem'
            }}>
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={isRunning && !isPaused ? pauseTimer : isPaused ? resumeTimer : startTimer}
                style={{
                  padding: '0.875rem 1.75rem',
                  background: '#8b5cf6',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.2s ease'
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
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={skipSubject}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1.5px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  color: '#c4b5fd',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                }}
              >
                <SkipForward size={16} />
                Skip
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={cancelAll}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  color: '#fca5a5',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
              >
                <X size={16} />
                End
              </motion.button>
            </div>
            
            {/* Notification Button */}
            <div style={{ 
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowNotifications(true)}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1.5px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#a78bfa',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.25)';
                }}
              >
                <Bell size={16} />
                Notifications
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Right Panel - Schedule Overview */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          height: '580px',
          padding: '1.75rem',
          background: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(24px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 1.25rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            letterSpacing: '-0.01em'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1.5px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={16} color="#a78bfa" />
            </div>
            Study Schedule
          </h3>
          
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            {schedule.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: index === currentIndex 
                    ? 'rgba(139, 92, 246, 0.2)' 
                    : index < currentIndex
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(255, 255, 255, 0.02)',
                  border: index === currentIndex 
                    ? '1.5px solid rgba(139, 92, 246, 0.4)' 
                    : index < currentIndex
                      ? '1.5px solid rgba(34, 197, 94, 0.25)'
                      : '1.5px solid rgba(255, 255, 255, 0.06)',
                  transition: 'all 0.3s ease',
                  boxShadow: index === currentIndex 
                    ? '0 4px 16px rgba(139, 92, 246, 0.25)' 
                    : 'none'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  marginRight: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9px',
                  background: index < currentIndex 
                    ? 'rgba(34, 197, 94, 0.15)' 
                    : index === currentIndex
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                  border: index < currentIndex 
                    ? '1.5px solid rgba(34, 197, 94, 0.3)' 
                    : index === currentIndex
                      ? '1.5px solid rgba(139, 92, 246, 0.3)'
                      : '1.5px solid rgba(255, 255, 255, 0.08)',
                  flexShrink: 0
                }}>
                  {index < currentIndex ? (
                    <CheckCircle size={18} color="#4ade80" />
                  ) : index === currentIndex ? (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.7)'
                    }} />
                  ) : (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.15)'
                    }} />
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: index === currentIndex ? 700 : 500,
                    color: 'white',
                    marginBottom: '0.2rem',
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.break ? `☕ Break` : item.subject}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(167, 139, 250, 0.7)',
                    fontWeight: 500
                  }}>
                    {item.start} - {item.end}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: index < currentIndex ? '#4ade80' : '#a78bfa',
                  padding: '0.3rem 0.625rem',
                  background: index < currentIndex 
                    ? 'rgba(34, 197, 94, 0.15)' 
                    : 'rgba(139, 92, 246, 0.15)',
                  borderRadius: '6px',
                  border: `1.5px solid ${index < currentIndex ? 'rgba(34, 197, 94, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                  flexShrink: 0
                }}>
                  {item.duration || item.break}m
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 1100
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '340px',
                background: 'rgba(17, 24, 39, 0.97)',
                backdropFilter: 'blur(24px)',
                borderLeft: '2px solid rgba(139, 92, 246, 0.3)',
                zIndex: 1200,
                padding: '1.75rem',
                overflowY: 'auto',
                boxShadow: '-10px 0 40px rgba(139, 92, 246, 0.2)'
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
          </>
        )}
      </AnimatePresence>
      
      {/* Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                width: '100%',
                maxWidth: '420px',
                background: 'rgba(17, 24, 39, 0.98)',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '18px',
                boxShadow: '0 25px 70px rgba(139, 92, 246, 0.3)',
                padding: '1.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                margin: '0 auto 1.25rem',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1.5px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SkipForward size={26} color="#a78bfa" />
              </div>
              <h3 style={{
                margin: 0,
                marginBottom: '0.625rem',
                color: 'white',
                fontSize: '1.375rem',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}>
                Skip Session?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
                fontWeight: 500
              }}>
                Are you sure you want to skip this {isCurrentBreak ? 'break' : 'session'}?
              </p>
              <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center' }}>
                <button
                  onClick={cancelSkip}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1.5px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#c4b5fd',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  }}
                >
                  Continue
                </button>
                <button
                  onClick={confirmSkip}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    background: '#8b5cf6',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)';
                  }}
                >
                  Yes, Skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                width: '100%',
                maxWidth: '420px',
                background: 'rgba(17, 24, 39, 0.98)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '18px',
                boxShadow: '0 25px 70px rgba(239, 68, 68, 0.3)',
                padding: '1.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                margin: '0 auto 1.25rem',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <X size={26} color="#f87171" />
              </div>
              <h3 style={{
                margin: 0,
                marginBottom: '0.625rem',
                color: 'white',
                fontSize: '1.375rem',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}>
                End Study Session?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
                fontWeight: 500
              }}>
                Are you sure you want to cancel all study sessions?
              </p>
              <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1.5px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#c4b5fd',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  }}
                >
                  Continue
                </button>
                <button
                  onClick={confirmCancel}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.4)';
                  }}
                >
                  Yes, End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Motivation Toast */}
      <AnimatePresence>
        {showMotivationToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3000,
              background: 'rgba(17, 24, 39, 0.98)',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '14px',
              boxShadow: '0 20px 50px rgba(139, 92, 246, 0.3)',
              padding: '1.125rem 1.75rem',
              maxWidth: '480px',
              backdropFilter: 'blur(24px)'
            }}
          >
            <p style={{
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: 600,
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              {motivationalQuote || "You're closer than you think — stay focused!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Session Summary Modal */}
      <AnimatePresence>
        {showSessionSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(12px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                width: '100%',
                maxWidth: '540px',
                background: 'rgba(17, 24, 39, 0.98)',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 25px 70px rgba(139, 92, 246, 0.3)',
                padding: '2.25rem'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '16px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                }}>
                  <Check size={36} color="#a78bfa" strokeWidth={3} />
                </div>
                <h3 style={{
                  margin: 0,
                  marginBottom: '0.875rem',
                  color: 'white',
                  fontSize: '1.875rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}>
                  Session Complete!
                </h3>
                {getSessionSummaryMessage()}
              </div>
              
              {/* Detailed Session Summary */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1.5px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '14px',
                padding: '1.25rem',
                marginBottom: '1.75rem'
              }}>
                <h4 style={{
                  color: 'white',
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  margin: '0 0 0.875rem 0',
                  letterSpacing: '-0.01em'
                }}>
                  Session Details
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem'
                }}>
                  {sessionResult?.completedSubjects?.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.625rem',
                      padding: '0.625rem',
                      background: 'rgba(34, 197, 94, 0.08)',
                      borderRadius: '8px',
                      border: '1.5px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '7px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1.5px solid rgba(34, 197, 94, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <CheckCircle size={14} color="#4ade80" />
                      </div>
                      <span style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        <strong style={{ color: '#4ade80' }}>Completed:</strong> {sessionResult.completedSubjects.join(', ')}
                      </span>
                    </div>
                  )}
                  {sessionResult?.skippedSubjects?.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.625rem',
                      padding: '0.625rem',
                      background: 'rgba(248, 113, 113, 0.08)',
                      borderRadius: '8px',
                      border: '1.5px solid rgba(248, 113, 113, 0.2)'
                    }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '7px',
                        background: 'rgba(248, 113, 113, 0.15)',
                        border: '1.5px solid rgba(248, 113, 113, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <SkipForward size={14} color="#f87171" />
                      </div>
                      <span style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        <strong style={{ color: '#f87171' }}>Skipped:</strong> {sessionResult.skippedSubjects.join(', ')}
                      </span>
                    </div>
                  )}
                  {sessionResult?.incompleteSubjects?.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.625rem',
                      padding: '0.625rem',
                      background: 'rgba(167, 139, 250, 0.08)',
                      borderRadius: '8px',
                      border: '1.5px solid rgba(167, 139, 250, 0.2)'
                    }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '7px',
                        background: 'rgba(167, 139, 250, 0.15)',
                        border: '1.5px solid rgba(167, 139, 250, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Clock size={14} color="#a78bfa" />
                      </div>
                      <span style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        <strong style={{ color: '#a78bfa' }}>Incomplete:</strong> {sessionResult.incompleteSubjects.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '0.875rem', 
                marginBottom: '1.75rem' 
              }}>
                <div style={{ 
                  padding: '1.125rem', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  border: '1.5px solid rgba(34, 197, 94, 0.25)', 
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    color: '#4ade80', 
                    fontWeight: 700, 
                    marginBottom: '0.375rem',
                    fontSize: '1.875rem',
                    letterSpacing: '-0.02em'
                  }}>
                    {sessionResult?.completedSubjects?.length || 0}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Completed
                  </div>
                </div>
                <div style={{ 
                  padding: '1.125rem', 
                  background: 'rgba(248, 113, 113, 0.1)', 
                  border: '1.5px solid rgba(248, 113, 113, 0.25)', 
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    color: '#f87171', 
                    fontWeight: 700, 
                    marginBottom: '0.375rem',
                    fontSize: '1.875rem',
                    letterSpacing: '-0.02em'
                  }}>
                    {sessionResult?.skippedSubjects?.length || 0}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Skipped
                  </div>
                </div>
                <div style={{ 
                  padding: '1.125rem', 
                  background: 'rgba(167, 139, 250, 0.1)', 
                  border: '1.5px solid rgba(167, 139, 250, 0.25)', 
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    color: '#a78bfa', 
                    fontWeight: 700, 
                    marginBottom: '0.375rem',
                    fontSize: '1.875rem',
                    letterSpacing: '-0.02em'
                  }}>
                    {sessionResult?.incompleteSubjects?.length || 0}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Incomplete
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowSessionSummary(false);
                  if (onComplete) {
                    onComplete(sessionResult);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#8b5cf6',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)';
                }}
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SequentialTimers;