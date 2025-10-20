import React, { useState, useEffect, useCallback } from 'react';
import './SequentialTimers.css';

const SequentialTimers = ({ schedule, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSubjects, setCompletedSubjects] = useState([]);
  
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
  }, [isRunning, isPaused, timeRemaining]);
  
  const handleTimerComplete = useCallback(() => {
    if (!currentItem) return;
    
    // Mark subject as completed
    setCompletedSubjects(prev => [...prev, currentItem.subject]);
    
    // Check if there are more subjects
    if (currentIndex < subjectItems.length - 1) {
      // Move to next subject
      setCurrentIndex(prev => prev + 1);
      setIsRunning(false);
      setIsPaused(false);
      
      // Show break notification if applicable
      const nextBreak = schedule.find((item, idx) => {
        const prevSubjectIndex = schedule.findIndex(s => s.subject === currentItem.subject);
        return idx > prevSubjectIndex && item.break;
      });
      
      if (nextBreak) {
        alert(`Great job on ${currentItem.subject}! Take a ${nextBreak.break}-minute break before starting ${subjectItems[currentIndex + 1].subject}.`);
      }
    } else {
      // All subjects completed
      setIsRunning(false);
      if (onComplete) {
        onComplete(completedSubjects.concat([currentItem.subject]));
      }
      alert('🎉 Congratulations! You completed all your study sessions!');
    }
  }, [currentIndex, currentItem, subjectItems, schedule, completedSubjects, onComplete]);
  
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
      
      {/* Current Subject Timer */}
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
  );
};

export default SequentialTimers;
