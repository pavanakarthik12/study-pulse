import React, { useState, useEffect, useCallback, useId, memo } from 'react';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getStudyRecommendations } from '../services/api';
import SequentialTimers from './SequentialTimers';
import ScheduleEditor from './ScheduleEditor';
import MusicPlayer from './MusicPlayer';
import Sidebar from './Sidebar';
import { motion, useAnimation, AnimatePresence, Reorder } from 'framer-motion';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { ChevronDown, Music, TrendingUp, Flame } from 'lucide-react';

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
  
  // New Planner UI State
  const [plannerStep, setPlannerStep] = useState(1);
  const [currentSubject, setCurrentSubject] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]); // NEW: for multiple selection
  const [currentDuration, setCurrentDuration] = useState(45);
  const [hasBreak, setHasBreak] = useState(true);
  const [breakDuration, setBreakDuration] = useState(10);
  const [endBreak, setEndBreak] = useState(false); // NEW: end break option
  const [subjectQueue, setSubjectQueue] = useState([]);
  const [showPastSessions, setShowPastSessions] = useState(false);
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
  
  // Filtered subjects for search
  const filteredSubjects = availableSubjects.filter(subject =>
    subject.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
      // Format the data for the enhanced ML model with queue information
      const requestData = {
        subjects: subjectQueue.length > 0 
          ? subjectQueue.map(item => item.subject) 
          : preferences.subjects,
        durations: subjectQueue.length > 0
          ? subjectQueue.map(item => item.duration)
          : [preferences.preferredDuration],
        breaks: subjectQueue.length > 0
          ? subjectQueue.map(item => item.hasBreak ? item.breakDuration : 0)
          : [0],
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
  }, [preferences, user, subjectQueue]); // Dependencies for useCallback

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
    setShowTimers(false); // Hide timers when generating new schedule
    // Update preferences from subject queue
    setPreferences(prev => ({
      ...prev,
      subjects: subjectQueue.map(s => s.subject)
    }));
    fetchRecommendations();
  };
  
  // New Planner UI Handlers
  const addSubjectToQueue = () => {
    if (selectedSubjects.length === 0) return;
    
    const newSubjects = selectedSubjects.map(subject => ({
      id: Date.now() + Math.random(),
      subject: subject,
      duration: currentDuration,
      hasBreak,
      breakDuration: hasBreak ? breakDuration : 0
    }));
    
    setSubjectQueue([...subjectQueue, ...newSubjects]);
    
    // Reset planner
    setPlannerStep(1);
    setCurrentSubject('');
    setSelectedSubjects([]);
    setCurrentDuration(45);
    setHasBreak(true);
    setBreakDuration(10);
    setEndBreak(false);
    setSearchQuery('');
  };
  
  const removeSubjectFromQueue = (id) => {
    setSubjectQueue(subjectQueue.filter(s => s.id !== id));
  };
  
  const quickDurationSelect = (duration) => {
    setCurrentDuration(duration);
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
    const review = {
      completed: result?.completedSubjects || [],
      skipped: result?.skippedSubjects || [],
      paused: result?.pausedSubjects || [],
      timestamp: Date.now()
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
    const review = {
      completed: result?.completedSubjects || [],
      skipped: result?.skippedSubjects || [],
      paused: result?.pausedSubjects || [],
      timestamp: Date.now(),
      cancelled: true
    };
    setSessionReview(review);
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
      paddingTop: '80px'
    }}>
      <style>{keyframeAnimations}</style>
      
      {/* Background Effects */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <SparklesCore />
        <Ripple mainCircleSize={100} />
        
        {/* Gradient backgrounds */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 50%)`,
          filter: 'blur(60px)',
          animation: 'pulseGlow 8s ease-in-out infinite'
        }} />

        {/* Floating orbs */}
        <motion.div 
          style={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25), transparent)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }}
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Dashboard Layout - Two Panel Structure */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: focusMode ? '1fr' : (isNarrow ? '1fr' : (sidebarOpen ? '340px 1fr' : '0px 1fr')),
        minHeight: 'calc(100vh - 80px)',
        gap: '1.5rem'
      }}
      className="dashboard-layout">
        {/* Sidebar - hidden in focus mode */}
        {!focusMode && (
        <div style={{
          position: isNarrow ? 'relative' : 'sticky',
          top: isNarrow ? undefined : '80px',
          height: isNarrow ? 'auto' : 'calc(100vh - 80px)',
          zIndex: 900,
          overflow: 'hidden',
          width: isNarrow ? '100%' : (sidebarOpen ? '340px' : '0px')
        }}
        className="sidebar-container">
          <Sidebar 
            user={user}
            sidebarOpen={sidebarOpen}
            availableSubjects={availableSubjects}
            subjectQueue={subjectQueue}
            setSubjectQueue={setSubjectQueue}
            plannerStep={plannerStep}
            setPlannerStep={setPlannerStep}
            selectedSubjects={selectedSubjects}
            setSelectedSubjects={setSelectedSubjects}
            currentDuration={currentDuration}
            setCurrentDuration={setCurrentDuration}
            hasBreak={hasBreak}
            setHasBreak={setHasBreak}
            breakDuration={breakDuration}
            setBreakDuration={setBreakDuration}
            endBreak={endBreak}
            setEndBreak={setEndBreak}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            onNavigate={() => navigate('/')}
            recommendations={recommendations}
            showTimers={showTimers}
            handleConfirmSchedule={handleConfirmSchedule}
            handleAdjustSchedule={handleAdjustSchedule}
          />
        </div>
        )}

        {/* Main Content Area */}
        <div style={{
          padding: '1.5rem',
          width: '100%'
        }}
        className="main-content">
          <div style={{
            maxWidth: focusMode ? '1200px' : '1000px',
            margin: '0 auto'
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

          {/* Welcome Header */}
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
              <SequentialTimers 
                schedule={confirmedSchedule}
                onComplete={handleTimersComplete}
                onCancel={handleTimersCancel}
              />
            </motion.div>
          )}
          </div>
        </div>
      </div>

      {/* Floating Music Player - Always visible during sessions */}
      {showTimers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            position: 'fixed',
            bottom: 'max(1rem, env(safe-area-inset-bottom))',
            left: focusMode ? 'max(1rem, env(safe-area-inset-left))' : (sidebarOpen && !isNarrow ? '356px' : 'max(1rem, env(safe-area-inset-left))'),
            zIndex: 1300,
            width: focusMode ? '360px' : '320px',
            maxWidth: 'min(92vw, 400px)'
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden'
          }}>
            <MusicPlayer />
          </div>
        </motion.div>
      )}

      {/* Session Review Modal */}
      {sessionReview && !focusMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              maxWidth: '720px',
              background: 'rgba(10,10,15,0.95)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              padding: '1.25rem'
            }}
          >
            <h3 style={{
              margin: 0,
              marginBottom: '0.75rem',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 700
            }}>Session Review</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px' }}>
                <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: '0.25rem' }}>Completed</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{sessionReview.completed.join(', ') || '—'}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '12px' }}>
                <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '0.25rem' }}>Paused</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{sessionReview.paused.join(', ') || '—'}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px' }}>
                <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.25rem' }}>Skipped</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{sessionReview.skipped.join(', ') || '—'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setSessionReview(null)}
                style={{
                  padding: '0.6rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >Close</button>
            </div>
          </motion.div>
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
    </div>
  );
};

export default Dashboard;