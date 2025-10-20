import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

const Dashboard = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Timer functionality
  const startTimer = () => {
    if (!isTimerActive) {
      setIsTimerActive(true);
      const interval = setInterval(() => {
        setStudyTime(prevTime => prevTime + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const stopTimer = () => {
    if (isTimerActive) {
      clearInterval(timerInterval);
      setIsTimerActive(false);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setStudyTime(0);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Study Dashboard</h2>
      <div className="dashboard-content">
        <div className="stats-container">
          <h3>Your Study Stats</h3>
          <p>Welcome to Study Pulse! Track your study time and progress here.</p>
          
          <div className="study-timer">
            <h4>Study Timer</h4>
            <div className="timer-display">{formatTime(studyTime)}</div>
            <div className="timer-controls">
              {!isTimerActive ? (
                <button onClick={startTimer} className="btn btn-primary timer-btn">Start</button>
              ) : (
                <button onClick={stopTimer} className="btn btn-secondary timer-btn">Pause</button>
              )}
              <button onClick={resetTimer} className="btn btn-secondary timer-btn">Reset</button>
            </div>
          </div>
        </div>
        
        <div className="recommendation-card">
          <h4>Study Recommendation</h4>
          <p>Based on your study patterns, we recommend focusing on short, focused study sessions with breaks in between.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;