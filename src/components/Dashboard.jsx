import React, { useState, useEffect, useCallback, useId, memo } from 'react';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getStudyRecommendations } from '../services/api';
import SequentialTimers from './SequentialTimers';
import ScheduleEditor from './ScheduleEditor';
import MusicPlayer from './MusicPlayer';
import Sidebar from './Sidebar';
import { motion, useAnimation } from 'framer-motion';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { CheckCircle2, Clock, X } from 'lucide-react';

// ==================== Ripple Component ====================
const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 11,
  className = '',
}) {
  return (
    <section
      className={`absolute inset-0 flex items-center justify-center ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
      }}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';

        return (
          <span
            key={i}
            className='absolute rounded-full border'
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              animationDelay: animationDelay,
              borderStyle: borderStyle,
              borderWidth: '1px',
              borderColor: 'rgba(139, 92, 246, 0.2)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'ripple 2s ease infinite',
              background: 'rgba(139, 92, 246, 0.05)'
            }}
          />
        );
      })}
    </section>
  );
});

// ==================== Sparkles Component ====================
const SparklesCore = () => {
  const [init, setInit] = useState(false);
  const controls = useAnimation();
  const generatedId = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: { duration: 1 },
      });
    }
  };

  return (
    <motion.div 
      animate={controls} 
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: 0,
        zIndex: 1
      }}
    >
      {init && (
        <Particles
          id={generatedId}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: "transparent" } },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: true,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: { value: ["#8b5cf6", "#ec4899", "#06b6d4"] },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: false,
                speed: { min: 0.1, max: 0.5 },
                straight: false,
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: 80,
              },
              opacity: {
                value: { min: 0.1, max: 0.5 },
                animation: { enable: true, speed: 1, sync: false },
              },
              shape: { type: "circle" },
              size: { value: { min: 0.5, max: 2 } },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};

// ==================== Main Dashboard Component ====================
const keyframeAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=Momo+Trust+Display&family=Outfit:wght@100..900&family=Playwrite+AU+TAS:wght@100..400&display=swap');
  
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.02); }
  }
  @keyframes ripple {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(0.9); }
  }
  
  @media (max-width: 1200px) {
    .dashboard-layout {
      grid-template-columns: 1fr;
    }
    .sidebar-container {
      position: relative;
      width: 100%;
      height: auto;
      margin-bottom: 1.5rem;
    }
    .main-content {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }
  
  @media (max-width: 768px) {
    .main-content {
      padding: 1rem;
    }
  }
`;

const Dashboard = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState({
    recommended_schedule: [],
    confidence: 0
  });
  const [showTimers, setShowTimers] = useState(false);
  const [confirmedSchedule, setConfirmedSchedule] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [sessionReview, setSessionReview] = useState(null);
  const [preferences, setPreferences] = useState({
    studySubjects: [],
    studyDuration: 45,
    breakDuration: 15,
    startTime: '09:00',
    endTime: '17:00',
    pastSessions: []
  });

  // New Planner UI State
  const [plannerStep, setPlannerStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState([]); // NEW: for multiple selection
  const [currentDuration, setCurrentDuration] = useState(45);
  const [hasBreak, setHasBreak] = useState(true);
  const [breakDuration, setBreakDuration] = useState(10);
  const [endBreak, setEndBreak] = useState(false); // NEW: end break option
  const [subjectQueue, setSubjectQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      try {
        setIsNarrow(window.innerWidth <= 1200);
      } catch (e) {
        // noop for SSR
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Available subjects
  const availableSubjects = [
    'Math', 'Physics', 'Chemistry', 'Biology', 
    'History', 'English', 'Programming', 'Economics',
    'Psychology', 'Philosophy', 'Art', 'Music', 'Other'
  ];

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
      // Format the data for the enhanced ML model with queue information
      const requestData = {
        subjects: subjectQueue.length > 0 
          ? subjectQueue.map(item => item.subject) 
          : preferences.studySubjects,
        durations: subjectQueue.length > 0
          ? subjectQueue.map(item => item.duration)
          : [preferences.studyDuration],
        breaks: subjectQueue.length > 0
          ? subjectQueue.map(item => item.hasBreak ? item.breakDuration : 0)
          : [0],
        available_time: `${preferences.startTime} - ${preferences.endTime}`,
        focus_level: 0.8, // Default focus level
        past_sessions: preferences.pastSessions,
        preferred_duration: preferences.studyDuration
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
  }, [preferences, user, subjectQueue]); // Dependencies for useCallback

  // Remove automatic fetch on preferences change to prevent infinite loops
  // We'll only fetch recommendations when the Submit button is clicked

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowTimers(false); // Hide timers when generating new schedule
    // Update preferences from subject queue
    setPreferences(prev => ({
      ...prev,
      subjects: subjectQueue.map(s => s.subject)
    }));
    fetchRecommendations();
  };

  // Handle schedule confirmation
  const handleConfirmSchedule = (scheduleData) => {
    console.log('📋 Confirming schedule:', scheduleData);
    
    // Handle both formats: direct schedule data or recommendations object
    let schedule = [];
    
    if (scheduleData?.recommended_schedule) {
      schedule = scheduleData.recommended_schedule;
    } else if (Array.isArray(scheduleData)) {
      schedule = scheduleData;
    } else if (recommendations?.recommended_schedule) {
      schedule = recommendations.recommended_schedule;
    }
    
    if (schedule.length === 0) {
      setError('No schedule to confirm. Generate a study plan first.');
      return;
    }
    
    console.log('✅ Starting timers with schedule:', schedule);
    setConfirmedSchedule(schedule);
    setShowTimers(true);
    setFocusMode(true);
    setSessionReview(null);
  };
  const handleAdjustSchedule = () => {
    setShowTimers(false);
    setShowEditor(true);
  };

  // Handle editor save
  const handleEditorSave = (adjustedSchedule) => {
    setConfirmedSchedule(adjustedSchedule);
    setShowEditor(false);
    setShowTimers(true);
    setFocusMode(true);
    setSessionReview(null);
  };

  // Handle editor cancel
  const handleEditorCancel = () => {
    setShowEditor(false);
  };

  // Handle timer completion
  const handleTimersComplete = (result) => {
    console.log('Completed session result:', result);
    setShowTimers(false);
    setFocusMode(false);
    setError(null);
    
    // Calculate session statistics
    const completedCount = result?.completedSubjects?.length || 0;
    const skippedCount = result?.skippedSubjects?.length || 0;
    const pausedCount = result?.pausedSubjects?.length || 0;
    const incompleteCount = result?.incompleteSubjects?.length || 0;
    const totalCount = completedCount + skippedCount + pausedCount + incompleteCount;
    
    // Determine performance level
    let performanceLevel = 'red'; // Default to red
    if (totalCount > 0) {
      const completionRate = completedCount / totalCount;
      if (completionRate >= 0.8) {
        performanceLevel = 'green';
      } else if (completionRate >= 0.4) {
        performanceLevel = 'yellow';
      }
    }
    
    const review = {
      completed: result?.completedSubjects || [],
      skipped: result?.skippedSubjects || [],
      paused: result?.pausedSubjects || [],
      incomplete: result?.incompleteSubjects || [],
      timestamp: Date.now(),
      performanceLevel: performanceLevel
    };
    
    setSessionReview(review);
    
    // Save to local history and preferences
    try {
      const existing = JSON.parse(localStorage.getItem('study_history') || '[]');
      const updated = [review, ...existing].slice(0, 100);
      localStorage.setItem('study_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist local history', e);
    }
    
    setPreferences(prev => ({
      ...prev,
      pastSessions: [...(prev.pastSessions || []), review]
    }));
  };

  // Handle timer cancellation
  const handleTimersCancel = (result) => {
    console.log('Cancelled after partial completion:', result);
    setShowTimers(false);
    setFocusMode(false);
    
    // Calculate session statistics
    const completedCount = result?.completedSubjects?.length || 0;
    const skippedCount = result?.skippedSubjects?.length || 0;
    const pausedCount = result?.pausedSubjects?.length || 0;
    const incompleteCount = result?.incompleteSubjects?.length || 0;
    const totalCount = completedCount + skippedCount + pausedCount + incompleteCount;
    
    // Determine performance level
    let performanceLevel = 'red'; // Default to red
    if (totalCount > 0) {
      const completionRate = completedCount / totalCount;
      if (completionRate >= 0.8) {
        performanceLevel = 'green';
      } else if (completionRate >= 0.4) {
        performanceLevel = 'yellow';
      }
    }
    
    const review = {
      completed: result?.completedSubjects || [],
      skipped: result?.skippedSubjects || [],
      paused: result?.pausedSubjects || [],
      incomplete: result?.incompleteSubjects || [],
      timestamp: Date.now(),
      cancelled: true,
      performanceLevel: performanceLevel
    };
    
    setSessionReview(review);
  };

  // Generate detailed session summary data
  const generateSessionSummary = (sessionData) => {
    if (!sessionData) return null;
    
    const { completed = [], skipped = [], incomplete = [], paused = [] } = sessionData;
    
    // Create a map to track subject durations (assuming 45 min default)
    const subjectDurations = {};
    [...completed, ...skipped, ...incomplete, ...paused].forEach(subject => {
      if (!subjectDurations[subject]) {
        subjectDurations[subject] = 45; // Default duration
      }
    });
    
    // Create summary items
    const summaryItems = [];
    
    // Add completed subjects
    completed.forEach(subject => {
      summaryItems.push({
        subject,
        duration: subjectDurations[subject] || 45,
        status: 'completed'
      });
    });
    
    // Add skipped subjects
    skipped.forEach(subject => {
      summaryItems.push({
        subject,
        duration: subjectDurations[subject] || 45,
        status: 'skipped'
      });
    });
    
    // Add incomplete subjects
    incomplete.forEach(subject => {
      summaryItems.push({
        subject,
        duration: subjectDurations[subject] || 45,
        status: 'incomplete'
      });
    });
    
    // Add paused subjects (if not already added)
    paused.forEach(subject => {
      if (!summaryItems.some(item => item.subject === subject)) {
        summaryItems.push({
          subject,
          duration: subjectDurations[subject] || 45,
          status: 'paused'
        });
      }
    });
    
    // Calculate completion stats
    const totalSubjects = summaryItems.length;
    const completedCount = summaryItems.filter(item => item.status === 'completed').length;
    const completionPercentage = totalSubjects > 0 ? Math.round((completedCount / totalSubjects) * 100) : 0;
    
    return {
      items: summaryItems,
      totalSubjects,
      completedCount,
      completionPercentage
    };
  };

  // Get motivational message based on performance
  const getMotivationalMessage = (summaryData) => {
    if (!summaryData) return "";
    
    const { completedCount, totalSubjects } = summaryData;
    const completionRate = totalSubjects > 0 ? completedCount / totalSubjects : 0;
    
    if (completionRate === 1) {
      return "Excellent focus! You stayed disciplined through every subject.";
    } else if (completionRate >= 0.5) {
      return "Good effort! Try maintaining consistency to reach full potential.";
    } else {
      return "You can do better — small steps each day build success.";
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        color: 'white',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#0a0a0f',
      fontFamily: "'Outfit', sans-serif",
      overflow: 'hidden',
      paddingTop: '80px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{keyframeAnimations}</style>
      
      {/* Background Effects */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <SparklesCore />
        <Ripple mainCircleSize={100} />
        
        {/* Gradient backgrounds */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}></div>
      </div>
      
      {/* Main Dashboard Layout - Two Panel Structure */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: focusMode ? '1fr' : (isNarrow ? '1fr' : (sidebarOpen ? '340px 1fr' : '0px 1fr')),
        minHeight: 'calc(100vh - 80px)',
        gap: '1.5rem',
        marginLeft: '20px' // Added margin to shift content right
      }}
      className="dashboard-layout">
        {/* Sidebar - hidden in focus mode */}
        {!focusMode && (
        <div style={{
          position: isNarrow ? 'relative' : 'sticky',
          top: isNarrow ? undefined : '80px',
          height: isNarrow ? 'auto' : 'calc(100vh - 80px)',
          maxHeight: isNarrow ? 'none' : 'calc(100vh - 80px)',
          zIndex: 900,
          overflow: 'hidden',
          width: isNarrow ? '100%' : (sidebarOpen ? '340px' : '0px'),
          minWidth: sidebarOpen ? '340px' : '0px', // Ensure minimum width when open
          transition: 'width 0.3s ease, minWidth 0.3s ease' // Smooth transition
        }}
        className="sidebar-container">
          <Sidebar 
            user={user}
            sidebarOpen={sidebarOpen}
            subjectQueue={subjectQueue}
            setSubjectQueue={setSubjectQueue}
            recommendations={recommendations}
            showTimers={showTimers}
            handleConfirmSchedule={handleConfirmSchedule}
            handleAdjustSchedule={handleAdjustSchedule}
            // Add time selection props
            startTime={preferences.startTime}
            setStartTime={(time) => setPreferences(prev => ({ ...prev, startTime: time }))}
            endTime={preferences.endTime}
            setEndTime={(time) => setPreferences(prev => ({ ...prev, endTime: time }))}
            handleSubmit={handleSubmit}
          />
        </div>
        )}

        {/* Main Content Area */}
        <div style={{
          padding: '1.5rem',
          width: '100%',
          minHeight: sessionReview && !focusMode ? 'auto' : 'calc(100vh - 160px)', // Adjust height when session summary is shown
          display: 'flex',
          flexDirection: 'column'
        }}
        className="main-content">
          <div style={{
            maxWidth: focusMode ? '1200px' : '1000px',
            margin: '0 auto',
            width: '100%',
            flex: 1
          }}>
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1rem',
                marginBottom: '1.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                color: '#fca5a5',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Welcome Header - hidden during active sessions */}
          {!focusMode && !sessionReview && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}
            >
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'white',
                margin: 0,
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #a78bfa, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
              }}>
                Welcome back! 👋
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                margin: 0,
                fontSize: '0.9rem'
              }}>
                Let's create your perfect study schedule
              </p>
            </motion.div>
          )}

          {/* Schedule Display Area (hidden in focus mode) */}
          {!focusMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              minHeight: '400px'
            }}
          >
            {/* Schedule Display */}
            {isLoading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                gap: '1rem'
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(139, 92, 246, 0.2)',
                    borderTop: '3px solid #8b5cf6',
                    borderRadius: '50%'
                  }}
                />
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                  Generating your schedule...
                </p>
              </div>
            ) : recommendations.recommended_schedule.length > 0 ? (
              <>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📅 Your Study Schedule
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recommendations.recommended_schedule.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        padding: '0.875rem',
                        background: item.break 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(139, 92, 246, 0.1)',
                        border: item.break
                          ? '1px solid rgba(34, 197, 94, 0.3)'
                          : '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'white',
                          marginBottom: '0.25rem'
                        }}>
                          {item.break ? `☕ Break` : `📚 ${item.subject}`}
                        </div>
                        {!item.break && (
                          <div style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.6)'
                          }}>
                            {item.start} - {item.end}
                          </div>
                        )}
                      </div>
                      <div style={{
                        padding: '0.375rem 0.75rem',
                        background: item.break
                          ? 'rgba(34, 197, 94, 0.2)'
                          : 'rgba(139, 92, 246, 0.2)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: item.break ? '#4ade80' : '#a78bfa'
                      }}>
                        {item.break ? `${item.break} min` : `${item.duration} min`}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {!showTimers && (
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmSchedule}
                      style={{
                        flex: 1,
                        padding: '0.875rem',
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ✓ Start Timers
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAdjustSchedule}
                      style={{
                        padding: '0.875rem 1.25rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Adjust
                    </motion.button>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                gap: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem' }}>📚</div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  No Schedule Yet
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  maxWidth: '250px'
                }}>
                  Add subjects in the sidebar and generate your personalized study schedule
                </p>
              </div>
            )}
          </motion.div>
          )}

          {/* Sequential Timers Section - Appears when schedule is started */}
          {showTimers && confirmedSchedule.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                marginTop: focusMode ? '2rem' : '1.5rem',
                minHeight: focusMode ? 'calc(100vh - 160px)' : undefined,
                display: focusMode ? 'flex' : 'block',
                alignItems: focusMode ? 'center' : undefined,
                justifyContent: focusMode ? 'center' : undefined
              }}
            >
              {console.log('⏰ Rendering SequentialTimers with schedule:', confirmedSchedule)}
              <SequentialTimers 
                schedule={confirmedSchedule}
                onComplete={handleTimersComplete}
                onCancel={handleTimersCancel}
              />
            </motion.div>
          )}
          
          {/* Detailed Post-Session Summary Panel */}
          {sessionReview && !focusMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                marginBottom: '1.5rem'
              }}
            >
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'white',
                margin: 0,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Study Session Summary
              </h3>
              
              {/* Completion Progress Bar */}
              {generateSessionSummary(sessionReview) && (
                <>
                  <div style={{
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem'
                      }}>
                        Progress
                      </span>
                      <span style={{
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        {generateSessionSummary(sessionReview).completedCount} out of {generateSessionSummary(sessionReview).totalSubjects} subjects — {generateSessionSummary(sessionReview).completionPercentage}% complete
                      </span>
                    </div>
                    <div style={{
                      height: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '5px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${generateSessionSummary(sessionReview).completionPercentage}%`,
                        background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)',
                        borderRadius: '5px'
                      }}></div>
                    </div>
                  </div>
                  
                  {/* Subject Summary Table */}
                  <div style={{
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>Subject</div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>Duration</div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>Status</div>
                    </div>
                    
                    {generateSessionSummary(sessionReview).items.map((item, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr',
                          gap: '1rem',
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '10px',
                          marginBottom: '0.5rem',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <div style={{
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {item.subject}
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.9rem',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.duration} min
                        </div>
                        <div style={{
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.status === 'completed' ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              color: '#4ade80'
                            }}>
                              <CheckCircle2 size={16} />
                              <span style={{ fontSize: '0.85rem' }}>Completed</span>
                            </div>
                          ) : item.status === 'skipped' ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              color: '#fbbf24'
                            }}>
                              <Clock size={16} />
                              <span style={{ fontSize: '0.85rem' }}>Skipped</span>
                            </div>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              color: '#f87171'
                            }}>
                              <X size={16} />
                              <span style={{ fontSize: '0.85rem' }}>Not Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Motivational Message */}
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      color: '#c4b5fd',
                      fontSize: '1rem',
                      margin: 0,
                      fontWeight: 500
                    }}>
                      {getMotivationalMessage(generateSessionSummary(sessionReview))}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
          </div>
        </div>
      </div>

      {/* Floating Music Player - Always visible during sessions */}
      {showTimers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            position: 'fixed',
            top: '100px', // Below navbar
            left: '20px', // Left corner
            zIndex: 1100,
            width: '350px', // Updated to match new size
            maxWidth: '90vw'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
          }}
          >
            <MusicPlayer />
          </div>
        </motion.div>
      )}

      {/* Schedule Editor Modal */}
      {showEditor && (
        <ScheduleEditor 
          schedule={recommendations.recommended_schedule}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}

      {/* Footer Section */}
      <footer style={{
        padding: '1.5rem',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.75rem',
        marginTop: 'auto',
        zIndex: 20
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          Made by PavanaKarthikeya
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a 
            href="https://www.linkedin.com/in/pavan-karthik-a377b632b/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            LinkedIn
          </a>
          <a 
            href="https://github.com/pavanakarthik12" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            GitHub
          </a>
          <a 
            href="mailto:pavanakarthikeya@gmail.com" 
            style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            Email
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;