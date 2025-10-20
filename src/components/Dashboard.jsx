import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { startStudySession, endStudySession, getStudyRecommendations } from '../services/api';
import RecommendationCard from './RecommendationCard';

const Dashboard = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState({
    recommended_schedule: [],
    confidence: 0
  });
  
  // Available subjects
  const availableSubjects = [
    'Math', 'Physics', 'Chemistry', 'Biology', 
    'History', 'English', 'Programming', 'Economics',
    'Psychology', 'Philosophy', 'Art', 'Music', 'Other'
  ];
  
  // Study preferences state
  const [preferences, setPreferences] = useState({
    subjects: ['Math'],
    preferredDuration: 45,
    availableTimeStart: '09:00',
    availableTimeEnd: '18:00',
    focusLevel: 8,
    pastSessions: []
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Use useCallback to memoize fetchRecommendations
  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Format the data for the enhanced ML model
      const requestData = {
        subjects: preferences.subjects,
        available_time: `${preferences.availableTimeStart} - ${preferences.availableTimeEnd}`,
        focus_level: preferences.focusLevel / 10, // Convert 1-10 scale to 0-1
        past_sessions: preferences.pastSessions
      };
      
      const data = await getStudyRecommendations(requestData);
      
      // Set the enhanced recommendations data
      setRecommendations({
        recommended_schedule: data.recommended_schedule || [],
        confidence: data.confidence || 0
      });
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [preferences, user]); // Dependencies for useCallback

  // Remove automatic fetch on preferences change to prevent infinite loops
  // We'll only fetch recommendations when the Submit button is clicked

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'subjects') {
      // Handle multiple subject selection
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setPreferences(prev => ({
        ...prev,
        subjects: selectedOptions
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations();
  };

  // Timer functionality with API integration
  const startTimer = async () => {
    if (!isTimerActive) {
      // Only start a new session if we don't already have one
      if (!currentSessionId) {
        try {
          // Start session in backend
          const response = await startStudySession(preferences.subject);
          setCurrentSessionId(response.session_id);
          setError(null);
        } catch (err) {
          setError('Failed to start study session. Please try again.');
          console.error(err);
          return; // Don't start timer if API call fails
        }
      }
      
      // Start local timer
      setIsTimerActive(true);
      const interval = setInterval(() => {
        setStudyTime(prevTime => prevTime + 1);
      }, 1000);
      setTimerInterval(interval);
    } else {
      // Resume timer if it was paused
      const interval = setInterval(() => {
        setStudyTime(prevTime => prevTime + 1);
      }, 1000);
      setTimerInterval(interval);
      setIsTimerActive(true);
    }
  };

  const stopTimer = async () => {
    if (isTimerActive) {
      // Pause timer without ending session
      clearInterval(timerInterval);
      setIsTimerActive(false);
      
      // Only end session if explicitly requested
      if (currentSessionId && window.confirm('End this study session?')) {
        try {
          // End session in backend
          await endStudySession(currentSessionId, preferences.focusLevel);
          setCurrentSessionId(null);
          setStudyTime(0);
          
          // Refresh recommendations after session ends
          fetchRecommendations();
          setError(null);
        } catch (err) {
          setError('Failed to end study session. Please try again.');
          console.error(err);
        }
      }
    }
  };

  const resetTimer = async () => {
    // Clear the timer
    clearInterval(timerInterval);
    setIsTimerActive(false);
    
    // End the current session if one exists
    if (currentSessionId) {
      try {
        await endStudySession(currentSessionId, preferences.focusLevel);
        setCurrentSessionId(null);
        setError(null);
      } catch (err) {
        setError('Failed to end study session. Timer reset but session may still be active.');
        console.error(err);
      }
    }
    
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
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-content">
        <div className="preferences-form">
          <h3>Study Preferences</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="subjects">Subjects / Topics (hold Ctrl to select multiple)</label>
              <select 
                id="subjects" 
                name="subjects" 
                value={preferences.subjects} 
                onChange={handleInputChange}
                className="form-control"
                multiple
                size="5"
              >
                {availableSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <small className="form-text text-muted">Hold Ctrl (or Cmd on Mac) to select multiple subjects</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="preferredDuration">Preferred Study Duration (minutes)</label>
              <input 
                type="number" 
                id="preferredDuration" 
                name="preferredDuration" 
                value={preferences.preferredDuration} 
                onChange={handleInputChange}
                min="15"
                max="180"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="availableTimeStart">Available Time Range - Start</label>
              <input 
                type="time" 
                id="availableTimeStart" 
                name="availableTimeStart" 
                value={preferences.availableTimeStart} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="availableTimeEnd">Available Time Range - End</label>
              <input 
                type="time" 
                id="availableTimeEnd" 
                name="availableTimeEnd" 
                value={preferences.availableTimeEnd} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="focusLevel">Focus/Attention Level (1-10)</label>
              <input 
                type="range" 
                id="focusLevel" 
                name="focusLevel" 
                value={preferences.focusLevel} 
                onChange={handleInputChange}
                min="1"
                max="10"
                className="form-control"
              />
              <div className="range-labels">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="form-group">
              <button type="submit" className="btn btn-primary submit-btn">
                Get Study Plan
              </button>
            </div>
          </form>
        </div>
      
        <div className="stats-container">
          <h3>Your Study Stats</h3>
          
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
        
        <RecommendationCard recommendations={recommendations} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Dashboard;