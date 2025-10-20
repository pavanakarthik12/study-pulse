# Study Pulse - User-Specific Features Implementation Guide

## ✅ Completed

1. **Firebase Firestore Utils** (`backend/firebase_utils.py`)
   - `store_past_session()` - Save completed sessions to Firestore
   - `get_past_sessions()` - Retrieve user's session history
   - `store_predicted_schedule()` - Save ML predictions to Firestore
   - `get_predicted_schedules()` - Retrieve predicted schedules
   - `update_schedule_status()` - Update schedule (confirm/adjust)
   - `get_user_profile()` - Get user profile data
   - `update_user_profile()` - Update user profile
   - `calculate_next_high_focus_window()` - Predict next optimal study time

2. **Enhanced Authentication** (`backend/utils.py`)
   - `verify_firebase_token()` now returns full user info (uid, email, name)
   - Development mode fallback for testing

3. **Implementation Plan** (`USER_FEATURES_PLAN.md`)
   - Complete roadmap for all features
   - Firestore schema design
   - Security rules
   - Testing strategy

## 🔧 Implementation Steps

### Step 1: Update app.py with New Endpoints

Add these imports to `backend/app.py`:
```python
import firebase_utils
from datetime import timedelta
```

Add these endpoints after existing routes (copy from `backend/new_endpoints.py`):
- `/api/user/profile` - GET user info
- `/api/user/past-sessions` - GET session history  
- `/api/user/schedules` - GET predicted schedules
- `/api/user/schedules/<id>/confirm` - POST confirm schedule
- `/api/user/schedules/<id>/adjust` - POST adjust schedule
- `/api/user/next-session` - GET next optimal time
- `/api/user/notifications` - GET smart notifications

Initialize Firestore after loading ML models:
```python
# After ML models load
try:
    from firebase_admin import firestore
    db = firestore.client()
    firebase_utils.set_firestore_client(db)
    print("Firestore initialized")
except Exception as e:
    print(f"Firestore initialization warning: {e}")
```

### Step 2: Modify Existing Endpoints

#### `/predict_schedule` - Store predictions in Firestore
```python
@app.route('/predict_schedule', methods=['POST'])
def predict_schedule():
    user_info = authenticate_request()
    
    # After generating schedule:
    if schedule:
        # Store in Firestore
        schedule_id = firebase_utils.store_predicted_schedule(
            user_info['uid'],
            {
                'subjects': subjects,
                'recommended_schedule': schedule['recommended_schedule'],
                'confidence': schedule['confidence'],
                'focus_level': focus_level,
                'available_time': available_time
            }
        )
        schedule['id'] = schedule_id
    
    return jsonify(schedule), HTTPStatus.OK
```

#### `/sessions/end` - Store in Firestore
```python
@app.route('/sessions/end', methods=['POST'])
def end_session():
    user_info = authenticate_request()
    
    # After updating database:
    firebase_utils.store_past_session(
        user_info['uid'],
        {
            'subject': subject,
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration_sec': duration_sec,
            'focus_rating': focus_rating,
            'day_of_week': day_of_week
        }
    )
    
    return jsonify({...}), 200
```

#### `/predict_schedule` - Use past sessions
```python
# Get user's past sessions for ML
past_sessions_firestore = firebase_utils.get_past_sessions(user_info['uid'], limit=20)

# Convert to format ML expects
past_sessions = []
for session in past_sessions_firestore:
    past_sessions.append({
        'subject': session.get('subject', ''),
        'focus_rating': session.get('focus_rating', 3),
        'start': session.get('start_time', ''),
        'duration': session.get('duration_sec', 0) // 60  # Convert to minutes
    })

# Pass to schedule generation
schedule = utils.generate_study_schedule(
    subjects=subjects,
    # ... other params ...
    past_sessions=past_sessions,  # Use real data!
    # ...
)
```

### Step 3: Create Frontend Components

#### `src/components/SessionTimeline.jsx`
```jsx
import React from 'react';
import { format } from 'date-fns';

const SessionTimeline = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="session-timeline empty">
        <p>No study sessions yet. Start your first session to see your progress!</p>
      </div>
    );
  }

  return (
    <div className="session-timeline">
      <h3>Your Study History</h3>
      <div className="timeline">
        {sessions.map((session, index) => (
          <div key={session.id || index} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="session-header">
                <span className="subject">{session.subject}</span>
                <span className="date">
                  {format(new Date(session.start_time), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="session-details">
                <span className="duration">
                  {Math.round(session.duration_sec / 60)} mins
                </span>
                <span className="focus-rating">
                  Focus: {'⭐'.repeat(session.focus_rating)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionTimeline;
```

#### `src/components/NextSessionCard.jsx`
```jsx
import React from 'react';
import { format, formatDistance } from 'date-fns';

const NextSessionCard = ({ nextSession, onStartSession }) => {
  if (!nextSession) return null;

  const nextTime = new Date(nextSession.next_session_time);
  const timeUntil = formatDistance(nextTime, new Date(), { addSuffix: true });
  const confidence = nextSession.confidence;
  
  return (
    <div className={`next-session-card confidence-${confidence}`}>
      <h4>📚 Next Recommended Session</h4>
      <div className="session-time">
        <span className="time">{format(nextTime, 'h:mm a')}</span>
        <span className="relative-time">{timeUntil}</span>
      </div>
      <div className="focus-score">
        <label>Predicted Focus:</label>
        <div className="score-bar">
          <div 
            className="score-fill" 
            style={{ width: `${nextSession.focus_score * 100}%` }}
          ></div>
        </div>
        <span>{Math.round(nextSession.focus_score * 100)}%</span>
      </div>
      <div className="confidence-badge">
        Confidence: <strong>{confidence}</strong>
      </div>
      <button 
        className="btn btn-primary start-session-btn"
        onClick={onStartSession}
      >
        Start Session Now
      </button>
    </div>
  );
};

export default NextSessionCard;
```

#### `src/components/NotificationPanel.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { getNotifications } from '../services/api';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    // Poll for notifications every 30 seconds
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (index) => {
    setDismissed(prev => new Set([...prev, index]));
  };

  const visibleNotifications = notifications.filter((_, index) => !dismissed.has(index));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="notification-panel">
      {visibleNotifications.map((notif, index) => (
        <div key={index} className={`notification notification-${notif.priority}`}>
          <div className="notification-content">
            <h5>{notif.title}</h5>
            <p>{notif.message}</p>
          </div>
          <button 
            className="dismiss-btn"
            onClick={() => handleDismiss(index)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;
```

### Step 4: Update Dashboard Component

Add to `src/components/Dashboard.jsx`:

```jsx
import SessionTimeline from './SessionTimeline';
import NextSessionCard from './NextSessionCard';
import NotificationPanel from './NotificationPanel';
import { getPastSessions, getNextSession } from '../services/api';

// In Dashboard component:
const [user Info, setUserInfo] = useState(null);
const [pastSessions, setPastSessions] = useState([]);
const [nextSession, setNextSession] = useState(null);

useEffect(() => {
  if (user) {
    // Fetch user data
    fetchUserData();
  }
}, [user]);

const fetchUserData = async () => {
  try {
    // Get user profile
    const profileData = await fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${await user.getIdToken()}` }
    }).then(r => r.json());
    setUserInfo(profileData);

    // Get past sessions
    const sessionsData = await getPastSessions(10);
    setPastSessions(sessionsData.sessions);

    // Get next session
    const nextData = await getNextSession();
    setNextSession(nextData);
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

// In render:
return (
  <div className="dashboard-container">
    {userInfo && (
      <h2>Welcome Back, {userInfo.name}! 👋</h2>
    )}
    
    <NotificationPanel />
    
    <div className="dashboard-grid">
      <div className="dashboard-left">
        <NextSessionCard 
          nextSession={nextSession}
          onStartSession={startTimer}
        />
        {/* Existing preferences form */}
      </div>
      
      <div className="dashboard-right">
        <SessionTimeline sessions={pastSessions} />
        {/* Existing recommendations */}
      </div>
    </div>
  </div>
);
```

### Step 5: Add API Service Functions

Add to `src/services/api.js`:

```javascript
export const getUserProfile = async () => {
  return fetchWithAuth('/api/user/profile', { method: 'GET' });
};

export const getPastSessions = async (limit = 10) => {
  return fetchWithAuth(`/api/user/past-sessions?limit=${limit}`, { method: 'GET' });
};

export const getPredictedSchedules = async (status = null, limit = 10) => {
  const url = `/api/user/schedules?limit=${limit}${status ? `&status=${status}` : ''}`;
  return fetchWithAuth(url, { method: 'GET' });
};

export const confirmSchedule = async (scheduleId) => {
  return fetchWithAuth(`/api/user/schedules/${scheduleId}/confirm`, {
    method: 'POST'
  });
};

export const adjustSchedule = async (scheduleId, adjustments) => {
  return fetchWithAuth(`/api/user/schedules/${scheduleId}/adjust`, {
    method: 'POST',
    body: JSON.stringify({ adjustments })
  });
};

export const getNextSession = async () => {
  return fetchWithAuth('/api/user/next-session', { method: 'GET' });
};

export const getNotifications = async () => {
  return fetchWithAuth('/api/user/notifications', { method: 'GET' });
};
```

### Step 6: Add CSS Styles

Add to `src/App.css`:

```css
/* Session Timeline */
.session-timeline {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
  left: -24px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4CAF50;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #4CAF50;
}

.timeline-content {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
}

/* Next Session Card */
.next-session-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.next-session-card h4 {
  margin-top: 0;
  font-size: 1.2em;
}

.session-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}

.session-time .time {
  font-size: 2em;
  font-weight: bold;
}

.focus-score {
  margin: 15px 0;
}

.score-bar {
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
}

.score-fill {
  height: 100%;
  background: white;
  transition: width 0.3s ease;
}

.confidence-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  font-size: 0.9em;
}

.start-session-btn {
  width: 100%;
  margin-top: 15px;
  padding: 12px;
  font-size: 1.1em;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.start-session-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Notification Panel */
.notification-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
}

.notification {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  justify-content: space-between;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-high {
  border-left: 4px solid #f44336;
}

.notification-medium {
  border-left: 4px solid #ff9800;
}

.notification-low {
  border-left: 4px solid #4CAF50;
}

.notification h5 {
  margin: 0 0 8px 0;
  font-size: 1em;
}

.notification p {
  margin: 0;
  font-size: 0.9em;
  color: #666;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  color: #999;
  cursor: pointer;
  padding: 0 8px;
}

.dismiss-btn:hover {
  color: #333;
}

/* Welcome Message */
.dashboard-container h2 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #333;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .notification-panel {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
```

## 🧪 Testing

### 1. Test Backend Endpoints

```powershell
# Get user profile
$headers = @{"Authorization"="Bearer YOUR_TOKEN"}
(Invoke-WebRequest -Uri http://localhost:5000/api/user/profile -Headers $headers).Content

# Get past sessions
(Invoke-WebRequest -Uri "http://localhost:5000/api/user/past-sessions?limit=10" -Headers $headers).Content

# Get next session
(Invoke-WebRequest -Uri http://localhost:5000/api/user/next-session -Headers $headers).Content

# Get notifications
(Invoke-WebRequest -Uri http://localhost:5000/api/user/notifications -Headers $headers).Content
```

### 2. Test Frontend
1. Log in with Firebase account
2. Verify "Welcome Back, [Name]" appears
3. Create a study session
4. End session and check it appears in timeline
5. Generate study plan
6. Check notifications appear
7. Verify next session card shows

## 🚀 Deployment Checklist

- [ ] Add Firebase service account credentials to `.env`
- [ ] Deploy Firestore security rules
- [ ] Test authentication flow
- [ ] Verify data persists in Firestore
- [ ] Test notification polling
- [ ] Enable browser notifications
- [ ] Test on mobile devices
- [ ] Performance testing with large datasets

## 📝 Summary

This implementation provides:
✅ User-specific data storage in Firestore
✅ Personalized welcome message
✅ Past session timeline
✅ Next recommended session prediction
✅ Smart notifications (session reminders, breaks, achievements)
✅ Schedule confirmation/adjustment
✅ ML models learn from real user data
✅ Fully authenticated and secure

All data is stored per-user in Firestore, ML predictions improve over time with user feedback, and notifications keep users engaged with smart reminders!
