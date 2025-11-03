import React, { useState, useCallback, useId } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  LogOut, 
  Brain, 
  Clock, 
  Zap, 
  Settings, 
  Plus, 
  X, 
  GripVertical, 
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { getStudyRecommendations } from '../services/api';

const Sidebar = ({ 
  user,
  sidebarOpen,
  availableSubjects,
  subjectQueue,
  setSubjectQueue,
  plannerStep,
  setPlannerStep,
  selectedSubjects,
  setSelectedSubjects,
  currentDuration,
  setCurrentDuration,
  hasBreak,
  setHasBreak,
  breakDuration,
  setBreakDuration,
  isLoading,
  handleSubmit,
  onNavigate,
  recommendations,
  showTimers,
  handleConfirmSchedule,
  handleAdjustSchedule
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputId = useId();
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalRecommendations, setInternalRecommendations] = useState(null);
  const [error, setError] = useState(null);

  // Filter subjects based on search
  const filteredSubjects = availableSubjects.filter(subject =>
    subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick duration selection
  const quickDurationSelect = (duration) => {
    setCurrentDuration(duration);
  };

  // Generate schedule using ML - Internal handler
  const handleGenerateSchedule = useCallback(async () => {
    if (subjectQueue.length === 0) {
      setError('Please add subjects to your queue first');
      return;
    }

    setInternalLoading(true);
    setError(null);

    try {
      // Format the data for ML backend
      const requestData = {
        subjects: subjectQueue.map(item => item.subject),
        durations: subjectQueue.map(item => item.duration),
        breaks: subjectQueue.map(item => item.hasBreak ? item.breakDuration : 0),
        available_time: '09:00 - 18:00', // Default time range
        focus_level: 0.8, // Default focus level
        past_sessions: []
      };

      console.log('🧠 Generating schedule with data:', requestData);

      const data = await getStudyRecommendations(requestData);

      // Set internal recommendations
      setInternalRecommendations({
        recommended_schedule: data.recommended_schedule || [],
        confidence: data.confidence || 0
      });

      console.log('✅ Schedule generated successfully:', data);
    } catch (err) {
      console.error('❌ Failed to generate schedule:', err);
      setError(err.message || 'Failed to generate schedule. Please try again.');
    } finally {
      setInternalLoading(false);
    }
  }, [subjectQueue]);

  // Handle start session - triggers the timer launch
  const handleStartSession = () => {
    if (internalRecommendations && internalRecommendations.recommended_schedule.length > 0) {
      handleConfirmSchedule();
    }
  };

  // Handle regenerate schedule - clears current and regenerates
  const handleRegenerateSchedule = () => {
    setInternalRecommendations(null);
    setError(null);
    // Automatically trigger regeneration after clearing
    setTimeout(() => handleGenerateSchedule(), 100);
  };

  // Use internal recommendations if available, otherwise use props
  const activeRecommendations = internalRecommendations || recommendations;
  const activeLoading = internalLoading || isLoading;

  // Add subject to queue
  const addSubjectToQueue = useCallback(() => {
    if (selectedSubjects.length === 0) return;

    const newItems = selectedSubjects.map(subject => ({
      id: `${Date.now()}-${Math.random()}`,
      subject,
      duration: currentDuration,
      hasBreak,
      breakDuration: hasBreak ? breakDuration : 0
    }));

    setSubjectQueue([...subjectQueue, ...newItems]);
    setSelectedSubjects([]);
    setPlannerStep(1);
    setCurrentDuration(45);
    setHasBreak(false);
    setBreakDuration(10);
  }, [selectedSubjects, currentDuration, hasBreak, breakDuration, subjectQueue, setSubjectQueue, setSelectedSubjects, setPlannerStep, setCurrentDuration, setHasBreak, setBreakDuration]);

  // Remove subject from queue
  const removeSubjectFromQueue = (id) => {
    setSubjectQueue(subjectQueue.filter(item => item.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{
        opacity: sidebarOpen ? 1 : 0,
        x: sidebarOpen ? 0 : -420,
        pointerEvents: sidebarOpen ? 'auto' : 'none'
      }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        top: '80px',
        left: '1.5rem',
        width: '460px',
        height: 'calc(100vh - 120px)',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.95))',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: '28px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'hidden',
        overflowX: 'hidden',
        zIndex: 40
      }}
    >
      {/* Header Section - Fixed at top */}
      <div style={{
        padding: '1.75rem 1.75rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        flexShrink: 0
      }}>
        {/* Logo & App Name */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1))',
            backdropFilter: 'blur(20px)',
            borderRadius: '18px',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle shimmer effect */}
          <motion.div
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              pointerEvents: 'none'
            }}
          />
          <div style={{
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
            position: 'relative',
            zIndex: 1
          }}>
            <Zap size={24} color="white" />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              margin: 0,
              background: 'linear-gradient(135deg, #a78bfa, #c4b5fd, #e9d5ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}>
              StudyPulse
            </h2>
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              fontWeight: 500,
              letterSpacing: '0.05em'
            }}>
              AI STUDY PLANNER
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scrollable Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Greeting Card - Compact */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated gradient orb */}
          <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.3), transparent)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 0.625rem 0',
            background: 'linear-gradient(135deg, #a78bfa, #c084fc, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.01em'
          }}>
            Hello, {user?.email?.split('@')[0] || 'Student'}! 👋
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: '1.4',
            fontWeight: 500
          }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Study Planner Card - ENLARGED */}
      <div style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.06))',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: '28px',
        border: '1.5px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 12px 40px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '400px'
      }}>
        {/* Enhanced Glow Effect */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.08, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(168, 85, 247, 0.2))',
                  borderRadius: '18px',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(139, 92, 246, 0.35)'
                }}
              >
                <Zap size={28} color="#c4b5fd" />
              </motion.div>
              <div>
                <h3 style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: 'white',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                }}>
                  Plan Your Study
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                  marginTop: '0.25rem',
                  fontWeight: 500
                }}>
                  {subjectQueue.length > 0 ? `${subjectQueue.length} subjects queued` : 'Build your schedule'}
                </p>
              </div>
            </div>
          </div>

          {/* Subject Queue Display - ENLARGED */}
          {subjectQueue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(168, 85, 247, 0.08))',
                borderRadius: '20px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: 'inset 0 2px 12px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(139, 92, 246, 0.2)'
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#8b5cf6',
                  boxShadow: '0 0 8px #8b5cf6'
                }} />
                Study Queue ({subjectQueue.length})
              </div>
              <Reorder.Group 
                axis="y" 
                values={subjectQueue} 
                onReorder={setSubjectQueue}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}
              >
                {subjectQueue.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    style={{
                      padding: '1.25rem',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      cursor: 'grab',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)'
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 6px 16px rgba(139, 92, 246, 0.2)'
                    }}
                    whileTap={{ scale: 0.98, cursor: 'grabbing' }}
                  >
                    <GripVertical size={18} color="rgba(255, 255, 255, 0.5)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '0.375rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.subject}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 600
                      }}>
                        <Clock size={13} />
                        {item.duration} min {item.hasBreak ? `• ${item.breakDuration}m break` : ''}
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => removeSubjectFromQueue(item.id)}
                      whileHover={{ scale: 1.15, backgroundColor: 'rgba(239, 68, 68, 0.25)' }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <X size={12} color="#ef4444" />
                    </motion.button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </motion.div>
          )}
        
          {/* Step-by-Step Planner */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '200px',
            gap: '1.5rem'
          }}>
            {/* Step 1: Choose Subject */}
            {plannerStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  padding: '1.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#c4b5fd',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 10px rgba(139, 92, 246, 0.5)'
                  }}>1</span>
                  Choose Subject{selectedSubjects.length > 1 ? 's' : ''}
                </label>
                
                {/* Search Input */}
                <div style={{
                  position: 'relative',
                  marginBottom: '1.25rem'
                }}>
                  <input
                    id={searchInputId}
                    type="text"
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1.5px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '14px',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: "'Outfit', sans-serif",
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                      e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <Brain 
                    size={20} 
                    color="rgba(255, 255, 255, 0.5)"
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>

                {/* Subject Chips Grid */}
                <div 
                  className="subject-chips-scroll"
                  style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  maxHeight: searchQuery ? '260px' : '200px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  paddingRight: '0.625rem',
                  marginBottom: '1.25rem'
                }}>
                  <style>{`
                    .subject-chips-scroll::-webkit-scrollbar {
                      width: 7px;
                    }
                    .subject-chips-scroll::-webkit-scrollbar-track {
                      background: rgba(255, 255, 255, 0.03);
                      borderRadius: 10px;
                    }
                    .subject-chips-scroll::-webkit-scrollbar-thumb {
                      background: rgba(139, 92, 246, 0.6);
                      borderRadius: 10px;
                    }
                    .subject-chips-scroll::-webkit-scrollbar-thumb:hover {
                      background: rgba(139, 92, 246, 0.8);
                    }
                  `}</style>
                  {(searchQuery ? filteredSubjects : availableSubjects).map((subject) => {
                    const isSelected = selectedSubjects.includes(subject);
                    return (
                      <motion.button
                        key={subject}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                          } else {
                            setSelectedSubjects([...selectedSubjects, subject]);
                          }
                        }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          padding: '1rem 1.125rem',
                          background: isSelected 
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(168, 85, 247, 0.18))'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.04))',
                          border: isSelected
                            ? '1.5px solid rgba(139, 92, 246, 0.55)'
                            : '1.5px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '14px',
                          color: isSelected ? '#e9d5ff' : 'rgba(255, 255, 255, 0.85)',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 700 : 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          fontFamily: "'Outfit', sans-serif",
                          position: 'relative',
                          boxShadow: isSelected 
                            ? '0 2px 8px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            : '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {subject}
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              width: '18px',
                              height: '18px',
                              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            <CheckCircle2 size={12} color="white" strokeWidth={3} />
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next Button */}
                {selectedSubjects.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setPlannerStep(2)}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%',
                      padding: '1.125rem',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(168, 85, 247, 0.85))',
                      border: '1.5px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '14px',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                      fontFamily: "'Outfit', sans-serif"
                    }}
                  >
                    Next: Set Duration →
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Step 2: Choose Duration */}
            {plannerStep === 2 && selectedSubjects.length > 0 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  padding: '1.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '18px',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#c4b5fd',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    boxShadow: '0 3px 10px rgba(139, 92, 246, 0.5)'
                  }}>2</span>
                  How Long?
                </label>
                
                {/* Duration Quick Chips */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  {[25, 45, 60, 'Custom'].map((duration) => (
                    <motion.button
                      key={duration}
                      type="button"
                      onClick={() => {
                        if (duration !== 'Custom') {
                          quickDurationSelect(duration);
                          setPlannerStep(3);
                        }
                      }}
                      whileHover={{ scale: 1.07, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      style={{
                        padding: '0.875rem 0.75rem',
                        background: currentDuration === duration 
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.32), rgba(168, 85, 247, 0.22))'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.04))',
                        border: currentDuration === duration
                          ? '1.5px solid rgba(139, 92, 246, 0.65)'
                          : '1.5px solid rgba(255, 255, 255, 0.13)',
                        borderRadius: '14px',
                        color: currentDuration === duration ? '#e9d5ff' : 'rgba(255, 255, 255, 0.85)',
                        fontSize: '0.875rem',
                        fontWeight: currentDuration === duration ? 700 : 600,
                        cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif",
                        transition: 'all 0.2s ease',
                        boxShadow: currentDuration === duration
                          ? '0 3px 10px rgba(139, 92, 246, 0.35)'
                          : '0 1px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {duration === 'Custom' ? duration : `${duration}m`}
                    </motion.button>
                  ))}
                </div>

                {/* Custom Duration Slider */}
                {(currentDuration !== 25 && currentDuration !== 45 && currentDuration !== 60) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      padding: '1rem',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(139, 92, 246, 0.25)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.625rem'
                    }}>
                      <span style={{
                        fontSize: '0.8125rem',
                        color: 'rgba(255, 255, 255, 0.65)'
                      }}>
                        Custom Duration
                      </span>
                      <span style={{
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        color: '#c4b5fd'
                      }}>
                        {currentDuration} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="180"
                      step="5"
                      value={currentDuration}
                      onChange={(e) => setCurrentDuration(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((currentDuration - 15) / (180 - 15)) * 100}%, rgba(255, 255, 255, 0.1) ${((currentDuration - 15) / (180 - 15)) * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
                        outline: 'none',
                        cursor: 'pointer',
                        WebkitAppearance: 'none',
                        appearance: 'none'
                      }}
                    />
                  </motion.div>
                )}

                <motion.button
                  onClick={() => setPlannerStep(3)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    marginTop: '0.875rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.8))',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  Next: Break Time? →
                </motion.button>
              </motion.div>
            )}

            {/* Step 3: Break Toggle */}
            {plannerStep === 3 && selectedSubjects.length > 0 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  padding: '1.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '18px',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#c4b5fd',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    boxShadow: '0 3px 10px rgba(139, 92, 246, 0.5)'
                  }}>3</span>
                  Add a Break?
                </label>
                
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: hasBreak ? '1rem' : '0'
                }}>
                  <motion.button
                    type="button"
                    onClick={() => setHasBreak(true)}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: hasBreak
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(34, 197, 94, 0.12))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.04))',
                      border: hasBreak
                        ? '1.5px solid rgba(34, 197, 94, 0.55)'
                        : '1.5px solid rgba(255, 255, 255, 0.13)',
                      borderRadius: '14px',
                      color: hasBreak ? '#86efac' : 'rgba(255, 255, 255, 0.75)',
                      fontSize: '0.875rem',
                      fontWeight: hasBreak ? 700 : 600,
                      cursor: 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.625rem',
                      boxShadow: hasBreak 
                        ? '0 3px 10px rgba(34, 197, 94, 0.25)'
                        : '0 1px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Coffee size={18} />
                    Yes, break
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setHasBreak(false);
                      setPlannerStep(4);
                    }}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: !hasBreak
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(168, 85, 247, 0.12))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.04))',
                      border: !hasBreak
                        ? '1.5px solid rgba(139, 92, 246, 0.55)'
                        : '1.5px solid rgba(255, 255, 255, 0.13)',
                      borderRadius: '14px',
                      color: !hasBreak ? '#c4b5fd' : 'rgba(255, 255, 255, 0.75)',
                      fontSize: '0.875rem',
                      fontWeight: !hasBreak ? 700 : 600,
                      cursor: 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      boxShadow: !hasBreak 
                        ? '0 2px 8px rgba(139, 92, 246, 0.2)'
                        : '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    No break
                  </motion.button>
                </div>

                {/* Break Duration Picker */}
                {hasBreak && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      padding: '0.875rem',
                      background: 'rgba(34, 197, 94, 0.08)',
                      borderRadius: '10px',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      marginBottom: '0.875rem'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>
                        Break Duration
                      </span>
                      <span style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: '#86efac'
                      }}>
                        {breakDuration} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((breakDuration - 5) / (30 - 5)) * 100}%, rgba(255, 255, 255, 0.1) ${((breakDuration - 5) / (30 - 5)) * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
                        outline: 'none',
                        cursor: 'pointer',
                        WebkitAppearance: 'none',
                        appearance: 'none'
                      }}
                    />
                  </motion.div>
                )}

                {hasBreak && (
                  <motion.button
                    onClick={() => setPlannerStep(4)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.8))',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                      fontFamily: "'Outfit', sans-serif"
                    }}
                  >
                    Next: Add to Queue →
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Step 4: Add to Queue */}
            {plannerStep === 4 && selectedSubjects.length > 0 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  padding: '1.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '18px',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#c4b5fd',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    boxShadow: '0 3px 10px rgba(139, 92, 246, 0.5)'
                  }}>4</span>
                  Add to Study Plan
                </label>
                <motion.button
                  type="button"
                  onClick={addSubjectToQueue}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    padding: '1.125rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(168, 85, 247, 0.85))',
                    border: '1.5px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 5px 24px rgba(139, 92, 246, 0.45)',
                    fontFamily: "'Outfit', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.625rem'
                  }}
                >
                  <Plus size={20} />
                  Add to Study Plan
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Action Buttons Section */}
          <div style={{
            marginTop: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem'
          }}>
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '0.875rem',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1.5px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '14px',
                  color: '#f87171',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Generate Schedule Button - Only show if queue has items and no schedule yet */}
            {subjectQueue.length > 0 && !activeRecommendations?.recommended_schedule?.length && (
              <motion.button
                type="button"
                onClick={handleGenerateSchedule}
                disabled={activeLoading}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: activeLoading ? 1 : 1.03, y: activeLoading ? 0 : -2 }}
                whileTap={{ scale: activeLoading ? 1 : 0.97 }}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  background: activeLoading 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(168, 85, 247, 0.4))' 
                    : 'linear-gradient(135deg, rgba(244, 114, 182, 0.95), rgba(168, 85, 247, 0.95))',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '18px',
                  color: 'white',
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  cursor: activeLoading ? 'not-allowed' : 'pointer',
                  boxShadow: activeLoading 
                    ? '0 5px 20px rgba(139, 92, 246, 0.35)'
                    : '0 8px 32px rgba(244, 114, 182, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                  fontFamily: "'Outfit', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {activeLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2.5px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2.5px solid white',
                        borderRadius: '50%'
                      }}
                    />
                    Generating Schedule...
                  </>
                ) : (
                  <>
                    <Zap size={22} />
                    🧠 Generate Schedule
                  </>
                )}
              </motion.button>
            )}

            {/* Generated Schedule Display */}
            {activeRecommendations && activeRecommendations.recommended_schedule && activeRecommendations.recommended_schedule.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  padding: '1.75rem',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.06))',
                  backdropFilter: 'blur(24px)',
                  borderRadius: '20px',
                  border: '1.5px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 5px 20px rgba(34, 197, 94, 0.18)'
                }}
              >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}>
                <CheckCircle2 size={20} color="#22c55e" />
                <h4 style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#86efac',
                  margin: 0
                }}>
                  📅 Schedule Ready
                </h4>
              </div>
              
              <div style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                Your personalized study schedule is ready with {activeRecommendations.recommended_schedule.length} session(s).
              </div>

              {/* Schedule Preview */}
              <div style={{
                maxHeight: '240px',
                overflowY: 'auto',
                marginBottom: '1.25rem',
                padding: '0.875rem',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '14px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)'
              }}>
                {activeRecommendations.recommended_schedule.map((session, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '1rem',
                      marginBottom: index < activeRecommendations.recommended_schedule.length - 1 ? '0.625rem' : 0,
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.05))',
                      borderRadius: '10px',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Session number badge */}
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      width: '24px',
                      height: '24px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#86efac',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'white',
                      marginBottom: '0.375rem',
                      paddingRight: '2rem'
                    }}>
                      {session.subject || session.name || `Session ${index + 1}`}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      fontWeight: 500
                    }}>
                      <Clock size={12} />
                      <span>{session.duration || session.time || '45'} min</span>
                      {session.start_time && (
                        <>
                          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
                          <span>{session.start_time}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem'
              }}>
                {!showTimers && (
                  <>
                    {/* Primary Action - Start Session */}
                    <motion.button
                      onClick={handleStartSession}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '100%',
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 1), rgba(16, 185, 129, 0.95))',
                        border: '1.5px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '16px',
                        color: 'white',
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 8px 28px rgba(34, 197, 94, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                        fontFamily: "'Outfit', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.01em'
                      }}
                    >
                      ▶️ Start Study Session
                    </motion.button>

                    {/* Secondary Actions Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: internalRecommendations ? '1fr 1fr' : '1fr',
                      gap: '0.75rem'
                    }}>
                      <motion.button
                        onClick={handleAdjustSchedule}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1.5px solid rgba(255, 255, 255, 0.22)',
                          borderRadius: '14px',
                          color: 'rgba(255, 255, 255, 0.92)',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: "'Outfit', sans-serif",
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.625rem',
                          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        ✏️ Adjust
                      </motion.button>

                      {/* Regenerate Button - Only show if internal schedule exists */}
                      {internalRecommendations && (
                        <motion.button
                          onClick={handleRegenerateSchedule}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            padding: '0.875rem',
                            background: 'rgba(139, 92, 246, 0.12)',
                            border: '1px solid rgba(139, 92, 246, 0.35)',
                            borderRadius: '12px',
                            color: '#c4b5fd',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: "'Outfit', sans-serif",
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
                          }}
                        >
                          🔄 Retry
                        </motion.button>
                      )}
                    </div>
                  </>
                )}

                {showTimers && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(139, 92, 246, 0.15)',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    textAlign: 'center',
                    fontSize: '0.8125rem',
                    color: '#c4b5fd',
                    fontWeight: 600
                  }}>
                    🎯 Session in Progress...
                  </div>
                )}
              </div>
            </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Close scrollable content area */}
      </div>

      {/* Settings & Logout Footer - Fixed at bottom */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        gap: '0.625rem',
        flexShrink: 0
      }}>
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1,
            padding: '0.9375rem',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          <Settings size={17} />
          Settings
        </motion.button>
        <motion.button
          onClick={onNavigate}
          whileHover={{ scale: 1.03, y: -2, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1,
            padding: '0.9375rem',
            background: 'rgba(239, 68, 68, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#f87171',
            fontSize: '0.8125rem',
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={17} />
          Logout
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
