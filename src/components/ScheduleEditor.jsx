import React, { useState } from 'react';

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
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '2000',
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <h3 style={{
            margin: '0',
            fontSize: '1.5em',
            color: '#333'
          }}>📝 Adjust Your Study Schedule</h3>
          <button onClick={onCancel} style={{
            background: 'none',
            border: 'none',
            fontSize: '2em',
            color: '#999',
            cursor: 'pointer',
            padding: '0',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f0f0f0';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#999';
          }}
          >×</button>
        </div>

        <div style={{
          flex: '1',
          overflowY: 'auto',
          padding: '24px'
        }}>
          <div style={{
            background: '#e3f2fd',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{
              margin: '0',
              color: '#1976d2',
              fontSize: '0.95em'
            }}>💡 Customize your study plan by adjusting start times, durations, or subjects.</p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
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
                  <div key={item.id} style={{
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                    borderLeft: '4px solid #667eea'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f0f0f0';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f9f9f9';
                    e.target.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{
                      background: '#667eea',
                      color: 'white',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      flexShrink: '0'
                    }}>
                      {subjectItems.indexOf(item) + 1}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      flex: '1',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <label style={{
                          fontSize: '0.85em',
                          color: '#666',
                          fontWeight: '500'
                        }}>Subject</label>
                        <input
                          type="text"
                          value={item.subject}
                          onChange={(e) => handleTimeChange(item.id, 'subject', e.target.value)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '0.95em'
                          }}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <label style={{
                          fontSize: '0.85em',
                          color: '#666',
                          fontWeight: '500'
                        }}>Start Time</label>
                        <input
                          type="time"
                          value={time24}
                          onChange={(e) => handleTimeChange(item.id, 'startTime', e.target.value)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '0.95em'
                          }}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <label style={{
                          fontSize: '0.85em',
                          color: '#666',
                          fontWeight: '500'
                        }}>Duration (mins)</label>
                        <input
                          type="number"
                          value={item.duration}
                          onChange={(e) => handleTimeChange(item.id, 'duration', e.target.value)}
                          min="5"
                          max="180"
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '0.95em'
                          }}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <label style={{
                          fontSize: '0.85em',
                          color: '#666',
                          fontWeight: '500'
                        }}>End Time</label>
                        <span style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '0.95em',
                          background: '#e0e0e0',
                          color: '#666',
                          fontWeight: '500',
                          display: 'inline-block'
                        }}>{item.end}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeSubject(item.id)}
                      disabled={subjectItems.length <= 1}
                      style={{
                        background: subjectItems.length <= 1 ? '#ffebee' : '#ffebee',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: subjectItems.length <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '1.2em',
                        transition: 'all 0.2s ease',
                        opacity: subjectItems.length <= 1 ? '0.3' : '1'
                      }}
                      onMouseEnter={(e) => {
                        if (subjectItems.length > 1) {
                          e.target.style.background = '#ffcdd2';
                          e.target.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (subjectItems.length > 1) {
                          e.target.style.background = '#ffebee';
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                );
              } else if (item.break) {
                return (
                  <div key={item.id} style={{
                    background: '#fff3e0',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                    borderLeft: '4px solid #ff9800'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ffe0b2';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fff3e0';
                    e.target.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{
                      fontSize: '1.5em'
                    }}>☕</div>
                    <label style={{
                      fontWeight: '500',
                      color: '#666'
                    }}>Break</label>
                    <input
                      type="number"
                      value={item.break}
                      onChange={(e) => handleBreakChange(item.id, e.target.value)}
                      min="5"
                      max="30"
                      style={{
                        width: '60px',
                        padding: '6px 10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}
                    />
                    <span>minutes</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <button onClick={addSubject} style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            background: '#e3f2fd',
            border: '2px dashed #1976d2',
            borderRadius: '8px',
            color: '#1976d2',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#bbdefb';
            e.target.style.borderColor = '#0d47a1';
            e.target.style.color = '#0d47a1';
          }}
          >
            + Add Another Subject
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          padding: '20px 24px',
          borderTop: '2px solid #e0e0e0'
        }}>
          <button onClick={onCancel} style={{
            padding: '12px 32px',
            background: '#e0e0e0',
            color: '#333',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.05em',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#d0d0d0';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#e0e0e0';
          }}
          >
            Cancel
          </button>
          <button onClick={handleSave} style={{
            padding: '14px 40px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1em',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#45a049';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#4CAF50';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          >
            💾 Save & Start Sessions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditor;