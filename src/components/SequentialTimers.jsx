import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X, Coffee, Clock, CheckCircle, TrendingUp, BookOpen, Bell, Edit3, Check } from 'lucide-react';
import NotificationSidebar from './NotificationSidebar';

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

  console.log('🎬 SequentialTimers initialized with schedule:', schedule);
  
  // Get current item (handles both subjects and breaks)
  const currentItem = schedule[currentIndex];
  const isCurrentBreak = currentItem?.break !== undefined;
  
  // Calculate subject-only items for progress tracking
  const subjectItems = schedule.filter(item => item.subject);
  
  // Initialize session progress tracking
  useEffect(() => {
    const initialProgress = subjectItems.map(item => ({
      subject: item.subject,
      status: 'incomplete' // 'completed' | 'skipped' | 'incomplete'
    }));
    setSessionProgress(initialProgress);
  }, [subjectItems]);
  
  // Initialize timer with current item duration
  useEffect(() => {
    if (currentItem && !isRunning) {
      if (isCurrentBreak) {
        console.log(`☕ Auto-starting break: ${currentItem.break} minutes`);
        setTimeRemaining(currentItem.break * 60);
        // Auto-start breaks immediately
        setIsRunning(true);
        setIsPaused(false);
      } else if (currentItem.subject) {
        console.log(`📚 Starting subject: ${currentItem.subject} (${currentItem.duration} min)`);
        setTimeRemaining(currentItem.duration * 60);
      }
    }
  }, [currentIndex, currentItem, isRunning, isCurrentBreak]);
  
  const handleTimerComplete = useCallback(() => {
    // Only proceed if we're not already handling a skip or transition
    if (showMotivationToast || isTransitioning) return;
    
    if (!currentItem) return;
    
    // Update session progress for subjects
    if (currentItem.subject) {
      console.log(`✅ Completed: ${currentItem.subject}`);
      setSessionProgress(prev => 
        prev.map(item => 
          item.subject === currentItem.subject 
            ? { ...item, status: 'completed' } 
            : item
        )
      );
    }
    
    // Check if there are more items
    if (currentIndex < schedule.length - 1) {
      console.log(`➡️ Moving to next item (${currentIndex + 1}/${schedule.length})`);
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setIsRunning(false);
      setIsPaused(false);
      // Reset transitioning state after a short delay
      setTimeout(() => setIsTransitioning(false), 500);
    } else {
      // All sessions completed - CONFETTI TIME!
      console.log('🎉 All sessions completed!');
      setIsRunning(false);
      
      // Calculate final results
      const completedSubjects = sessionProgress
        .filter(item => item.status === 'completed')
        .map(item => item.subject);
        
      const skippedSubjects = sessionProgress
        .filter(item => item.status === 'skipped')
        .map(item => item.subject);
        
      const pausedSubjects = sessionProgress
        .filter(item => item.status === 'paused')
        .map(item => item.subject);
        
      const result = {
        completedSubjects,
        skippedSubjects,
        pausedSubjects,
        incompleteSubjects: sessionProgress
          .filter(item => item.status === 'incomplete')
          .map(item => item.subject)
      };
      
      setSessionResult(result);
      setShowSessionSummary(true);
      triggerConfetti();
    }
  }, [currentIndex, currentItem, schedule, sessionProgress, showMotivationToast, isTransitioning]);

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
    
    if (isRunning && !isPaused && timeRemaining > 0 && !isTransitioning) {
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
  }, [isRunning, isPaused, timeRemaining, handleTimerComplete, isTransitioning]);
  
  const startTimer = () => {
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
    
    // Update session progress for skipped subjects
    if (currentItem?.subject) {
      setSessionProgress(prev => 
        prev.map(item => 
          item.subject === currentItem.subject 
            ? { ...item, status: 'skipped' } 
            : item
        )
      );
    }
    
    // Set a random motivational quote
    const quote = getMotivationalQuote();
    setMotivationalQuote(quote);
    
    // Show motivation toast
    setShowMotivationToast(true);
    setIsTransitioning(true);
    
    // Hide toast after 2 seconds and then move to next timer
    setTimeout(() => {
      setShowMotivationToast(false);
      // Use a small delay to ensure the toast is hidden before moving to next timer
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
    
    // Mark remaining subjects as incomplete
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
    
    // Calculate final results using the updated sessionProgress
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
  
  const getMotivationalQuote = () => {
    // Get current session progress
    const currentSubjectProgress = sessionProgress.find(item => item.subject === currentItem?.subject);
    const isCurrentSubjectSkipped = currentSubjectProgress?.status === 'skipped';
    
    // Different quotes based on user behavior
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
    const skippedCount = sessionResult?.skippedSubjects?.length || 0;
    const incompleteCount = sessionResult?.incompleteSubjects?.length || 0;
    
    // Calculate completion percentage (completed + skipped counts as attempted)
    const attemptedCount = completedCount + skippedCount;
    const completionPercentage = totalSubjects > 0 ? (attemptedCount / totalSubjects) * 100 : 0;
    const finishedPercentage = totalSubjects > 0 ? (completedCount / totalSubjects) * 100 : 0;
    
    // Determine message based on user behavior
    if (finishedPercentage >= 80) {
      return (
        <div>
          <p style={{
            color: '#4ade80',
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: '0 0 0.5rem 0'
          }}>
            Excellent work! You stayed focused from start to finish!
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
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
            color: '#fbbf24',
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: '0 0 0.5rem 0'
          }}>
            You did fairly well today — a little more consistency and you'll crush it!
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
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
            color: '#f87171',
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: '0 0 0.5rem 0'
          }}>
            You ended too soon — success comes to those who stay consistent!
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
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
    <div style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'row',
      gap: '1.5rem',
      marginLeft: '20px',
      maxWidth: 'calc(100% - 20px)'
    }}>
      
      {/* Left Panel - Timer */}
      <div style={{ flex: 1 }}>
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
      </div>
      
      {/* Right Panel - Schedule Overview */}
      <div style={{ flex: 1 }}>
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
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
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
                maxWidth: '400px',
                background: 'rgba(10, 10, 15, 0.95)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                padding: '1.5rem',
                textAlign: 'center'
              }}
            >
              <h3 style={{
                margin: 0,
                marginBottom: '1rem',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 700
              }}>
                Skip Session?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                lineHeight: 1.5,
                marginBottom: '1.5rem'
              }}>
                Are you sure you want to skip this {isCurrentBreak ? 'break' : 'session'}?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={cancelSkip}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.06)'}
                >
                  Continue Studying
                </button>
                <button
                  onClick={confirmSkip}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #7c3aed, #581c87)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
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
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
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
                maxWidth: '400px',
                background: 'rgba(10, 10, 15, 0.95)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                padding: '1.5rem',
                textAlign: 'center'
              }}
            >
              <h3 style={{
                margin: 0,
                marginBottom: '1rem',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 700
              }}>
                End Study Session?
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                lineHeight: 1.5,
                marginBottom: '1.5rem'
              }}>
                Are you sure you want to cancel all study sessions?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.06)'}
                >
                  Continue Studying
                </button>
                <button
                  onClick={confirmCancel}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #7c3aed, #581c87)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3000,
              background: 'rgba(10, 10, 15, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              padding: '1rem 1.5rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <p style={{
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 500,
              margin: 0
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
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
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
                maxWidth: '500px',
                background: 'rgba(10, 10, 15, 0.95)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                padding: '1.5rem'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #581c87)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)'
                }}>
                  <Check size={32} color="white" />
                </div>
                <h3 style={{
                  margin: 0,
                  marginBottom: '0.5rem',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 700
                }}>
                  Session Complete!
                </h3>
                {getSessionSummaryMessage()}
              </div>
              
              {/* Detailed Session Summary */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  margin: '0 0 0.75rem 0'
                }}>
                  Session Details
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {sessionResult?.completedSubjects?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#4ade80'
                      }}></div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                        Completed: {sessionResult.completedSubjects.join(', ')}
                      </span>
                    </div>
                  )}
                  {sessionResult?.skippedSubjects?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#f87171'
                      }}></div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                        Skipped: {sessionResult.skippedSubjects.join(', ')}
                      </span>
                    </div>
                  )}
                  {sessionResult?.incompleteSubjects?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#a78bfa'
                      }}></div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                        Incomplete: {sessionResult.incompleteSubjects.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '1rem', 
                marginBottom: '1.5rem' 
              }}>
                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  border: '1px solid rgba(34, 197, 94, 0.3)', 
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    color: '#4ade80', 
                    fontWeight: 700, 
                    marginBottom: '0.25rem',
                    fontSize: '1.25rem'
                  }}>
                    {sessionResult?.completedSubjects?.length || 0}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}>
                    Completed
                  </div>
                </div>
                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    color: '#f87171', 
                    fontWeight: 700, 
                    marginBottom: '0.25rem',
                    fontSize: '1.25rem'
                  }}>
                    {sessionResult?.skippedSubjects?.length || 0}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}>
                    Skipped
                  </div>
                </div>
                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(139, 92, 246, 0.1)', 
                  border: '1px solid rgba(139, 92, 246, 0.3)', 
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    color: '#a78bfa', 
                    fontWeight: 700, 
                    marginBottom: '0.25rem',
                    fontSize: '1.25rem'
                  }}>
                    {sessionResult?.incompleteSubjects?.length || 0}
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
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
                  background: 'linear-gradient(135deg, #7c3aed, #581c87)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
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