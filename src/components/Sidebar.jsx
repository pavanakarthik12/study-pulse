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
  handleAdjustSchedule
}) => {
  // State management
  const [subjectName, setSubjectName] = useState('');
  const [duration, setDuration] = useState('45');
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
        past_sessions: [],
        end_break: endBreak // Include end break preference
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
      animate={{ 
        x: 0, 
        opacity: 1 
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        height: '100%',
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
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
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
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
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
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
          border: '1px solid rgba(255, 255, 255, 0.18)'
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
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}
          
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
                    fontSize: '0.875rem'
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
                    overflowY: 'auto'
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
                          borderBottom: index < filteredSuggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        {subject}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '0.5rem'
              }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <button
              onClick={handleAddSubject}
              style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
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
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              <Plus size={16} />
              Add to Queue
            </button>
          </div>
        </div>

        {/* Subject Queue */}
        <div style={{
          padding: '1.25rem',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(15px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)'
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
            <Clock size={18} color="#8b5cf6" />
            Study Queue ({subjectQueue.length})
          </h3>
          
          {subjectQueue.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              <Coffee size={32} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                No subjects added yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {subjectQueue.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    padding: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
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
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={16} color="#fca5a5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Schedule Button */}
        <button
          onClick={handleGenerateSchedule}
          disabled={subjectQueue.length === 0 || loading}
          style={{
            padding: '0.875rem',
            background: subjectQueue.length === 0 || loading
              ? 'rgba(255, 255, 255, 0.05)'
              : 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: subjectQueue.length === 0 || loading ? 'rgba(255, 255, 255, 0.5)' : 'white',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: subjectQueue.length === 0 || loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: subjectQueue.length > 0 && !loading 
              ? '0 4px 20px rgba(139, 92, 246, 0.4)' 
              : 'none',
            transition: 'all 0.3s ease'
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
              Generate Schedule
            </>
          )}
        </button>

        {/* ML Recommendations */}
        {activeRecommendations?.recommended_schedule?.length > 0 && (
          <div style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'white',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={18} color="#8b5cf6" />
                AI Recommendations
              </h3>
              <div style={{
                padding: '0.25rem 0.5rem',
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#a78bfa'
              }}>
                {Math.round(activeRecommendations.confidence * 100)}% confident
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              {activeRecommendations.recommended_schedule.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'white',
                      marginBottom: '0.125rem'
                    }}>
                      {item.subject || 'Break'}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {item.start} - {item.end}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {item.duration || item.break} min
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
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
                  gap: '0.5rem'
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