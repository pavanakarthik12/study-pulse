import React, { useState, useEffect, useCallback, useId, memo } from 'react';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getStudyRecommendations } from '../services/api';
import RecommendationCard from './RecommendationCard';
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
  
  @media (max-width: 1400px) {
    .fixed-sidebar {
      width: 300px !important;
      left: 1rem !important;
    }
    .dashboard-grid {
      grid-template-columns: 300px 1fr 320px !important;
    }
  }
  
  @media (max-width: 1200px) {
    .fixed-sidebar {
      position: relative !important;
      left: 0 !important;
      width: 100% !important;
      height: auto !important;
      margin-bottom: 1.5rem;
    }
    .dashboard-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    .dashboard-grid > div:first-child {
      grid-column: 1 / -1;
    }
    .dashboard-grid > div:last-child {
      grid-column: 1 / -1;
    }
  }
  
  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr !important;
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
  
  // New Planner UI State
  const [plannerStep, setPlannerStep] = useState(1);
  const [currentSubject, setCurrentSubject] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]); // NEW: for multiple selection
  const [currentDuration, setCurrentDuration] = useState(45);
  const [hasBreak, setHasBreak] = useState(true);
  const [breakDuration, setBreakDuration] = useState(10);
  const [subjectQueue, setSubjectQueue] = useState([]);
  const [showPastSessions, setShowPastSessions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar toggle state
  
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
    setSearchQuery('');
  };
  
  const removeSubjectFromQueue = (id) => {
    setSubjectQueue(subjectQueue.filter(s => s.id !== id));
  };
  
  const quickDurationSelect = (duration) => {
    setCurrentDuration(duration);
  };

  // Handle schedule confirmation
  const handleConfirmSchedule = () => {
    if (recommendations.recommended_schedule.length === 0) {
      setError('No schedule to confirm. Generate a study plan first.');
      return;
    }
    
    setConfirmedSchedule(recommendations.recommended_schedule);
    setShowTimers(true);
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
  };

  // Handle editor cancel
  const handleEditorCancel = () => {
    setShowEditor(false);
  };

  // Handle timer completion
  const handleTimersComplete = (completedSubjects) => {
    console.log('Completed subjects:', completedSubjects);
    setShowTimers(false);
    setError(null);
    alert(`🎉 Great work! You completed ${completedSubjects.length} study session(s)!`);
    // Could store completed sessions in Firebase here
  };

  // Handle timer cancellation
  const handleTimersCancel = (completedSubjects) => {
    console.log('Cancelled after completing:', completedSubjects);
    setShowTimers(false);
    if (completedSubjects.length > 0) {
      alert(`You completed ${completedSubjects.length} session(s) before canceling.`);
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

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem 1.5rem',
        maxWidth: '1400px',
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
              borderRadius: '12px',
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
            marginBottom: '2rem',
            textAlign: 'center'
          }}
        >
          <h1 style={{
            fontSize: '2.5rem',
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
            fontSize: '1rem'
          }}>
            Let's create your perfect study schedule
          </p>
        </motion.div>

        {/* Music Player Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <MusicPlayer />
        </motion.div>

        {/* Main Content - Three Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr 380px',
          gap: '1.5rem',
          marginBottom: '2rem',
          alignItems: 'start'
        }}
        className="dashboard-grid">
          {/* Sidebar Toggle Button */}
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: sidebarOpen ? '420px' : '1.5rem'
            }}
            transition={{ 
              opacity: { duration: 0.3, delay: 0.5 },
              scale: { duration: 0.3, delay: 0.5 },
              left: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
            }}
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.6)'
            }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'fixed',
              top: '110px',
              zIndex: 1000,
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <ChevronDown 
                size={22} 
                color="white" 
                style={{ 
                  transform: 'rotate(-90deg)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
              />
            </motion.div>
          </motion.button>

          {/* Sidebar Component */}
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
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            onNavigate={() => navigate('/')}
          />

          {/* Spacer for fixed sidebar - Dynamic based on sidebar state */}
          <motion.div 
            animate={{ width: sidebarOpen ? '400px' : '0px' }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Center Column - Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              padding: '1.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              minHeight: '500px'
            }}
          >
            <RecommendationCard recommendations={recommendations} isLoading={isLoading} />
            
            {!showTimers && recommendations.recommended_schedule.length > 0 && (
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
          </motion.div>

          {/* Right Column - Quick Stats / Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              position: 'sticky',
              top: '100px'
            }}
          >
            {/* Stats Card */}
            <div style={{
              padding: '1.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'white',
                margin: '0 0 1rem 0'
              }}>
                Today's Progress
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '0.25rem'
                  }}>
                    Sessions Completed
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#a78bfa'
                  }}>
                    0
                  </div>
                </div>
                
                <div style={{
                  padding: '1rem',
                  background: 'rgba(236, 72, 153, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(236, 72, 153, 0.2)'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '0.25rem'
                  }}>
                    Time Studied
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#f472b6'
                  }}>
                    0 min
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div style={{
              padding: '1.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'white',
                margin: '0 0 1rem 0'
              }}>
                💡 Study Tip
              </h4>
              <p style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6',
                margin: 0
              }}>
                Take regular breaks every 45-50 minutes to maintain focus and retention. Your brain needs rest to consolidate information!
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sequential Timers Section - Full Width */}
        {showTimers && confirmedSchedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              padding: '2rem',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
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