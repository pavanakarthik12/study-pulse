import React, { useState, useEffect } from 'react';
import './NotificationSidebar.css';

const NotificationSidebar = ({ currentSubject, timeRemaining, isBreak, schedule, currentIndex }) => {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    const newNotifications = [];

    // Session start notification
    if (currentSubject && timeRemaining > 0 && timeRemaining === currentSubject.duration * 60) {
      newNotifications.push({
        id: `start-${currentIndex}`,
        type: 'start',
        title: '🎯 Session Starting!',
        message: `Ready to study ${currentSubject.subject}? Let's focus!`,
        priority: 'high',
        timestamp: Date.now()
      });
    }

    // Halfway reminder
    if (currentSubject && timeRemaining === Math.floor(currentSubject.duration * 30)) {
      newNotifications.push({
        id: `halfway-${currentIndex}`,
        type: 'progress',
        title: '⏰ Halfway There!',
        message: `You're halfway through ${currentSubject.subject}. Keep going!`,
        priority: 'medium',
        timestamp: Date.now()
      });
    }

    // 5 minutes left warning
    if (currentSubject && timeRemaining === 300) {
      newNotifications.push({
        id: `warning-${currentIndex}`,
        type: 'warning',
        title: '⏱️ 5 Minutes Left',
        message: `Wrap up ${currentSubject.subject} soon!`,
        priority: 'medium',
        timestamp: Date.now()
      });
    }

    // Hydration reminder every 20 minutes
    if (currentSubject && timeRemaining % 1200 === 0 && timeRemaining > 0 && timeRemaining < currentSubject.duration * 60) {
      newNotifications.push({
        id: `hydration-${Date.now()}`,
        type: 'hydration',
        title: '💧 Stay Hydrated!',
        message: 'Take a sip of water while studying.',
        priority: 'low',
        timestamp: Date.now()
      });
    }

    // Break notification
    if (isBreak) {
      newNotifications.push({
        id: `break-${Date.now()}`,
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

  return (
    <div className="notification-sidebar">
      <div className="sidebar-header">
        <h4>📢 Notifications</h4>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 && (
          <div className="no-notifications">
            <p>🔕 All quiet! Focus on your studies.</p>
          </div>
        )}

        {notifications.map((notif) => (
          <div key={notif.id} className={`notification notification-${notif.type} priority-${notif.priority}`}>
            <div className="notification-content">
              <h5>{notif.title}</h5>
              <p>{notif.message}</p>
            </div>
            <button 
              className="dismiss-btn-small"
              onClick={() => handleDismiss(notif.id)}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Study Tips */}
      <div className="study-tips">
        <h5>💡 Study Tips</h5>
        <ul>
          <li>Minimize distractions</li>
          <li>Take notes actively</li>
          <li>Review regularly</li>
        </ul>
      </div>

      {/* Next Up */}
      {nextSubject && (
        <div className="next-up">
          <h5>⏭️ Coming Next</h5>
          <div className="next-subject-card">
            <span className="next-subject-name">{nextSubject.subject}</span>
            <span className="next-subject-time">{nextSubject.start}</span>
            <span className="next-subject-duration">{nextSubject.duration} mins</span>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {currentSubject && schedule && (
        <div className="progress-summary">
          <h5>📊 Progress</h5>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-label">Current:</span>
              <span className="stat-value">{currentIndex + 1}/{schedule.filter(s => s.subject).length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Remaining:</span>
              <span className="stat-value">{Math.floor(timeRemaining / 60)}m {timeRemaining % 60}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSidebar;
