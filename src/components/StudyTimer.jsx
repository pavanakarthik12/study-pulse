// src/components/StudyTimer.jsx
import { useState, useEffect } from "react";

const StudyTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [subject, setSubject] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = async () => {
    if (!subject.trim()) {
      alert("Please enter a subject");
      return;
    }

    if (!sessionStarted) {
      try {
        const token = localStorage.getItem("firebaseToken");
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/start-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subject }),
        });
        setSessionStarted(true);
      } catch (err) {
        console.error("Failed to record session start:", err);
      }
    }
    
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = async () => {
    if (sessionStarted) {
      try {
        const token = localStorage.getItem("firebaseToken");
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/end-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            subject,
            duration: time 
          }),
        });
      } catch (err) {
        console.error("Failed to record session end:", err);
      }
    }
    
    setIsRunning(false);
    setTime(0);
    setSessionStarted(false);
  };

  const formatTime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="study-timer">
      <h3>Study Timer</h3>
      <div className="timer-display">{formatTime()}</div>
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
        <button onClick={resetTimer} className="reset-btn">
          End Session
        </button>
      </div>
    </div>
  );
};

export default StudyTimer;