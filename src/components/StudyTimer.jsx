// src/components/StudyTimer.jsx
import { useState, useEffect } from "react";
import { auth } from "../firebase/config";

const StudyTimer = ({ onSessionEnd }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [subject, setSubject] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  // Get backend URL with fallback
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Load saved session from localStorage if exists
  useEffect(() => {
    const savedSession = localStorage.getItem('currentStudySession');
    if (savedSession) {
      try {
        const { subject: savedSubject, startTime, sessionId: savedSessionId } = JSON.parse(savedSession);
        setSubject(savedSubject);
        setSessionStarted(true);
        setSessionId(savedSessionId);
        
        // Calculate elapsed time
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setTime(elapsedSeconds);
        setIsRunning(true);
      } catch (err) {
        console.error("Error loading saved session:", err);
        localStorage.removeItem('currentStudySession');
      }
    }
  }, []);

  const formatTime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const startTimer = async () => {
    setError(null);
    
    if (!sessionStarted && !subject.trim()) {
      alert("Please enter a subject before starting the timer");
      return;
    }

    if (!sessionStarted) {
      try {
        // Get current user token
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }
        
        const token = await user.getIdToken();
        
        // Call backend API to log session start
        const response = await fetch(`${backendUrl}/api/start-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            subject: subject,
            start_time: new Date().toISOString()
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to start session: ${response.status}`);
        }
        
        const data = await response.json();
        setSessionId(data.session_id);
        setSessionStarted(true);
        
        // Save session to localStorage
        localStorage.setItem('currentStudySession', JSON.stringify({
          subject,
          startTime: Date.now(),
          sessionId: data.session_id
        }));
      } catch (err) {
        console.error("Error starting session:", err);
        setError("Failed to start session. Please try again.");
        return;
      }
    }
    
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = async () => {
    setError(null);
    
    // Ask for focus rating before ending session
    const focusRating = prompt(
      "Rate your focus level during this session (1-10):"
    );

    // Validate focus rating
    const rating = parseInt(focusRating);
    if (isNaN(rating) || rating < 1 || rating > 10) {
      alert("Please enter a valid rating between 1 and 10");
      return;
    }

    try {
      // Get current user token
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const token = await user.getIdToken();
      
      // Call backend API to log session end
      const response = await fetch(`${backendUrl}/api/end-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          end_time: new Date().toISOString(),
          focus_rating: rating
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to end session: ${response.status}`);
      }
      
      // Remove saved session from localStorage
      localStorage.removeItem('currentStudySession');
      
      // Reset timer state
      setIsRunning(false);
      setTime(0);
      setSubject("");
      setSessionStarted(false);
      setSessionId(null);
      
      // Call the onSessionEnd callback to refresh recommendations
      if (onSessionEnd) {
        onSessionEnd();
      }
    } catch (err) {
      console.error("Error ending session:", err);
      setError("Failed to end session. Please try again.");
    }
  };

  return (
    <div className="study-timer">
      <h3>Study Timer</h3>
      <div className="timer-display">{formatTime()}</div>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Enter subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        disabled={sessionStarted}
        className="subject-input"
      />
      <div className="timer-controls">
        {!isRunning ? (
          <button onClick={startTimer} className="start-btn">
            {sessionStarted ? "Resume" : "Start"}
          </button>
        ) : (
          <button onClick={pauseTimer} className="pause-btn">
            Pause
          </button>
        )}
        <button 
          onClick={resetTimer} 
          className="reset-btn"
          disabled={!sessionStarted}
        >
          End Session
        </button>
      </div>
    </div>
  );
};

// Default props
StudyTimer.defaultProps = {
  onSessionEnd: () => {}
};

export default StudyTimer;