import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const NotificationSidebar = ({ currentSubject, timeRemaining, isBreak, schedule, currentIndex, onClose }) => {
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
      borderRadius: '12px',
      borderLeft: '4px solid',
      animation: 'slideInRight 0.3s ease',
      position: 'relative',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    };

    const typeStyles = {
      start: {
        borderColor: '#4CAF50'
      },
      progress: {
        borderColor: '#2196F3'
      },
      warning: {
        borderColor: '#ff9800'
      },
      hydration: {
        borderColor: '#03a9f4'
      },
      break: {
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
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        flex: 1
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{
            margin: '0',
            fontSize: '1rem',
            color: 'white',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📢 Notifications
          </h4>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          flex: 1,
          overflowY: 'auto'
        }}>
          {notifications.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              color: 'rgba(255, 255, 255, 0.5)',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p style={{
                margin: '0',
                fontSize: '0.875rem'
              }}>🔕 All quiet! Focus on your studies.</p>
            </div>
          )}
          
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              style={getNotificationStyle(notification.type, notification.priority)}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'white',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{notification.title}</span>
                  <button
                    onClick={() => handleDismiss(notification.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '0.75rem'
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  {notification.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        {nextSubject && (
          <div style={{
            padding: '0.875rem',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            marginTop: 'auto'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '0.25rem'
            }}>
              Up Next
            </div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'white'
            }}>
              📚 {nextSubject.subject}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#a78bfa'
            }}>
              {nextSubject.duration} minutes
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSidebar;