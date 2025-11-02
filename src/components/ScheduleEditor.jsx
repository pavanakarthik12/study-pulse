import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Clock, Trash2, Coffee, BookOpen } from 'lucide-react';

const ScheduleEditor = ({ schedule, onSave, onCancel }) => {
  const [editedSchedule, setEditedSchedule] = useState(
    schedule.map((item, index) => ({
      ...item,
      id: item.id || `item-${index}`,
      originalIndex: index
    }))
  );

  const handleTimeChange = (id, field, value) => {
    setEditedSchedule(prev => prev.map(item => {
      if (item.id === id && item.subject) {
        const updated = { ...item };
        
        if (field === 'startTime') {
          // Parse and update start time
          const [hours, minutes] = value.split(':');
          const startDate = new Date();
          startDate.setHours(parseInt(hours), parseInt(minutes), 0);
          updated.start = startDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          // Recalculate end time based on duration
          const endDate = new Date(startDate.getTime() + updated.duration * 60000);
          updated.end = endDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } else if (field === 'duration') {
          // Update duration and recalculate end time
          const newDuration = Math.max(5, Math.min(180, parseInt(value) || 30));
          updated.duration = newDuration;
          
          // Parse start time and calculate new end time
          const startTime = updated.start;
          const [time, period] = startTime.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          const startDate = new Date();
          startDate.setHours(hours, minutes, 0);
          
          const endDate = new Date(startDate.getTime() + newDuration * 60000);
          updated.end = endDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } else if (field === 'subject') {
          updated.subject = value;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleBreakChange = (id, value) => {
    setEditedSchedule(prev => prev.map(item => {
      if (item.id === id && item.break) {
        return { ...item, break: Math.max(5, Math.min(30, parseInt(value) || 10)) };
      }
      return item;
    }));
  };

  const removeSubject = (id) => {
    setEditedSchedule(prev => prev.filter(item => item.id !== id));
  };

  const addSubject = () => {
    const lastSubject = editedSchedule.filter(item => item.subject).pop();
    const lastTime = lastSubject ? lastSubject.end : '09:00 AM';
    
    // Parse last end time
    const [time, period] = lastTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const startDate = new Date();
    startDate.setHours(hours, minutes + 10, 0); // 10 min break
    
    const newStart = startDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const endDate = new Date(startDate.getTime() + 45 * 60000);
    const newEnd = endDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setEditedSchedule(prev => [
      ...prev,
      { break: 10, id: `break-${Date.now()}` },
      {
        id: `subject-${Date.now()}`,
        subject: 'New Subject',
        start: newStart,
        end: newEnd,
        duration: 45,
        priority: 3
      }
    ]);
  };

  const handleSave = () => {
    // Filter out any empty items and ensure proper structure
    const cleaned = editedSchedule.filter(item => 
      (item.subject && item.subject.trim()) || item.break
    );
    onSave(cleaned);
  };

  const subjectItems = editedSchedule.filter(item => item.subject);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideUp {
          from {
            transform: translateY(30px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .schedule-editor-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .schedule-editor-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .schedule-editor-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        
        .schedule-editor-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '2rem',
        animation: 'modalFadeIn 0.3s ease',
        fontFamily: "'Outfit', sans-serif"
      }}
      onClick={onCancel}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '24px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }} />

          {/* Header */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.75rem 2rem',
            borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={24} color="#a78bfa" />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'white',
                  background: 'linear-gradient(135deg, #a78bfa, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Adjust Schedule
                </h3>
                <p style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  Customize your study plan
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCancel}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              <X size={24} />
            </motion.button>
          </div>

          {/* Info Banner */}
          <div style={{
            position: 'relative',
            margin: '1.5rem 2rem 0 2rem',
            padding: '1rem 1.25rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px'
          }}>
            <p style={{
              margin: 0,
              color: '#93c5fd',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>💡</span>
              Adjust start times, durations, or subjects to fit your schedule
            </p>
          </div>

          {/* Content */}
          <div className="schedule-editor-scrollbar" style={{
            position: 'relative',
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 2rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {editedSchedule.map((item, index) => {
                if (item.subject) {
                  // Convert 12-hour time to 24-hour for input
                  const [time, period] = item.start.split(' ');
                  let [hours, minutes] = time.split(':');
                  hours = parseInt(hours);
                  
                  if (period === 'PM' && hours !== 12) hours += 12;
                  if (period === 'AM' && hours === 12) hours = 0;
                  
                  const time24 = `${hours.toString().padStart(2, '0')}:${minutes}`;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Number Badge */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(168, 85, 247, 0.9))',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
                      }}>
                        {subjectItems.indexOf(item) + 1}
                      </div>
                      
                      {/* Input Fields */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr auto',
                        gap: '1rem',
                        flex: 1,
                        alignItems: 'end'
                      }}>
                        {/* Subject */}
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontWeight: 500,
                            marginBottom: '0.375rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Subject
                          </label>
                          <input
                            type="text"
                            value={item.subject}
                            onChange={(e) => handleTimeChange(item.id, 'subject', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.625rem 0.875rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              color: 'white',
                              fontSize: '0.9375rem',
                              fontFamily: "'Outfit', sans-serif",
                              outline: 'none',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                            }}
                            onBlur={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                          />
                        </div>

                        {/* Start Time */}
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontWeight: 500,
                            marginBottom: '0.375rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Start
                          </label>
                          <input
                            type="time"
                            value={time24}
                            onChange={(e) => handleTimeChange(item.id, 'startTime', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.625rem 0.875rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              color: 'white',
                              fontSize: '0.9375rem',
                              fontFamily: "'Outfit', sans-serif",
                              outline: 'none',
                              transition: 'all 0.2s ease',
                              colorScheme: 'dark'
                            }}
                            onFocus={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                            }}
                            onBlur={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontWeight: 500,
                            marginBottom: '0.375rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Duration (min)
                          </label>
                          <input
                            type="number"
                            value={item.duration}
                            onChange={(e) => handleTimeChange(item.id, 'duration', e.target.value)}
                            min="5"
                            max="180"
                            style={{
                              width: '100%',
                              padding: '0.625rem 0.875rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              color: 'white',
                              fontSize: '0.9375rem',
                              fontFamily: "'Outfit', sans-serif",
                              outline: 'none',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                            }}
                            onBlur={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                          />
                        </div>

                        {/* End Time Display */}
                        <div style={{
                          padding: '0.625rem 0.875rem',
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '10px',
                          color: '#c4b5fd',
                          fontSize: '0.9375rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          whiteSpace: 'nowrap'
                        }}>
                          <Clock size={14} />
                          {item.end}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeSubject(item.id)}
                        disabled={subjectItems.length <= 1}
                        style={{
                          background: subjectItems.length <= 1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '10px',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: subjectItems.length <= 1 ? 'not-allowed' : 'pointer',
                          opacity: subjectItems.length <= 1 ? 0.3 : 1,
                          transition: 'all 0.2s ease',
                          color: '#fca5a5'
                        }}
                        onMouseEnter={(e) => {
                          if (subjectItems.length > 1) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (subjectItems.length > 1) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          }
                        }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  );
                } else if (item.break) {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      style={{
                        background: 'rgba(251, 146, 60, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid rgba(251, 146, 60, 0.3)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div style={{
                        background: 'rgba(251, 146, 60, 0.2)',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Coffee size={20} color="#fb923c" />
                      </div>
                      
                      <label style={{
                        fontWeight: 600,
                        color: '#fdba74',
                        fontSize: '0.9375rem'
                      }}>
                        Break
                      </label>
                      
                      <input
                        type="number"
                        value={item.break}
                        onChange={(e) => handleBreakChange(item.id, e.target.value)}
                        min="5"
                        max="30"
                        style={{
                          width: '80px',
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(251, 146, 60, 0.3)',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '0.9375rem',
                          fontFamily: "'Outfit', sans-serif",
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />
                      
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.875rem'
                      }}>
                        minutes
                      </span>
                    </motion.div>
                  );
                }
                return null;
              })}
            </div>

            {/* Add Subject Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={addSubject}
              style={{
                width: '100%',
                padding: '1rem',
                marginTop: '1rem',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '2px dashed rgba(139, 92, 246, 0.4)',
                borderRadius: '16px',
                color: '#c4b5fd',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
              }}
            >
              <Plus size={20} />
              Add Another Subject
            </motion.button>
          </div>

          {/* Footer */}
          <div style={{
            position: 'relative',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            padding: '1.5rem 2rem',
            borderTop: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(34, 197, 94, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.4)';
              }}
            >
              <span>💾</span>
              Save & Start Sessions
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ScheduleEditor;