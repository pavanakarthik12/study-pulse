import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import NotificationSidebar from './NotificationSidebar';
import './SequentialTimers.css';

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
      <div className="sequential-timers empty">
        <p>No subjects to study. Generate a study plan first!</p>
      </div>
    );
  }
  
  return (
    <div className="sequential-timers-container">
      <div className="sequential-timers">
        <h3>Study Session Queue</h3>
        
        {/* Progress Overview */}
        <div className="session-progress">
          <div className="progress-text">
            Subject {currentIndex + 1} of {subjectItems.length}
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${((currentIndex) / subjectItems.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Break Timer */}
        {isBreakTime && (
          <div className="break-timer">
            <div className="break-icon-large">☕</div>
            <h4>Break Time!</h4>
            <p>Relax and recharge before your next session</p>
            <div className="break-countdown">
              {Math.floor(breakDuration / 60)}:{(breakDuration % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}
        
        {/* Current Subject Timer - Only shows CURRENT subject time */}
        {!isBreakTime && (
          <div className={`current-timer ${isRunning ? 'running' : ''} ${isPaused ? 'paused' : ''}`}>
            <div className="timer-header">
              <h4>{currentItem.subject}</h4>
              <span className="timer-schedule">
                {currentItem.start} - {currentItem.end}
              </span>
            </div>
            
            <div className="timer-display">
              <div className="time-circle">
                <svg className="progress-ring" width="200" height="200">
                  <circle
                    className="progress-ring-bg"
                    cx="100"
                    cy="100"
                    r="90"
                  />
                  <circle
                    className="progress-ring-progress"
                    cx="100"
                    cy="100"
                    r="90"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 90}`,
                      strokeDashoffset: `${2 * Math.PI * 90 * (1 - getProgress() / 100)}`
                    }}
                  />
                </svg>
                <div className="time-text">{formatTime(timeRemaining)}</div>
              </div>
              <div className="current-subject-info">
                <span className="subject-label">Current: {currentItem.subject}</span>
                <span className="duration-label">Duration: {currentItem.duration} minutes</span>
              </div>
            </div>
            
            <div className="timer-controls">
              {!isRunning ? (
                <button className="btn btn-primary btn-large" onClick={startTimer}>
                  Start {currentItem.subject}
                </button>
              ) : isPaused ? (
                <>
                  <button className="btn btn-success" onClick={resumeTimer}>
                    Resume
                  </button>
                  <button className="btn btn-warning" onClick={skipSubject}>
                    Skip
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-warning" onClick={pauseTimer}>
                    Pause
                  </button>
                  <button className="btn btn-secondary" onClick={skipSubject}>
                    Skip
                  </button>
                </>
              )}
              <button className="btn btn-danger" onClick={cancelAll}>
                Cancel All
              </button>
            </div>
          </div>
        )}
        
        {/* Upcoming Subjects Queue */}
        {subjectItems.length > 1 && (
          <div className="upcoming-queue">
            <h5>Upcoming</h5>
            <div className="queue-list">
              {subjectItems.map((item, index) => {
                if (index <= currentIndex) return null;
                
                const breakBefore = schedule.find((s, idx) => {
                  const prevSubjectIdx = schedule.findIndex(si => si.subject === subjectItems[index - 1]?.subject);
                  const currSubjectIdx = schedule.findIndex(si => si.subject === item.subject);
                  return idx > prevSubjectIdx && idx < currSubjectIdx && s.break;
                });
                
                return (
                  <div key={index} className="queue-item">
                    {breakBefore && (
                      <div className="break-indicator">
                        ☕ {breakBefore.break} min break
                      </div>
                    )}
                    <div className="queue-subject">
                      <span className="subject-name">{item.subject}</span>
                      <span className="subject-duration">{item.duration} mins</span>
                      <span className="subject-time">{item.start}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Completed Subjects */}
        {completedSubjects.length > 0 && (
          <div className="completed-list">
            <h5>Completed ✓</h5>
            <div className="completed-items">
              {completedSubjects.map((subject, index) => (
                <span key={index} className="completed-badge">
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
