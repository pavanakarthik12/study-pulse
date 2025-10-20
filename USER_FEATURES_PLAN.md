# Study Pulse - User-Specific Features Implementation Plan

## Overview
Transform Study Pulse into a fully personalized application with Firebase data persistence, smart notifications, and user-specific historical tracking.

## Backend Changes Required

### 1. New API Endpoints (app.py)

#### GET `/api/user/profile`
- Returns user info (name, email) from Firebase token
- Response: `{"uid": "...", "name": "John", "email": "john@example.com"}`

#### GET `/api/user/past-sessions`
- Retrieve user's past study sessions from Firestore
- Query params: `limit` (default 50)
- Response: Array of session objects

#### GET `/api/user/schedules`
- Retrieve user's predicted schedules
- Query params: `status` (pending/confirmed/adjusted/completed), `limit`
- Response: Array of schedule objects

#### POST `/api/user/schedules/:id/confirm`
- Confirm a predicted schedule
- Updates status to 'confirmed'

#### POST `/api/user/schedules/:id/adjust`
- Adjust a predicted schedule
- Body: `{"adjustments": {...}}`
- Updates ML model with user feedback

#### GET `/api/user/next-session`
- Calculate next high-focus window
- Returns: `{"next_session_time": "...", "focus_score": 0.8, "confidence": "high"}`

#### GET `/api/user/notifications`
- Get smart notifications for user
- Returns array of notification objects

### 2. Modified Endpoints

#### POST `/predict_schedule`
- NOW: Stores predicted schedule in Firestore under user/{uid}/predicted_schedules
- Uses past sessions from Firestore to improve predictions
- Returns schedule with Firestore document ID

#### POST `/sessions/start`
- NOW: Requires auth, stores under authenticated user

#### POST `/sessions/end`
- NOW: Stores completed session in Firestore under user/{uid}/past_sessions
- Feeds data back into ML models

## Frontend Changes Required

### 1. New Components

#### `SessionTimeline.jsx`
- Display user's past study sessions in timeline view
- Shows date, subject, duration, focus rating
- Visual representation of progress

####  `NextSessionCard.jsx`
- Highlights next recommended session time
- Shows focus score and confidence
- "Start Session" button

#### `NotificationPanel.jsx`
- Display smart notifications
- Types: session reminders, break suggestions, hydration reminders
- Dismissable with actions

#### `ScheduleAdjuster.jsx`
- Allow users to confirm or adjust predicted schedules
- Drag-and-drop time adjustments
- Submit feedback to ML model

### 2. Updated Components

#### `Dashboard.jsx`
- Add welcome message: "Welcome Back, [Name]"
- Display SessionTimeline
- Display NextSessionCard
- Display NotificationPanel
- Only show for authenticated users

#### `Navigation.jsx`
- Show user name in nav bar
- User menu dropdown

### 3. New Services

#### `firestore.service.js`
- `getPastSessions(limit)`
- `getPredictedSchedules(status, limit)`
- `confirmSchedule(scheduleId)`
- `adjustSchedule(scheduleId, adjustments)`
- `getNextSession()`
- `getNotifications()`

## Smart Notifications System

### Notification Types

1. **Session Start Reminder**
   - Trigger: 15 minutes before predicted high-focus window
   - Message: "Your optimal study time starts in 15 minutes! Ready to study [Subject]?"

2. **Break Reminder**
   - Trigger: After 45-60 minutes of study
   - Message: "Time for a 10-minute break! Stretch and hydrate 💧"

3. **Hydration Reminder**
   - Trigger: Every 30 minutes during study
   - Message: "Don't forget to drink water! 💧"

4. **Exercise Suggestion**
   - Trigger: After 2 hours of study or low focus rating
   - Message: "Quick 5-minute stretch break? Your focus will thank you! 🧘"

5. **Achievement Notification**
   - Trigger: After completing predicted schedule
   - Message: "Great job! You completed today's study plan! 🎉"

### Implementation
- Backend calculates notification triggers based on:
  - User's past sessions
  - Current active session
  - Predicted schedule
  - Time since last break/hydration
- Frontend polls `/api/user/notifications` every 30 seconds
- Browser notifications API for desktop alerts
- In-app notification panel

## ML Model Enhancement

### Using Historical Data

**Modified `generate_study_schedule()` in utils.py:**
```python
# Fetch user's past sessions from Firestore
past_sessions = firebase_utils.get_past_sessions(user_id, limit=50)

# Analyze patterns
subject_performance = analyze_subject_performance(past_sessions)
time_of_day_performance = analyze_time_performance(past_sessions)
focus_patterns = analyze_focus_patterns(past_sessions)

# Use patterns to adjust predictions
for subject in subjects:
    # Prioritize based on past performance
    if subject in subject_performance:
        priority = calculate_priority(subject_performance[subject])
    
    # Adjust duration based on historical data
    avg_duration = get_average_duration(past_sessions, subject)
    predicted_duration = blend_prediction(ml_duration, avg_duration)
```

### Feedback Loop

When user adjusts schedule:
1. Store adjustment in Firestore
2. Create training data point: (predicted_schedule, user_adjustment, final_result)
3. Periodically retrain models with real user data
4. Improve predictions over time

## Data Structure

### Firestore Schema

```
users/
  {user_id}/
    - name: string
    - email: string
    - created_at: timestamp
    - updated_at: timestamp
    
    past_sessions/
      {session_id}/
        - subject: string
        - start_time: timestamp
        - end_time: timestamp
        - duration_sec: number
        - focus_rating: number (1-5)
        - day_of_week: number
        - timestamp: timestamp
    
    predicted_schedules/
      {schedule_id}/
        - subjects: array
        - recommended_schedule: array
        - confidence: number
        - status: string (pending/confirmed/adjusted/completed)
        - timestamp: timestamp
        - updated_at: timestamp
        - adjustments: object (optional)
```

## Implementation Priority

### Phase 1: Core Backend (Immediate)
1. ✅ Create firebase_utils.py with Firestore functions
2. Add new API endpoints to app.py
3. Modify existing endpoints to use Firestore
4. Initialize Firestore in app startup

### Phase 2: Frontend Integration (Immediate)
1. Create SessionTimeline component
2. Create NextSessionCard component
3. Update Dashboard to show personalized data
4. Add welcome message with user name

### Phase 3: Smart Notifications (Next)
1. Create NotificationPanel component
2. Implement notification logic in backend
3. Add browser notifications
4. Create notification polling service

### Phase 4: Schedule Adjustment (Next)
1. Create ScheduleAdjuster component
2. Add confirm/adjust endpoints
3. Implement feedback loop for ML
4. Add drag-and-drop schedule editing

## Testing Plan

1. **Auth Testing**
   - Verify only authenticated users see personalized data
   - Test token expiration handling
   - Test mock auth in development

2. **Data Persistence**
   - Create session → verify stored in Firestore
   - Generate schedule → verify stored with correct user_id
   - Confirm schedule → verify status updated

3. **ML Adaptation**
   - Generate schedule with no history → verify defaults
   - Add 10 past sessions → verify predictions improve
   - Adjust schedule → verify feedback incorporated

4. **Notifications**
   - Start session → verify break reminders appear
   - Approach high-focus time → verify session reminder
   - Complete schedule → verify achievement notification

## Security Considerations

1. All endpoints require Firebase authentication
2. User can only access their own data
3. Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## Next Steps

1. Implement Phase 1 backend changes
2. Test with curl/Postman
3. Implement Phase 2 frontend changes
4. End-to-end testing
5. Deploy notifications and adjustment features
