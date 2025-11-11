<img width="1629" height="783" alt="image" src="https://github.com/user-attachments/assets/022d295e-fe6c-40b2-a537-fafa38e9c31a" />
<img width="1720" height="796" alt="image" src="https://github.com/user-attachments/assets/7c5ac15a-7821-4f9c-b8f6-71742af7e75a" />
<img width="1701" height="797" alt="image" src="https://github.com/user-attachments/assets/6d4720cd-2413-4af7-bc42-94160fb472a0" />

# 📚 Study Pulse - AI-Powered Study Scheduler

> **Your personalized study companion that uses Machine Learning to optimize your learning schedule.**

[![Status](https://img.shields.io/badge/status-complete-success)](.)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-latest-green)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-9.22.0-orange)](https://firebase.google.com/)

---

## ✨ Features

### 🎵 YouTube Music Player
- **Simple Integration**: Paste any YouTube link to play study music
- **Auto-Save**: Remembers your last played song
- **Independent Controls**: Music and timers operate separately
- **Clean UI**: Minimal, beautiful design
- **Timer-Activated**: Appears only when study session starts
- **Full YouTube Controls**: Play, pause, volume, quality, and more
- **No Login Required**: Works instantly for all users
- **Flexible**: Play any YouTube video - music, lectures, podcasts

### 🤖 ML-Powered Schedule Predictions
- Personalized study schedules based on your preferences
- Learns from past study sessions
- Optimizes start times and durations
- Suggests optimal break intervals
- Confidence scoring for recommendations

### 📝 Schedule Adjustment
- Edit predicted schedules before starting
- Modify subject names, start times, and durations
- Add or remove subjects dynamically
- Adjust break lengths (5-30 minutes)
- Auto-calculates end times

### ⏱️ Sequential Timers
- **Shows ONLY current subject's time** (not cumulative)
- Queue-based execution - one subject at a time
- Circular progress visualization
- Auto-progression to next subject
- Pause, Resume, Skip controls
- Break timer between study sessions

### 🔔 Real-Time Notifications
- Session start reminders
- Halfway progress updates
- 5-minute warnings
- Hydration prompts every 20 minutes
- Break time notifications
- Next subject preview
- Progress summary

### 🎉 Gamification
- Confetti celebration on completion
- Completed subjects tracker
- Progress indicators
- Motivational messages

### 🔐 User Authentication
- Firebase authentication
- Secure user accounts
- Personalized data storage
- Session history tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Firebase account (for authentication)

### Installation

1. **Clone the repository**
```bash
cd c:\Users\pavan\OneDrive\Desktop\study-pulse
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
pip install flask flask-cors python-dotenv joblib numpy scikit-learn firebase-admin
```

4. **Configure Firebase**
- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Add a web app to your Firebase project
- Copy Firebase config to `src/firebase/config.js`
- Download service account key to `backend/` (for Firebase Admin SDK)

5. **Set up environment variables**
Create `backend/.env`:
```env
FLASK_SECRET_KEY=your-secret-key
DATABASE_PATH=study_pulse.db
FIREBASE_CREDENTIALS=your-firebase-credentials.json
```

### Running the Application

**Terminal 1 - Start React Frontend:**
```bash
npm start
```
→ Frontend runs on `http://localhost:3000`

**Terminal 2 - Start Flask Backend:**
```bash
cd backend
python app.py
```
→ Backend runs on `http://localhost:5000`

---

## 📖 User Guide

### 1. Login/Signup
- Navigate to `http://localhost:3000`
- Create an account or login with existing credentials
- Authenticated users see personalized dashboard

### 2. Connect YouTube Music (Optional)
- When you start a study session, the YouTube Music Player appears
- Paste any YouTube link (e.g., lo-fi music, study beats)
- Click "Play" to start the music
- Your last played link is saved for next time
- Control playback independently from the timer

### 3. Set Study Preferences
- **Subjects**: Select multiple subjects (hold Ctrl/Cmd)
- **Duration**: Preferred study session length (15-180 mins)
- **Time Range**: Available time window (start - end)
- **Focus Level**: Current attention level (1-10 scale)

### 4. Generate Study Plan
- Click **"Get Study Plan"**
- ML models predict optimal schedule
- See recommended subjects, times, breaks, confidence

### 5. Adjust Schedule (Optional)
- Click **"Adjust Schedule"**
- Edit subject names, start times, durations
- Add/remove subjects as needed
- Modify break lengths
- Click **"Save & Start Sessions"**

### 6. Study Sessions
- Click **"Confirm & Start Timers"**
- YouTube Music Player appears below the timer
- Paste a YouTube link to play study music
- Timer shows **only current subject's time**
- Control music playback independently
- Receive real-time notifications
- Take breaks between subjects
- Complete all sessions for confetti celebration! 🎉

---

## 🏗️ Architecture

### Frontend (React)
```
src/
├── components/
│   ├── Dashboard.jsx              # Main dashboard
│   ├── SequentialTimers.jsx       # Timer queue system
│   ├── ScheduleEditor.jsx         # Schedule adjustment modal
│   ├── NotificationSidebar.jsx    # Real-time notifications
│   ├── RecommendationCard.jsx     # ML predictions display
│   ├── MusicPlayer.jsx            # YouTube music player
│   └── *.css                      # Component styles
├── firebase/
│   └── config.js                  # Firebase configuration
└── services/
    └── api.js                     # Backend API calls
```

### Backend (Flask)
```
backend/
├── app.py                         # Flask server & API routes
├── utils.py                       # Firebase & utility functions
├── models/
│   ├── start_time_model.pkl       # ML model for start times
│   └── duration_model.pkl         # ML model for durations
└── study_pulse.db                 # SQLite database
```

### API Endpoints

#### `POST /sessions/start`
Start a new study session
```json
{
  "user_id": "string",
  "subject": "string",
  "start_time": "ISO timestamp",
  "focus_rating": 1-5
}
```

#### `POST /sessions/end`
End a study session
```json
{
  "session_id": "number",
  "focus_rating": 1-5
}
```

#### `POST /predict_schedule`
Get ML-powered schedule predictions
```json
{
  "subjects": ["Math", "Physics"],
  "focus_level": 0.8,
  "available_time": "09:00 - 18:00",
  "past_sessions": [],
  "preferred_duration": 45
}
```

**Response:**
```json
{
  "recommended_schedule": [
    {
      "subject": "Math",
      "start": "09:00 AM",
      "end": "09:45 AM",
      "duration": 45,
      "priority": 3
    },
    { "break": 10 },
    {
      "subject": "Physics",
      "start": "09:55 AM",
      "end": "10:40 AM",
      "duration": 45,
      "priority": 3
    }
  ],
  "confidence": 0.85
}
```

---

## 🎨 Components

### SequentialTimers
Queue-based timer system showing **only current subject's time**.

**Key Features:**
- Circular progress ring
- Auto-progression between subjects
- Break timer integration
- Pause/Resume/Skip controls
- Upcoming subjects queue
- Completed subjects tracker

**Usage:**
```jsx
<SequentialTimers 
  schedule={confirmedSchedule}
  onComplete={handleTimersComplete}
  onCancel={handleTimersCancel}
/>
```

### ScheduleEditor
Modal for adjusting predicted schedules.

**Features:**
- Edit subject names
- Adjust start times (12/24 hour conversion)
- Change durations (5-180 mins)
- Add/remove subjects
- Modify break lengths (5-30 mins)
- Auto-calculate end times

**Usage:**
```jsx
<ScheduleEditor 
  schedule={recommendations.recommended_schedule}
  onSave={handleEditorSave}
  onCancel={handleEditorCancel}
/>
```

### NotificationSidebar
Real-time notifications during study sessions.

**Notification Types:**
- **Session Start**: "Ready to study Math? Let's focus!"
- **Halfway**: "You're halfway through Math. Keep going!"
- **5-Min Warning**: "Wrap up Math soon!"
- **Hydration**: "Take a sip of water while studying."
- **Break**: "Take a short break. Stretch, walk around."

**Usage:**
```jsx
<NotificationSidebar 
  currentSubject={currentItem}
  timeRemaining={timeRemaining}
  isBreak={isBreakTime}
  schedule={subjectItems}
  currentIndex={currentIndex}
/>
```

---

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

**Quick Test:**
1. ✅ Login with Firebase
2. ✅ Select 2+ subjects, set preferences
3. ✅ Generate study plan
4. ✅ Adjust schedule (optional)
5. ✅ Start timers
6. ✅ Verify timer shows only current subject time
7. ✅ Check notifications appear
8. ✅ Complete all sessions → Confetti! 🎉

---

## 📦 Dependencies

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.11.2",
  "firebase": "^9.22.0",
  "react-firebase-hooks": "^5.1.1",
  "canvas-confetti": "^1.9.3"
}
```

### Backend
```
Flask
flask-cors
python-dotenv
joblib
numpy
scikit-learn
firebase-admin
```

---

## 🔧 Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication (Email/Password)

2. **Frontend Config** (`src/firebase/config.js`)
```javascript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

3. **Backend Config** (`backend/.env`)
```env
FIREBASE_CREDENTIALS=path/to/serviceAccountKey.json
```

---

## 🎯 Key Technical Decisions

### Timer Shows ONLY Current Subject Time
**Decision:** Each timer displays only its own duration, not cumulative time.

**Rationale:**
- More intuitive for users
- Clear focus on current task
- Reduces cognitive load
- Matches user mental model

**Implementation:**
```javascript
// Each timer resets to current subject's duration
setTimeRemaining(currentItem.duration * 60);

// NOT cumulative from all previous subjects
```

### Break Timer Countdown
**Decision:** Separate countdown for breaks with auto-progression.

**Rationale:**
- Visual distinction between study and break
- Auto-advances to maintain flow
- No manual intervention needed
- Encourages proper breaks

### Confetti Celebration
**Decision:** Celebrate completion with visual animation.

**Rationale:**
- Positive reinforcement
- Gamification element
- Sense of accomplishment
- Encourages future sessions

---

## 🐛 Troubleshooting

### ML Predictions Not Loading
- Check backend is running on `http://localhost:5000`
- Verify ML models exist in `backend/models/`
- Check CORS configuration in `backend/app.py`

### Timer Not Counting Down
- Ensure you clicked "Start" button
- Check browser console for errors
- Verify timer state is not paused

### Confetti Not Appearing
- Verify `canvas-confetti` is installed: `npm list canvas-confetti`
- Check all subjects completed (not skipped)
- Look for console errors

### Firebase Authentication Errors
- Verify Firebase config in `src/firebase/config.js`
- Check Firebase project settings
- Ensure authentication is enabled in Firebase Console

---

## 📝 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

- **ML Models**: scikit-learn
- **Frontend**: React, Firebase
- **Backend**: Flask
- **Confetti**: canvas-confetti
- **Icons**: Unicode emoji

---

## 📞 Support

For issues or questions:
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Check [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
3. Review browser console errors
4. Verify both servers are running

---

## 🎓 Features Summary

✅ **Spotify Integration** - OAuth music playback with full controls  
✅ **ML-Powered Predictions** - Personalized study schedules  
✅ **Schedule Adjustment** - Edit before starting  
✅ **Sequential Timers** - Shows only current subject time  
✅ **Break Timers** - Auto-countdown between subjects  
✅ **Real-Time Notifications** - Contextual reminders  
✅ **Confetti Celebration** - Completion animation  
✅ **Firebase Auth** - Secure user accounts  
✅ **Responsive Design** - Works on all devices  
✅ **Clean UI/UX** - Intuitive interface  
✅ **Error Handling** - Graceful error messages  

---

**Built with ❤️ for better learning outcomes**

*Study Pulse - Your AI study companion* 📚✨
