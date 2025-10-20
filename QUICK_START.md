# Study Pulse - Quick Start Guide

## 🎯 What Was Fixed

Your Study Pulse app is now fully functional with:

✅ **Backend `/predict_schedule` route** - Generates personalized study schedules for multiple subjects
✅ **Backend `/sessions/start` route** - Tracks study sessions with proper validation
✅ **ML models** - Trained and ready to predict optimal study times and durations
✅ **Frontend** - Displays recommendations with subjects, times, breaks, and confidence scores
✅ **Error handling** - Returns 422 for validation errors, logs all errors
✅ **Input validation** - Checks all required fields before processing

---

## 🚀 How to Use the App

### 1. Backend is Running ✅
The backend server is already running at: **http://localhost:5000**

To restart it if needed:
```powershell
cd c:\Users\pavan\OneDrive\Desktop\study-pulse\backend
python app.py
```

### 2. Frontend is Running ✅
The React app is already running at: **http://localhost:3000**

To restart it if needed:
```powershell
cd c:\Users\pavan\OneDrive\Desktop\study-pulse
npm start
```

### 3. Access the App
**Click the preview browser button** or open your browser to:
👉 **http://localhost:3000**

---

## 📝 Using the Dashboard

### Step 1: Select Your Subjects
- Hold **Ctrl** (or **Cmd** on Mac)
- Click multiple subjects from the list
- Example: Math, Physics, Chemistry

### Step 2: Set Your Focus Level
- Use the slider to indicate your current focus/attention level
- Range: 1 (low) to 10 (high)
- Example: 8 for high focus

### Step 3: Set Available Time
- **Start Time**: When you want to begin studying (e.g., 09:00)
- **End Time**: When you need to finish (e.g., 17:00)

### Step 4: Set Preferred Duration
- Enter your ideal study session length in minutes
- Range: 15-180 minutes
- Example: 45 minutes

### Step 5: Generate Your Study Plan
- Click the **"Get Study Plan"** button
- Wait for the AI to generate your personalized schedule
- View your recommendations!

### What You'll See:
```
📐 Math — 09:00 AM to 10:07 AM
☕ Break — 10 mins
⚛️ Physics — 10:17 AM to 11:26 AM
☕ Break — 10 mins
🧪 Chemistry — 11:36 AM to 12:38 PM

Confidence Score: 80%
```

---

## 🧪 Test the API Directly

### Test Schedule Generation
```powershell
$body = '{"subjects": ["Math", "Physics"], "focus_level": 0.8, "available_time": "09:00 - 17:00", "preferred_duration": 45, "past_sessions": []}'; $headers = @{"Content-Type"="application/json"; "Authorization"="Bearer test-token"}; (Invoke-WebRequest -Uri http://localhost:5000/predict_schedule -Method POST -Headers $headers -Body $body).Content
```

### Test Session Start
```powershell
$body = '{"user_id": "test-user", "start_time": "2025-10-20 09:00:00", "focus_rating": 4, "subject": "Math"}'; $headers = @{"Content-Type"="application/json"}; (Invoke-WebRequest -Uri http://localhost:5000/sessions/start -Method POST -Headers $headers -Body $body).Content
```

### Test Error Handling (Missing Fields)
```powershell
$body = '{"subjects": ["Math"]}'; $headers = @{"Content-Type"="application/json"}; try { (Invoke-WebRequest -Uri http://localhost:5000/predict_schedule -Method POST -Headers $headers -Body $body).Content } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }
```

Should return: **422** with error details

---

## 🤖 How the ML Works

### Schedule Generation Algorithm
1. **Analyzes your focus level** - Higher focus = longer sessions
2. **Prioritizes subjects** - Based on past performance (if available)
3. **Predicts optimal times** - Best time of day for each subject
4. **Calculates durations** - Realistic session lengths (20-90 min)
5. **Inserts breaks** - 5-10 minute breaks between subjects
6. **Ensures fit** - Everything fits in your available time
7. **Returns confidence** - How confident the AI is in the schedule

### What Affects Predictions
- **Focus Level**: Higher focus = longer, more intensive sessions
- **Day of Week**: Weekdays vs weekends have different patterns
- **Time of Day**: Morning = better focus, afternoon = shorter sessions
- **Subject Type**: Math/Physics = longer, Reading = varied
- **Past Sessions**: More data = better predictions

---

## 📊 Features

### ✅ Multi-Subject Support
- Schedule multiple subjects in one plan
- Automatic prioritization
- Intelligent time allocation

### ✅ Smart Break Insertion
- 10-minute breaks for sessions ≥45 minutes
- 5-minute breaks for shorter sessions
- Prevents burnout

### ✅ Realistic Scheduling
- Sessions: 20-90 minutes
- Times: 6 AM - 9 PM
- Fits within your available time

### ✅ Confidence Scores
- Shows prediction reliability
- Based on data availability
- Warning if confidence < 70%

### ✅ Study Timer
- Track your actual study time
- Start, pause, and reset
- Helps build session data

---

## 🐛 Troubleshooting

### Issue: "No recommendations shown"
**Solution:**
1. Make sure all fields are filled
2. Check browser console (F12) for errors
3. Verify backend is running on port 5000
4. Check Network tab for failed requests

### Issue: "ML models not loaded"
**Solution:**
```powershell
cd c:\Users\pavan\OneDrive\Desktop\study-pulse\backend\ml
python train_start_time.py
python train_duration.py
```

### Issue: "Database errors"
**Solution:**
```powershell
cd c:\Users\pavan\OneDrive\Desktop\study-pulse\backend
Remove-Item study_pulse.db
python -c "from app import app, init_db; init_db(); print('Database initialized')"
```

### Issue: "CORS errors"
Already configured! CORS is enabled in the backend.

### Issue: "422 errors"
This means you're missing required fields. Check:
- subjects (must be array)
- focus_level (must be 0-1)
- available_time (must be "HH:MM - HH:MM")

---

## 📚 Documentation

For more details, see:
- **CHANGES_SUMMARY.md** - Complete list of changes made
- **TESTING_GUIDE.md** - Comprehensive testing instructions
- **README.md** - Original project documentation

---

## 🎉 You're All Set!

The app is ready to use! Here's what you can do now:

1. **Use the dashboard** to generate study plans
2. **Test different subjects** and focus levels
3. **Track your sessions** with the timer
4. **Build up past session data** for better predictions
5. **See your confidence scores** improve over time

**Need help?** Check the troubleshooting section or review the documentation files.

**Happy studying! 📖✨**
