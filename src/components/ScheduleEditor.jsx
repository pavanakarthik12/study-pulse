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
        padding: '1.5rem',
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
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BookOpen size={20} color="#8b5cf6" />
              Edit Study Schedule
            </h2>
            <button
              onClick={onCancel}
              style={{
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} color="white" />
            </button>
          </div>
          
          {/* Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
          className="schedule-editor-scrollbar">
            {editedSchedule.map((item, index) => (
              <div 
                key={item.id}
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                {item.subject ? (
                  <>
                    <BookOpen size={18} color="#8b5cf6" />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={item.subject}
                        onChange={(e) => handleTimeChange(item.id, 'subject', e.target.value)}
                        style={{
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={item.start ? item.start.split(' ')[0].replace(':', '') : '09:00'}
                            onChange={(e) => handleTimeChange(item.id, 'startTime', e.target.value)}
                            style={{
                              padding: '0.5rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            Duration (min)
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="180"
                            value={item.duration}
                            onChange={(e) => handleTimeChange(item.id, 'duration', e.target.value)}
                            style={{
                              padding: '0.5rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Coffee size={18} color="#4ade80" />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: 'white' 
                      }}>
                        Break
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                          Duration:
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="30"
                          value={item.break}
                          onChange={(e) => handleBreakChange(item.id, e.target.value)}
                          style={{
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.875rem',
                            width: '80px'
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                          minutes
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <button
                  onClick={() => removeSubject(item.id)}
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
                  <Trash2 size={16} color="#fca5a5" />
                </button>
              </div>
            ))}
            
            <button
              onClick={addSubject}
              style={{
                padding: '0.75rem',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                color: '#a78bfa',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} />
              Add Subject
            </button>
          </div>
          
          {/* Footer */}
          <div style={{
            padding: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ScheduleEditor;