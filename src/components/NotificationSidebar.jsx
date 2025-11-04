import React, { useState, useEffect } from 'react';

const NotificationSidebar = ({ currentSubject, timeRemaining, isBreak, schedule, currentIndex }) => {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    const newNotifications = [];

    if (!currentSubject) return;

    const totalDuration = isBreak ? currentSubject.break : currentSubject.duration;
    const totalSeconds = totalDuration * 60;
    const elapsed = totalSeconds - timeRemaining;

    // Session start notification (within first 3 seconds)
    if (!isBreak && elapsed >= 0 && elapsed <= 3) {
      newNotifications.push({
        id: `start-${currentIndex}`,
        type: 'start',
        title: '🎯 Session Starting!',
        message: `Ready to study ${currentSubject.subject}? Let's focus!`,
        priority: 'high',
        timestamp: Date.now()
      });
    }

    // Halfway reminder (within 3 second window of halfway point)
    const halfwayPoint = totalSeconds / 2;
    if (!isBreak && elapsed >= halfwayPoint - 1 && elapsed <= halfwayPoint + 2) {
      newNotifications.push({
        id: `halfway-${currentIndex}`,
        type: 'progress',
        title: '⏰ Halfway There!',
        message: `You're halfway through ${currentSubject.subject}. Keep going!`,
        priority: 'medium',
        timestamp: Date.now()
      });
    }

    // 5 minutes left warning (within 3 second window)
    if (!isBreak && timeRemaining >= 298 && timeRemaining <= 301) {
      newNotifications.push({
        id: `warning-${currentIndex}`,
        type: 'warning',
        title: '⏱️ 5 Minutes Left',
        message: `Wrap up ${currentSubject.subject} soon!`,
        priority: 'medium',
        timestamp: Date.now()
      });
    }

    // Hydration reminder every 20 minutes (within 3 second window)
    const twentyMinutes = 1200;
    if (!isBreak && elapsed > 10 && elapsed % twentyMinutes <= 3) {
      newNotifications.push({
        id: `hydration-${Math.floor(elapsed / twentyMinutes)}`,
        type: 'hydration',
        title: '💧 Stay Hydrated!',
        message: 'Take a sip of water while studying.',
        priority: 'low',
        timestamp: Date.now()
      });
    }

    // Break notification (within first 3 seconds of break)
    if (isBreak && elapsed >= 0 && elapsed <= 3) {
      newNotifications.push({
        id: `break-${currentIndex}`,
        type: 'break',
        title: '☕ Break Time!',
        message: 'Take a short break. Stretch, walk around, or relax.',
        priority: 'high',
        timestamp: Date.now()
      });
    }

    // Add new notifications that haven't been dismissed
    setNotifications(prev => {
      const existing = prev.map(n => n.id);
      const toAdd = newNotifications.filter(n => !existing.includes(n.id) && !dismissed.has(n.id));
      return [...prev, ...toAdd].slice(-5); // Keep last 5 notifications
    });
  }, [timeRemaining, currentSubject, isBreak, currentIndex, dismissed]);

  // Auto-dismiss low priority notifications after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => n.priority !== 'low' || (Date.now() - n.timestamp) < 10000)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [notifications]);

  const handleDismiss = (id) => {
    setDismissed(prev => new Set([...prev, id]));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNextSubject = () => {
    if (schedule && currentIndex !== null && currentIndex < schedule.length - 1) {
      const nextSubjectItem = schedule.slice(currentIndex + 1).find(item => item.subject);
      return nextSubjectItem;
    }
    return null;
  };

  const nextSubject = getNextSubject();

  // Get notification style based on type
  const getNotificationStyle = (type, priority) => {
    const baseStyle = {
      display: 'flex',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      borderLeft: '4px solid',
      animation: 'slideInRight 0.3s ease',
      position: 'relative'
    };

    const typeStyles = {
      start: {
        background: '#e8f5e9',
        borderColor: '#4CAF50'
      },
      progress: {
        background: '#e3f2fd',
        borderColor: '#2196F3'
      },
      warning: {
        background: '#fff3e0',
        borderColor: '#ff9800'
      },
      hydration: {
        background: '#e1f5fe',
        borderColor: '#03a9f4'
      },
      break: {
        background: '#fff9c4',
        borderColor: '#ffc107'
      }
    };

    const priorityStyles = {
      high: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }
    };

    return {
      ...baseStyle,
      ...typeStyles[type],
      ...(priority === 'high' ? priorityStyles.high : {})
    };
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      maxWidth: '320px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '12px'
      }}>
        <h4 style={{
          margin: '0',
          fontSize: '1.2em',
          color: '#333'
        }}>📢 Notifications</h4>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {notifications.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#999'
          }}>
            <p style={{
              margin: '0',
              fontSize: '0.95em'
            }}>🔕 All quiet! Focus on your studies.</p>
          </div>
        )}

        {notifications.map((notif) => (
          <div key={notif.id} style={getNotificationStyle(notif.type, notif.priority)}>
            <div style={{
              flex: '1'
            }}>
              <h5 style={{
                margin: '0 0 4px 0',
                fontSize: '1em',
                color: '#333'
              }}>{notif.title}</h5>
              <p style={{
                margin: '0',
                fontSize: '0.9em',
                color: '#666',
                lineHeight: '1.4'
              }}>{notif.message}</p>
            </div>
            <button 
              onClick={() => handleDismiss(notif.id)}
              title="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5em',
                color: '#999',
                cursor: 'pointer',
                padding: '0',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                alignSelf: 'flex-start'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#999';
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Study Tips */}
      <div style={{
        background: '#f3e5f5',
        padding: '16px',
        borderRadius: '8px'
      }}>
        <h5 style={{
          margin: '0 0 12px 0',
          color: '#7b1fa2',
          fontSize: '1em'
        }}>💡 Study Tips</h5>
        <ul style={{
          margin: '0',
          paddingLeft: '20px'
        }}>
          <li style={{
            marginBottom: '6px',
            color: '#666',
            fontSize: '0.9em'
          }}>Minimize distractions</li>
          <li style={{
            marginBottom: '6px',
            color: '#666',
            fontSize: '0.9em'
          }}>Take notes actively</li>
          <li style={{
            color: '#666',
            fontSize: '0.9em'
          }}>Review regularly</li>
        </ul>
      </div>

      {/* Next Up */}
      {nextSubject && (
        <div style={{
          background: '#e8eaf6',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h5 style={{
            margin: '0 0 12px 0',
            color: '#3f51b5',
            fontSize: '1em'
          }}>⏭️ Coming Next</h5>
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{
              fontWeight: '600',
              color: '#333',
              fontSize: '1em'
            }}>{nextSubject.subject}</span>
            <span style={{
              color: '#666',
              fontSize: '0.9em'
            }}>{nextSubject.start}</span>
            <span style={{
              background: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.85em',
              alignSelf: 'flex-start',
              fontWeight: '500'
            }}>{nextSubject.duration} mins</span>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {currentSubject && schedule && (
        <div style={{
          background: '#fce4ec',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h5 style={{
            margin: '0 0 12px 0',
            color: '#c2185b',
            fontSize: '1em'
          }}>📊 Progress</h5>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              background: 'white',
              borderRadius: '6px'
            }}>
              <span style={{
                color: '#666',
                fontSize: '0.9em'
              }}>Current:</span>
              <span style={{
                fontWeight: '600',
                color: '#333',
                fontSize: '1em'
              }}>{currentIndex + 1}/{schedule.filter(s => s.subject).length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              background: 'white',
              borderRadius: '6px'
            }}>
              <span style={{
                color: '#666',
                fontSize: '0.9em'
              }}>Remaining:</span>
              <span style={{
                fontWeight: '600',
                color: '#333',
                fontSize: '1em'
              }}>{Math.floor(timeRemaining / 60)}m {timeRemaining % 60}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSidebar;