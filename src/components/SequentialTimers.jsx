import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import NotificationSidebar from './NotificationSidebar';

const SequentialTimers = ({ schedule, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSubjects, setCompletedSubjects] = useState([]);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [breakDuration, setBreakDuration] = useState(0);
  
  // Extract only subject items (not breaks)
  const subjectItems = schedule.filter(item => item.subject);
  const currentItem = subjectItems[currentIndex];
  
  // Initialize timer with current item duration
  useEffect(() => {
    if (currentItem && !isRunning) {
      // Convert minutes to seconds
      setTimeRemaining(currentItem.duration * 60);
    }
  }, [currentItem, isRunning]);
  
  const handleTimerComplete = useCallback(() => {
    if (!currentItem) return;
    
    // Mark subject as completed
    setCompletedSubjects(prev => [...prev, currentItem.subject]);
    
    // Check if there are more subjects
    if (currentIndex < subjectItems.length - 1) {
      // Check for break before next subject
      const nextBreak = schedule.find((item, idx) => {
        const prevSubjectIndex = schedule.findIndex(s => s.subject === currentItem.subject);
        const nextSubjectIndex = schedule.findIndex(s => s.subject === subjectItems[currentIndex + 1].subject);
        return idx > prevSubjectIndex && idx < nextSubjectIndex && item.break;
      });
      
      if (nextBreak && nextBreak.break > 0) {
        // Start break timer
        setIsBreakTime(true);
        setBreakDuration(nextBreak.break * 60); // Convert to seconds
        setIsRunning(false);
        setIsPaused(false);
        
        // Auto-advance to next subject after break
        setTimeout(() => {
          setIsBreakTime(false);
          setCurrentIndex(prev => prev + 1);
          setIsRunning(false);
          setIsPaused(false);
        }, nextBreak.break * 60 * 1000);
      } else {
        // No break, move to next subject immediately
        setCurrentIndex(prev => prev + 1);
        setIsRunning(false);
        setIsPaused(false);
      }
    } else {
      // All subjects completed - CONFETTI TIME!
      setIsRunning(false);
      triggerConfetti();
      
      if (onComplete) {
        onComplete(completedSubjects.concat([currentItem.subject]));
      }
      
      setTimeout(() => {
        alert('🎉 Congratulations! You completed all your study sessions! Amazing work!');
      }, 500);
    }
  }, [currentIndex, currentItem, subjectItems, schedule, completedSubjects, onComplete]);
  
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

  // Break timer countdown
  useEffect(() => {
    let breakInterval = null;
    
    if (isBreakTime && breakDuration > 0) {
      breakInterval = setInterval(() => {
        setBreakDuration(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (breakInterval) clearInterval(breakInterval);
    };
  }, [isBreakTime, breakDuration]);
  
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
    if (window.confirm(`Skip ${currentItem.subject}?`)) {
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
    const totalSeconds = currentItem.duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };
  
  if (!currentItem) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#666'
      }}>
        <p>No subjects to study. Generate a study plan first!</p>
      </div>
    );
  }
  
  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      alignItems: 'flex-start'
    }}>
      <div style={{
        flex: '1',
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          marginTop: '0',
          color: '#333',
          fontSize: '1.5em',
          marginBottom: '20px'
        }}>Study Session Queue</h3>
        
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
        {isBreakTime && (
          <div style={{
            background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            color: 'white',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{
              fontSize: '4em',
              marginBottom: '16px'
            }}>☕</div>
            <h4 style={{
              fontSize: '2em',
              margin: '0 0 12px 0'
            }}>Break Time!</h4>
            <p style={{
              fontSize: '1.1em',
              margin: '0 0 24px 0',
              opacity: '0.9'
            }}>Relax and recharge before your next session</p>
            <div style={{
              fontSize: '3em',
              fontWeight: 'bold',
              fontFamily: "'Courier New', monospace",
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '20px',
              borderRadius: '12px',
              display: 'inline-block'
            }}>
              {Math.floor(breakDuration / 60)}:{(breakDuration % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}
        
        {/* Current Subject Timer - Only shows CURRENT subject time */}
        {!isBreakTime && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '28px',
            color: 'white',
            marginBottom: '24px',
            transition: 'all 0.3s ease',
            boxShadow: isRunning ? '0 0 20px rgba(102, 126, 234, 0.4)' : 'none',
            opacity: isPaused ? '0.85' : '1'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h4 style={{
                margin: '0',
                fontSize: '1.8em',
                fontWeight: '600'
              }}>{currentItem.subject}</h4>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '0.9em'
              }}>
                {currentItem.start} - {currentItem.end}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '32px 0'
            }}>
              <div style={{
                position: 'relative',
                width: '200px',
                height: '200px'
              }}>
                <svg style={{
                  transform: 'rotate(-90deg)'
                }} width="200" height="200">
                  <circle
                    style={{
                      fill: 'none',
                      stroke: 'rgba(255, 255, 255, 0.2)',
                      strokeWidth: '8'
                    }}
                    cx="100"
                    cy="100"
                    r="90"
                  />
                  <circle
                    style={{
                      fill: 'none',
                      stroke: 'white',
                      strokeWidth: '8',
                      strokeLinecap: 'round',
                      strokeDasharray: `${2 * Math.PI * 90}`,
                      strokeDashoffset: `${2 * Math.PI * 90 * (1 - getProgress() / 100)}`,
                      transition: 'stroke-dashoffset 0.5s ease'
                    }}
                    cx="100"
                    cy="100"
                    r="90"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '2.5em',
                  fontWeight: 'bold',
                  fontFamily: "'Courier New', monospace"
                }}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <span style={{
                  fontSize: '1.2em',
                  fontWeight: '600',
                  color: 'white'
                }}>Current: {currentItem.subject}</span>
                <span style={{
                  fontSize: '0.9em',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>Duration: {currentItem.duration} minutes</span>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {!isRunning ? (
                <button onClick={startTimer} style={{
                  padding: '16px 48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.2em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: 'white',
                  color: '#667eea'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = 'none';
                }}
                >
                  Start {currentItem.subject}
                </button>
              ) : isPaused ? (
                <>
                  <button onClick={resumeTimer} style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: '#4CAF50',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    Resume
                  </button>
                  <button onClick={skipSubject} style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: '#ff9800',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    Skip
                  </button>
                </>
              ) : (
                <>
                  <button onClick={pauseTimer} style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: '#ff9800',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    Pause
                  </button>
                  <button onClick={skipSubject} style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    Skip
                  </button>
                </>
              )}
              <button onClick={cancelAll} style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1em',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: '#f44336',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                Cancel All
              </button>
            </div>
          </div>
        )}
        
        {/* Upcoming Subjects Queue */}
        {subjectItems.length > 1 && (
          <div style={{
            background: '#f9f9f9',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h5 style={{
              marginTop: '0',
              color: '#666',
              fontSize: '1em',
              marginBottom: '12px'
            }}>Upcoming</h5>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {subjectItems.map((item, index) => {
                if (index <= currentIndex) return null;
                
                const breakBefore = schedule.find((s, idx) => {
                  const prevSubjectIdx = schedule.findIndex(si => si.subject === subjectItems[index - 1]?.subject);
                  const currSubjectIdx = schedule.findIndex(si => si.subject === item.subject);
                  return idx > prevSubjectIdx && idx < currSubjectIdx && s.break;
                });
                
                return (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '6px',
                    padding: '12px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    {breakBefore && (
                      <div style={{
                        fontSize: '0.85em',
                        color: '#ff9800',
                        marginBottom: '6px',
                        fontWeight: '500'
                      }}>
                        ☕ {breakBefore.break} min break
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{
                        fontWeight: '600',
                        color: '#333',
                        flex: '1'
                      }}>{item.subject}</span>
                      <span style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: '500'
                      }}>{item.duration} mins</span>
                      <span style={{
                        color: '#666',
                        fontSize: '0.9em'
                      }}>{item.start}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Completed Subjects */}
        {completedSubjects.length > 0 && (
          <div style={{
            background: '#f1f8f4',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h5 style={{
              marginTop: '0',
              color: '#4CAF50',
              fontSize: '1em',
              marginBottom: '12px'
            }}>Completed ✓</h5>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {completedSubjects.map((subject, index) => (
                <span key={index} style={{
                  background: '#4CAF50',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '16px',
                  fontSize: '0.9em',
                  fontWeight: '500'
                }}>
                  {subject}
                </span>
              ))}
            </div>
          </div>
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
  );
};

export default SequentialTimers;