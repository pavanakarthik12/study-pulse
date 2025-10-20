# Study Pulse - Testing Guide

## 🚀 Quick Start

### 1. Start Both Servers

**Terminal 1 - React Frontend:**
```bash
cd c:\Users\pavan\OneDrive\Desktop\study-pulse
npm start
```
✅ Frontend runs on: `http://localhost:3000`

**Terminal 2 - Flask Backend:**
```bash
cd c:\Users\pavan\OneDrive\Desktop\study-pulse\backend
python app.py
```
✅ Backend runs on: `http://localhost:5000`

---

## 🧪 Complete Testing Workflow

### Step 1: User Authentication
1. Open browser to `http://localhost:3000`
2. Click "Sign Up" or "Login"
3. Create account or login with Firebase
4. ✅ Should redirect to Dashboard with "Welcome Back, [Name]"

### Step 2: Set Study Preferences
1. On Dashboard, fill out the form:
   - **Subjects**: Hold Ctrl and select multiple (e.g., Math, Physics, Chemistry)
   - **Preferred Duration**: Set to 45 minutes
   - **Available Time Start**: 09:00
   - **Available Time End**: 18:00
   - **Focus Level**: Slide to 8/10
2. Click **"Get Study Plan"** button
3. ✅ Should see loading state, then ML predictions appear

### Step 3: Review ML Predictions
After clicking "Get Study Plan", you should see:
- ✅ Recommended schedule with subjects, start/end times
- ✅ Break times between subjects
- ✅ Confidence score percentage
- ✅ Two buttons: "Confirm & Start Timers" and "Adjust Schedule"

**Example Prediction:**
```
📚 Math
  Start: 09:00 AM
  End: 09:45 AM
  Duration: 45 mins

☕ Break: 10 mins

📚 Physics
  Start: 09:55 AM
  End: 10:40 AM
  Duration: 45 mins
```

### Step 4: Adjust Schedule (Optional)
1. Click **"Adjust Schedule"** button
2. ✅ Modal overlay should appear with editable schedule
3. **Test editing:**
   - Change "Math" to "Calculus"
   - Adjust start time to 10:00 AM
   - Change duration from 45 to 60 minutes
   - ✅ End time should auto-update
4. **Test adding subject:**
   - Click "+ Add Another Subject"
   - ✅ New subject with default 45 mins should appear
5. **Test removing subject:**
   - Click 🗑️ button on any subject (must have 2+ subjects)
   - ✅ Subject should be removed
6. **Test break adjustment:**
   - Change break from 10 to 15 minutes
   - ✅ Should update immediately
7. Click **"Save & Start Sessions"**
8. ✅ Modal should close, timers should start with adjusted schedule

### Step 5: Start Sequential Timers
1. Click **"Confirm & Start Timers"** (or save from editor)
2. ✅ Should see Sequential Timers component with:
   - Progress indicator (Subject 1 of 3)
   - Current subject name and time
   - Circular progress ring
   - **Only current subject's remaining time** (e.g., "45:00")
   - Start button
   - Upcoming subjects queue
   - Notification sidebar on the right

### Step 6: Test Timer Functionality

#### Timer Shows ONLY Current Subject Time
1. Click **"Start Math"** button
2. ✅ Timer should count down: 45:00 → 44:59 → 44:58...
3. ✅ **IMPORTANT**: Should show ONLY Math's time, NOT cumulative
4. ✅ Display should say "Math: 44:58" (not "Math + Physics: 90:00")

#### Test Pause/Resume
1. While timer is running, click **"Pause"** button
2. ✅ Timer should freeze
3. ✅ "Resume" button should appear
4. Click **"Resume"**
5. ✅ Timer should continue counting down

#### Test Skip
1. Click **"Skip"** button
2. ✅ Confirmation dialog appears
3. Click "OK"
4. ✅ Should move to break timer (if break exists) or next subject

#### Test Cancel All
1. Click **"Cancel All"** button
2. ✅ Confirmation dialog appears
3. Click "OK"
4. ✅ Should stop all timers and show completion summary

### Step 7: Test Notifications Sidebar

The sidebar should display notifications based on timer state:

#### Session Start Notification
- When you click "Start Math"
- ✅ Should show: "🎯 Session Starting! Ready to study Math? Let's focus!"

#### Halfway Notification
- When timer reaches 50% (e.g., 22:30 for 45-min session)
- ✅ Should show: "⏰ Halfway There! You're halfway through Math. Keep going!"

#### 5-Minute Warning
- When timer reaches 5:00
- ✅ Should show: "⏱️ 5 Minutes Left - Wrap up Math soon!"

#### Hydration Reminder
- Every 20 minutes (at 25:00, 5:00, etc.)
- ✅ Should show: "💧 Stay Hydrated! Take a sip of water while studying."

#### Dismiss Notifications
1. Click "×" on any notification
2. ✅ Notification should disappear

#### Next Subject Preview
- ✅ Should show next subject with start time and duration
- ✅ Example: "⏭️ Coming Next: Physics - 09:55 AM - 45 mins"

#### Progress Summary
- ✅ Should show current subject number (e.g., "1/3")
- ✅ Should show time remaining (e.g., "40m 30s")

### Step 8: Test Break Timer

1. Let first subject timer complete (or skip it)
2. ✅ Should show break timer screen:
   - Large ☕ icon
   - "Break Time!" heading
   - "Relax and recharge" message
   - Countdown timer (e.g., 10:00 → 09:59...)
3. ✅ Notification should appear: "☕ Break Time! Take a short break..."
4. ✅ After break completes, should auto-advance to next subject

**Test Break Timer Countdown:**
- ✅ Should count down in real-time
- ✅ Format: "MM:SS" (e.g., "10:00" → "09:59" → "00:01" → "00:00")

### Step 9: Test Auto-Progression

1. Start first subject timer
2. Wait for it to complete (or skip)
3. ✅ Should automatically show break timer
4. Wait for break to complete
5. ✅ Should automatically show next subject timer
6. ✅ Timer should be reset to next subject's duration
7. ✅ "Start [Subject]" button should appear

### Step 10: Test Confetti Celebration 🎉

1. Complete all subjects (can use Skip to speed up)
2. When last subject timer reaches 00:00:
   - ✅ Should trigger confetti animation
   - ✅ Confetti should fire from both left and right sides
   - ✅ Animation should last 3 seconds
   - ✅ Colors should be purple/blue gradient (#667eea, #764ba2, #f093fb, #4facfe)
   - ✅ Alert should appear: "🎉 Congratulations! You completed all your study sessions!"

### Step 11: Test Multiple Subjects

1. Set preferences with 5+ subjects
2. Generate study plan
3. ✅ Should see all subjects in queue
4. ✅ Each subject should have own timer
5. ✅ Breaks should appear between subjects
6. ✅ Queue should show remaining subjects
7. ✅ Completed list should grow as you finish

### Step 12: Test Responsive Design

#### Desktop View (> 1200px)
- ✅ Timers on left, notifications sidebar on right
- ✅ Side-by-side layout

#### Mobile View (< 1200px)
1. Resize browser to mobile width (< 768px)
2. ✅ Sidebar should move below timers
3. ✅ All elements should stack vertically
4. ✅ Touch-friendly buttons

---

## 🎯 Expected Behaviors

### ✅ Timer Shows ONLY Current Subject Time
- **CORRECT**: When studying Math (45 mins), shows "45:00" → "30:00" → "00:00"
- **INCORRECT**: Shows "90:00" (Math + Physics combined) ❌

### ✅ Break Timer Countdown
- **CORRECT**: Break timer counts down: "10:00" → "09:59" → "00:00"
- **INCORRECT**: Break timer stays at "10:00" ❌

### ✅ Auto-Progression
- **CORRECT**: Subject → Break → Next Subject (automatic)
- **INCORRECT**: Gets stuck on break screen ❌

### ✅ Confetti on Completion
- **CORRECT**: Confetti fires after last subject completes
- **INCORRECT**: No confetti or fires too early ❌

### ✅ Notifications Appear
- **CORRECT**: Notifications show in sidebar at right times
- **INCORRECT**: No notifications or wrong timing ❌

---

## 🔍 Common Issues & Solutions

### Issue: ML Predictions Not Showing
**Solution:**
1. Check backend is running on `http://localhost:5000`
2. Check browser console for CORS errors
3. Verify ML models exist in `backend/models/` directory
4. Check backend terminal for errors

### Issue: Timer Doesn't Count Down
**Solution:**
1. Make sure you clicked "Start [Subject]" button
2. Check browser console for JavaScript errors
3. Verify timer state is not paused

### Issue: Break Timer Doesn't Count Down
**Solution:**
1. Check console for errors
2. Verify break duration > 0 in schedule
3. Check `isBreakTime` state is true

### Issue: Confetti Doesn't Fire
**Solution:**
1. Verify all subjects completed (not just skipped)
2. Check `canvas-confetti` is installed: `npm list canvas-confetti`
3. Check browser console for import errors

### Issue: Notifications Don't Appear
**Solution:**
1. Verify timer is running (not paused)
2. Check `NotificationSidebar` component is rendered
3. Check browser console for errors
4. Verify timeRemaining is updating

### Issue: Schedule Editor Modal Doesn't Open
**Solution:**
1. Check "Adjust Schedule" button onClick handler
2. Verify `showEditor` state updates to true
3. Check browser console for errors
4. Verify `ScheduleEditor.css` is loaded

---

## 📊 Performance Checklist

- [ ] Frontend compiles without errors
- [ ] Backend starts without errors
- [ ] ML models load successfully
- [ ] User can login/signup
- [ ] Predictions generate in < 3 seconds
- [ ] Timers count down smoothly (no lag)
- [ ] Notifications appear at correct times
- [ ] Break timer counts down in real-time
- [ ] Auto-progression works seamlessly
- [ ] Confetti fires on completion
- [ ] Schedule editor saves changes
- [ ] Mobile responsive design works
- [ ] No console errors during normal usage

---

## 🎨 Visual Testing

### Color Scheme
- Primary: `#667eea` (purple)
- Secondary: `#764ba2` (deep purple)
- Accent: `#f093fb` (pink)
- Highlight: `#4facfe` (blue)

### Fonts & Spacing
- Timer font should be large and readable
- Buttons should have hover effects
- Progress ring should be smooth
- Notifications should have distinct colors

### Animations
- Circular progress should fill smoothly
- Confetti should be colorful and playful
- Transitions should be smooth (0.3s)
- No janky animations or flickering

---

## 📝 Testing Checklist Summary

### Core Features
- [ ] User authentication works
- [ ] ML predictions generate correctly
- [ ] Schedule adjustment modal opens
- [ ] Can edit subjects, times, durations
- [ ] Can add/remove subjects
- [ ] Can adjust break lengths
- [ ] Timer shows ONLY current subject time
- [ ] Timer counts down correctly
- [ ] Pause/Resume works
- [ ] Skip subject works
- [ ] Cancel all works

### Advanced Features
- [ ] Break timer appears between subjects
- [ ] Break timer counts down in real-time
- [ ] Auto-advances to next subject after break
- [ ] Notifications appear at correct times
- [ ] Can dismiss notifications
- [ ] Next subject preview shows
- [ ] Progress summary updates
- [ ] Confetti fires on completion
- [ ] Works for multiple subjects (5+)
- [ ] Responsive design on mobile

### Edge Cases
- [ ] Works with 1 subject only
- [ ] Works with 10+ subjects
- [ ] Handles 0-minute breaks correctly
- [ ] Handles very long durations (180 mins)
- [ ] Handles very short durations (5 mins)
- [ ] Survives page refresh (loses state - expected)
- [ ] Error handling for failed predictions

---

## 🎉 Success Criteria

**If all these work, the app is fully functional:**

1. ✅ User can login and see dashboard
2. ✅ User can generate ML-powered study plan
3. ✅ User can adjust schedule before starting
4. ✅ Sequential timers show ONLY current subject time
5. ✅ Break timer counts down and auto-advances
6. ✅ Notifications appear in sidebar
7. ✅ Confetti celebrates completion
8. ✅ Works for multiple subjects
9. ✅ No console errors
10. ✅ Smooth, professional UX

---

## 🐛 Bug Reporting Template

If you find a bug, report it with:

```
**Bug Description:**
[What happened?]

**Expected Behavior:**
[What should happen?]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [etc.]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Screen size: [Desktop/Mobile]

**Console Errors:**
[Paste any errors from browser console]

**Screenshots:**
[If applicable]
```

---

## 🚀 Ready to Test!

Your Study Pulse app is fully implemented with:
- ML-powered predictions
- Schedule adjustment
- Sequential timers (shows ONLY current subject)
- Break timers with countdown
- Real-time notifications
- Confetti celebration
- Clean, responsive design

**Start testing and enjoy your personalized study sessions!** 🎓✨
