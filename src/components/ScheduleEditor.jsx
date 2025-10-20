import React, { useState } from 'react';
import './ScheduleEditor.css';

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
    <div className="schedule-editor-overlay">
      <div className="schedule-editor">
        <div className="editor-header">
          <h3>📝 Adjust Your Study Schedule</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="editor-content">
          <div className="editor-instructions">
            <p>💡 Customize your study plan by adjusting start times, durations, or subjects.</p>
          </div>

          <div className="schedule-items">
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
                  <div key={item.id} className="schedule-item subject-item">
                    <div className="item-number">{subjectItems.indexOf(item) + 1}</div>
                    
                    <div className="item-fields">
                      <div className="field-group">
                        <label>Subject</label>
                        <input
                          type="text"
                          value={item.subject}
                          onChange={(e) => handleTimeChange(item.id, 'subject', e.target.value)}
                          className="subject-input"
                        />
                      </div>

                      <div className="field-group">
                        <label>Start Time</label>
                        <input
                          type="time"
                          value={time24}
                          onChange={(e) => handleTimeChange(item.id, 'startTime', e.target.value)}
                          className="time-input"
                        />
                      </div>

                      <div className="field-group">
                        <label>Duration (mins)</label>
                        <input
                          type="number"
                          value={item.duration}
                          onChange={(e) => handleTimeChange(item.id, 'duration', e.target.value)}
                          min="5"
                          max="180"
                          className="duration-input"
                        />
                      </div>

                      <div className="field-group end-time">
                        <label>End Time</label>
                        <span className="end-time-display">{item.end}</span>
                      </div>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeSubject(item.id)}
                      disabled={subjectItems.length <= 1}
                    >
                      🗑️
                    </button>
                  </div>
                );
              } else if (item.break) {
                return (
                  <div key={item.id} className="schedule-item break-item">
                    <div className="break-icon">☕</div>
                    <label>Break</label>
                    <input
                      type="number"
                      value={item.break}
                      onChange={(e) => handleBreakChange(item.id, e.target.value)}
                      min="5"
                      max="30"
                      className="break-input"
                    />
                    <span>minutes</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <button className="add-subject-btn" onClick={addSubject}>
            + Add Another Subject
          </button>
        </div>

        <div className="editor-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-success btn-large" onClick={handleSave}>
            💾 Save & Start Sessions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditor;
