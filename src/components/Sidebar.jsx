import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User,
  Plus,
  Zap,
  Play,
  Edit3,
  Clock,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { getStudyRecommendations } from '../services/api';

const Sidebar = ({ 
  user,
  subjectQueue,
  setSubjectQueue,
  recommendations,
  showTimers,
  handleConfirmSchedule,
  handleAdjustSchedule
}) => {
  // State management
  const [subjectName, setSubjectName] = useState('');
  const [duration, setDuration] = useState('45');
  const [loading, setLoading] = useState(false);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [error, setError] = useState(null);
  const [internalRecommendations, setInternalRecommendations] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Common subjects for suggestions
  const commonSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'English Literature', 'History',
    'Geography', 'Economics', 'Psychology', 'Philosophy',
    'Statistics', 'Calculus', 'Algebra', 'Data Structures'
  ];

  const filteredSuggestions = commonSubjects.filter(subject =>
    subject.toLowerCase().includes(subjectName.toLowerCase()) && subjectName.length > 0
  ).slice(0, 5);

  // Add subject to queue
  const handleAddSubject = () => {
    if (!subjectName.trim() || !duration) {
      setError('Please enter both subject name and duration');
      return;
    }

    const newSubject = {
      id: Date.now(),
      subject: subjectName.trim(),
      duration: parseInt(duration),
      hasBreak: false
    };

    setSubjectQueue([...subjectQueue, newSubject]);
    setSubjectName('');
    setDuration('45');
    setError(null);
    setShowSuggestions(false);
  };

  // Remove subject from queue
  const handleRemoveSubject = (id) => {
    setSubjectQueue(subjectQueue.filter(subject => subject.id !== id));
  };

  // Generate ML schedule
  const handleGenerateSchedule = async () => {
    if (subjectQueue.length === 0) {
      setError('Please add at least one subject');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format data for backend ML model
      const requestData = {
        subjects: subjectQueue.map(s => s.subject),
        durations: subjectQueue.map(s => s.duration),
        breaks: subjectQueue.map(() => 0), // Backend will auto-generate breaks
        focus_level: 0.8, // Default focus level
        available_time: '09:00 - 18:00', // Default time range
        preferred_duration: 45,
        past_sessions: []
      };

      console.log('📤 Sending schedule request:', requestData);
      
      const response = await getStudyRecommendations(requestData);
      
      console.log('📥 Received schedule response:', response);
      
      if (!response || !response.recommended_schedule) {
        throw new Error('Invalid response format from backend');
      }

      setInternalRecommendations(response);
      setScheduleGenerated(true);
      setError(null);
      
    } catch (err) {
      console.error('❌ Error generating schedule:', err);
      setError(err.message || 'Failed to generate schedule. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Start session handler
  const handleStartSession = () => {
    if (internalRecommendations) {
      console.log('🎬 Starting session with schedule:', internalRecommendations);
      handleConfirmSchedule(internalRecommendations);
    }
  };

  // Get user's first name or email
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Student';
  };

  const activeRecommendations = internalRecommendations || recommendations;

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        left: 0,
        top: '73px', // Below navbar
        bottom: 0,
        width: '420px',
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3), inset -1px 0 0 rgba(139, 92, 246, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Outfit', sans-serif",
        zIndex: 900,
        overflow: 'hidden'
      }}
    >
      {/* Ambient glow effects */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Greeting Card */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.05))',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)'
            }}>
              <User size={24} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#e9d5ff',
                marginBottom: '0.25rem'
              }}>
                Welcome back, {getUserName()}! 👋
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500
              }}>
                Let's plan your study session
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Subject Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.2), rgba(168, 85, 247, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(244, 114, 182, 0.3)'
            }}>
              <Sparkles size={18} color="#f472b6" />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#e9d5ff',
              letterSpacing: '-0.01em'
            }}>
              Add Study Subject
            </h3>
          </div>

          {/* Subject Name Input */}
          <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#c4b5fd',
              marginBottom: '0.625rem',
              letterSpacing: '0.01em'
            }}>
              Subject Name
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => {
                setSubjectName(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={(e) => {
                setShowSuggestions(subjectName.length > 0);
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onBlur={(e) => {
                setTimeout(() => {
                  setShowSuggestions(false);
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                }, 200);
              }}
              placeholder="e.g., Mathematics, Physics..."
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            />

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'rgba(20, 20, 30, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    overflow: 'hidden',
                    zIndex: 1000
                  }}
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSubjectName(suggestion);
                        setShowSuggestions(false);
                      }}
                      style={{
                        padding: '0.875rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.2s ease',
                        borderBottom: index < filteredSuggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                        e.currentTarget.style.color = '#e9d5ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      }}
                    >
                      {suggestion}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Duration Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#c4b5fd',
              marginBottom: '0.625rem',
              letterSpacing: '0.01em'
            }}>
              Duration (minutes)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[25, 45, 60, 90].map((mins) => (
                <motion.button
                  key={mins}
                  onClick={() => setDuration(mins.toString())}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: duration === mins.toString()
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2))'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: duration === mins.toString()
                      ? '1.5px solid rgba(139, 92, 246, 0.6)'
                      : '1.5px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: duration === mins.toString() ? '#e9d5ff' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.2s ease',
                    boxShadow: duration === mins.toString()
                      ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                      : 'none'
                  }}
                >
                  {mins}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <motion.button
            onClick={handleAddSubject}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            Add Subject
          </motion.button>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#f87171',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subject Queue */}
        {subjectQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#c4b5fd',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Your Queue ({subjectQueue.length})
              </h4>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: '280px',
              overflowY: subjectQueue.length > 4 ? 'auto' : 'visible',
              paddingRight: subjectQueue.length > 4 ? '0.5rem' : '0'
            }}>
              <AnimatePresence>
                {subjectQueue.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03))',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '0.25rem'
                      }}>
                        {subject.subject}
                      </div>
                      <div style={{
                        fontSize: '0.8125rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 500
                      }}>
                        <Clock size={12} />
                        {subject.duration} minutes
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleRemoveSubject(subject.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <X size={14} strokeWidth={2.5} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Generate Schedule Button */}
          {subjectQueue.length > 0 && !scheduleGenerated && (
            <motion.button
              onClick={handleGenerateSchedule}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                width: '100%',
                padding: '1.25rem',
                background: loading
                  ? 'rgba(139, 92, 246, 0.4)'
                  : 'linear-gradient(135deg, rgba(244, 114, 182, 0.95), rgba(168, 85, 247, 0.95))',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontSize: '1.0625rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Outfit', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: loading
                  ? 'none'
                  : '0 8px 28px rgba(244, 114, 182, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }}
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={22} />
                  🧠 Generate Schedule
                </>
              )}
            </motion.button>
          )}

          {/* Schedule Generated - Action Buttons */}
          {scheduleGenerated && activeRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))',
                borderRadius: '16px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.15)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={24} color="#22c55e" strokeWidth={2.5} />
                <div>
                  <div style={{
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: '#86efac',
                    marginBottom: '0.125rem'
                  }}>
                    Schedule Ready!
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500
                  }}>
                    {activeRecommendations.recommended_schedule?.filter(s => s.subject).length || 0} subjects • {activeRecommendations.recommended_schedule?.filter(s => s.break).length || 0} breaks
                  </div>
                </div>
              </div>

              {/* Schedule Preview */}
              <div style={{
                marginBottom: '1rem',
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem'
              }}>
                {activeRecommendations.recommended_schedule?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.625rem',
                      marginBottom: index < activeRecommendations.recommended_schedule.length - 1 ? '0.5rem' : '0',
                      background: item.subject 
                        ? 'rgba(139, 92, 246, 0.1)' 
                        : 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '8px',
                      border: `1px solid ${item.subject ? 'rgba(139, 92, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                      fontSize: '0.8125rem'
                    }}
                  >
                    {item.subject ? (
                      <>
                        <div style={{
                          fontWeight: 700,
                          color: '#e9d5ff',
                          marginBottom: '0.25rem'
                        }}>
                          {item.subject}
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {item.start} - {item.end} ({item.duration} min)
                        </div>
                      </>
                    ) : (
                      <div style={{
                        fontWeight: 600,
                        color: '#86efac',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        ☕ Break • {item.break} min
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Start Session Button */}
              {!showTimers && (
                <>
                  <motion.button
                    onClick={handleStartSession}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '1.125rem',
                      background: 'linear-gradient(135deg, #22c55e, #10b981)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1.0625rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: '0 6px 24px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <Play size={20} strokeWidth={2.5} />
                    Start Study Session
                  </motion.button>

                  {/* Adjust Button */}
                  <motion.button
                    onClick={handleAdjustSchedule}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.625rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Edit3 size={16} />
                    Adjust Schedule
                  </motion.button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.4);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
        }
      `}</style>
    </motion.div>
  );
};

export default Sidebar;
