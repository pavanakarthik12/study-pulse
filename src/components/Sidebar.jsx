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
  CheckCircle2,
  Coffee
} from 'lucide-react';
import { getStudyRecommendations } from '../services/api';

const Sidebar = ({ 
  user,
  sidebarOpen,
  subjectQueue,
  setSubjectQueue,
  recommendations,
  showTimers,
  handleConfirmSchedule,
  handleAdjustSchedule,
  // Add new props for time selection
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  handleSubmit
}) => {
  // State management
  const [subjectName, setSubjectName] = useState('');
  const [endBreak, setEndBreak] = useState(false); // NEW: Add end break option
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
    if (!subjectName.trim()) {
      setError('Please enter a subject name');
      return;
    }

    const newSubject = {
      id: Date.now(),
      subject: subjectName.trim(),
      duration: 45, // Default duration of 45 minutes
      hasBreak: false
    };

    setSubjectQueue([...subjectQueue, newSubject]);
    setSubjectName('');
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
        available_time: `${startTime} - ${endTime}`, // Use actual time range
        preferred_duration: 45,
        past_sessions: [],
        end_break: endBreak // Include end break preference
      };

      console.log('📤 Sending schedule request with time range:', startTime, 'to', endTime);
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
      animate={{ 
        x: 0, 
        opacity: 1 
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        height: '100%',
        maxHeight: 'calc(100vh - 80px)', // Ensure it doesn't exceed viewport height
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3), inset -1px 0 0 rgba(139, 92, 246, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Outfit', sans-serif",
        zIndex: 900,
        overflow: 'hidden',
        boxSizing: 'border-box' // Ensure padding is included in width/height calculations
      }}
    >
      {/* Ambient glow effects */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      {/* Scrollable Content with Custom Scrollbar */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        // Custom scrollbar styling
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent',
        // Ensure content doesn't get cut off
        paddingBottom: '2rem',
        boxSizing: 'border-box' // Ensure padding is included in width/height calculations
      }}>
        {/* Custom scrollbar for Webkit browsers */}
        <style>
          {`
            ::-webkit-scrollbar {
              width: 6px;
            }
            ::-webkit-scrollbar-track {
              background: transparent;
            }
            ::-webkit-scrollbar-thumb {
              background: rgba(139, 92, 246, 0.3);
              border-radius: 3px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(139, 92, 246, 0.5);
            }
          `}
        </style>

        {/* Greeting Card */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.05))',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="white" />
            </div>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'white',
                margin: 0
              }}>
                Hello, {getUserName()}!
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0
              }}>
                Ready to study?
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white'
              }}>
                0
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Sessions
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white'
              }}>
                0
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Hours
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white'
              }}>
                0
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Streak
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Subject Form */}
        <div style={{
          padding: '1.25rem',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(15px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'white',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Plus size={18} color="#8b5cf6" />
            Add Subject
          </h3>
          
          {error && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginBottom: '1rem',
              boxSizing: 'border-box'
            }}>
              {error}
            </div>
          )}
          
          {/* Time Selection */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            marginBottom: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'white',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              Study Time Window
            </h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.5rem'
                }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{
                    width: '80%',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontFamily: "'Outfit', sans-serif",
                    boxSizing: 'border-box',
                    minWidth: '0' // Prevents flexbox from expanding beyond container
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.5rem'
                }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{
                    width: '80%',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontFamily: "'Outfit', sans-serif",
                    boxSizing: 'border-box',
                    minWidth: '0' // Prevents flexbox from expanding beyond container
                  }}
                />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '0.5rem'
              }}>
                Subject Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="e.g. Mathematics"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontFamily: "'Outfit', sans-serif",
                    boxSizing: 'border-box',
                    minWidth: '0' // Prevents flexbox from expanding beyond container
                  }}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    borderRadius: '10px',
                    marginTop: '0.25rem',
                    zIndex: 100,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    boxSizing: 'border-box'
                  }}>
                    {filteredSuggestions.map((subject, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSubjectName(subject);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: 'white',
                          borderBottom: index < filteredSuggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        {subject}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleAddSubject}
              style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.9))',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                width: '100%' // Ensure button takes full width
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
              }}
            >
              <Plus size={16} />
              Add Subject
            </button>
          </div>
        </div>

        {/* Subject Queue */}
        {subjectQueue.length > 0 && (
          <div style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Zap size={18} color="#8b5cf6" />
              Study Queue ({subjectQueue.length})
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {subjectQueue.map((subject, index) => (
                <div key={subject.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxSizing: 'border-box'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      {subject.subject}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {subject.duration} minutes
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSubject(subject.id)}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#f87171',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Schedule Button */}
        {subjectQueue.length > 0 && (
          <div style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles size={18} color="#8b5cf6" />
              Generate Schedule
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                id="endBreak"
                checked={endBreak}
                onChange={(e) => setEndBreak(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px',
                  accentColor: '#8b5cf6'
                }}
              />
              <label 
                htmlFor="endBreak"
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer'
                }}
              >
                Add a break at the end of session
              </label>
            </div>
            
            <button
              onClick={handleGenerateSchedule}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading 
                  ? 'rgba(139, 92, 246, 0.5)' 
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.9))',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
                }
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }}
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Generate AI Schedule
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Schedule Actions */}
        {internalRecommendations && (
          <div style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} color="#4ade80" />
              Schedule Ready
            </h3>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <button
                onClick={handleStartSession}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 25px rgba(34, 197, 94, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.4)';
                }}
              >
                <Play size={14} />
                Start
              </button>
              
              <button
                onClick={handleAdjustSchedule}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <Edit3 size={14} />
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;