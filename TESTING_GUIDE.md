# Study Pulse - Testing Guide

## Backend API Testing

### 1. Test `/predict_schedule` Endpoint

**Valid Request:**
```powershell
$body = '{"subjects": ["Math", "Physics", "Chemistry"], "focus_level": 0.8, "available_time": "09:00 - 17:00", "preferred_duration": 45, "past_sessions": []}'; $headers = @{"Content-Type"="application/json"; "Authorization"="Bearer test-token"}; (Invoke-WebRequest -Uri http://localhost:5000/predict_schedule -Method POST -Headers $headers -Body $body).Content
```

**Expected Response:**
```json
{
  "recommended_schedule": [
    {
      "subject": "Math",
      "start": "09:00 AM",
      "end": "10:07 AM",
      "duration": 67,
      "priority": 4
    },
    {
      "break": 10
    },
    {
      "subject": "Physics",
      "start": "10:17 AM",
      "end": "11:26 AM",
      "duration": 69,
      "priority": 4
    },
    ...
  ],
  "confidence": 0.8
}
```

**Test Missing Fields (Should return 422):**
```powershell
$body = '{"subjects": ["Math"]}'; $headers = @{"Content-Type"="application/json"; "Authorization"="Bearer test-token"}; try { (Invoke-WebRequest -Uri http://localhost:5000/predict_schedule -Method POST -Headers $headers -Body $body).Content } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }
```

**Expected Response:**
- Status Code: 422
- Error message indicating missing fields

### 2. Test `/sessions/start` Endpoint

**Valid Request:**
```powershell
$body = '{"user_id": "test-user-123", "start_time": "2025-10-20 09:00:00", "focus_rating": 4, "subject": "Math", "day_of_week": 0}'; $headers = @{"Content-Type"="application/json"}; (Invoke-WebRequest -Uri http://localhost:5000/sessions/start -Method POST -Headers $headers -Body $body).Content
```

**Expected Response:**
```json
{
  "message": "Session started successfully",
  "session_id": 1
}
```

**Test Missing Fields (Should return 422):**
```powershell
$body = '{"user_id": "test-user"}'; $headers = @{"Content-Type"="application/json"}; try { (Invoke-WebRequest -Uri http://localhost:5000/sessions/start -Method POST -Headers $headers -Body $body).Content } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }
```

**Expected Response:**
- Status Code: 422
- Error object with missing field details

### 3. Test `/test_ml` Endpoint

**Request:**
```powershell
(Invoke-WebRequest -Uri http://localhost:5000/test_ml -Method GET).Content
```

**Expected Response:**
```json
{
  "message": "ML test completed successfully",
  "results": [
    {
      "focus_rating": 3,
      "day_of_week": 2,
      "predicted_start_hour": 10,
      "predicted_duration_minutes": 45
    },
    ...
  ]
}
```

## Frontend Testing

### 1. Access the Application
- Open your browser and navigate to: http://localhost:3000
- Or click the preview browser button provided

### 2. Test Login/Signup Flow
1. If redirected to login, use Firebase authentication
2. For development, you may bypass auth (check console for dev mode messages)

### 3. Test Dashboard Features

#### A. Study Preferences Form
1. **Select Multiple Subjects:**
   - Hold Ctrl (or Cmd on Mac)
   - Click multiple subjects from the list
   - Verify multiple subjects are selected

2. **Set Focus Level:**
   - Use the slider to adjust focus level (1-10)
   - Verify the value changes

3. **Set Available Time:**
   - Set start time (e.g., 09:00)
   - Set end time (e.g., 17:00)
   - Ensure end time is after start time

4. **Set Preferred Duration:**
   - Enter duration in minutes (15-180)
   - Verify input validation

#### B. Generate Study Plan
1. Click "Get Study Plan" button
2. Verify loading state appears
3. Wait for recommendations to load

#### C. Recommendations Display
1. **Verify Schedule Shows:**
   - Each selected subject with emoji icon
   - Start and end times for each subject
   - Break times between subjects
   - Priority scores (if enabled)

2. **Verify Confidence Score:**
   - Displayed as percentage (0-100%)
   - Warning message if confidence < 70%

3. **Test Different Scenarios:**
   - Single subject
   - Multiple subjects (2-5)
   - Different focus levels
   - Different time ranges
   - Different durations

#### D. Study Timer
1. Click "Start" to begin timer
2. Verify timer counts up
3. Click "Pause" to pause
4. Click "Reset" to reset to 00:00:00

## ML Model Validation

### 1. Check Models Exist
```powershell
Test-Path "c:\Users\pavan\OneDrive\Desktop\study-pulse\backend\models\start_time_model.pkl"
Test-Path "c:\Users\pavan\OneDrive\Desktop\study-pulse\backend\models\duration_model.pkl"
```

Both should return `True`

### 2. Verify Predictions are Realistic
- Start times should be between 6 AM and 9 PM
- Durations should be between 20 and 90 minutes
- Breaks should be 5-10 minutes
- Total schedule fits within available time
- Subjects are prioritized appropriately

### 3. Test with Past Sessions
Send a request with past_sessions data:
```powershell
$body = '{"subjects": ["Math"], "focus_level": 0.7, "available_time": "09:00 - 15:00", "preferred_duration": 45, "past_sessions": [{"subject": "Math", "focus_rating": 3, "start": "09:00 AM", "duration": 40}, {"subject": "Math", "focus_rating": 4, "start": "10:00 AM", "duration": 50}]}'; $headers = @{"Content-Type"="application/json"; "Authorization"="Bearer test-token"}; (Invoke-WebRequest -Uri http://localhost:5000/predict_schedule -Method POST -Headers $headers -Body $body).Content
```

Verify:
- Confidence score increases with more past sessions
- Predictions adapt based on past performance

## Error Handling Tests

### 1. Invalid JSON Input
```powershell
$body = 'invalid json'; $headers = @{"Content-Type"="application/json"}; try { (Invoke-WebRequest -Uri http://localhost:5000/predict_schedule -Method POST -Headers $headers -Body $body).Content } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }
```
Expected: 422 status code

### 2. Invalid Time Format
```powershell
$body = '{"subjects": ["Math"], "focus_level": 0.8, "available_time": "invalid", "preferred_duration": 45}'; $headers = @{"Content-Type"="application/json"; "Authorization"="Bearer test-token"}; try { (Invoke-WebRequest -Uri http://localhost:5000/predict_schedule -Method POST -Headers $headers -Body $body).Content } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }
```
Expected: 422 status code with error message

### 3. Focus Rating Out of Range
```powershell
$body = '{"user_id": "test", "start_time": "2025-10-20 09:00:00", "focus_rating": 10}'; $headers = @{"Content-Type"="application/json"}; try { (Invoke-WebRequest -Uri http://localhost:5000/sessions/start -Method POST -Headers $headers -Body $body).Content } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }
```
Expected: 422 status code

## Browser Console Testing

1. Open browser DevTools (F12)
2. Go to Console tab
3. Verify no errors when:
   - Loading the page
   - Submitting the form
   - Receiving recommendations
4. Check Network tab:
   - POST to `/predict_schedule` returns 200
   - Response contains valid JSON
   - Authorization header is included

## Common Issues and Solutions

### Issue: "ML models not loaded"
**Solution:** Run the training scripts:
```powershell
cd c:\Users\pavan\OneDrive\Desktop\study-pulse\backend\ml
python train_start_time.py
python train_duration.py
```

### Issue: "Database errors"
**Solution:** Reinitialize the database:
```powershell
cd c:\Users\pavan\OneDrive\Desktop\study-pulse\backend
Remove-Item study_pulse.db
python -c "from app import app, init_db; init_db(); print('Database initialized')"
```

### Issue: "CORS errors in browser"
**Solution:** Ensure backend has CORS enabled (already configured in app.py)

### Issue: "Firebase authentication errors"
**Solution:** App runs in development mode with mock authentication. For production, configure Firebase credentials in .env file.

### Issue: "No recommendations displayed"
**Solution:** 
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check Network tab for failed requests
4. Ensure all required fields are filled in the form

## Success Criteria

✅ Backend starts without errors
✅ ML models load successfully
✅ `/predict_schedule` returns valid JSON with schedule
✅ `/sessions/start` creates sessions successfully
✅ Missing fields return 422 status code
✅ Frontend loads without errors
✅ Form accepts user input
✅ "Get Study Plan" button triggers API call
✅ Recommendations display with subjects, times, and breaks
✅ Confidence score is shown
✅ Timer functions correctly
✅ All errors are logged and handled gracefully

## Quick Test Script

Run this in PowerShell to test all endpoints:

```powershell
# Test predict_schedule
Write-Host "Testing /predict_schedule..." -ForegroundColor Cyan
$body = '{"subjects": ["Math", "Physics"], "focus_level": 0.8, "available_time": "09:00 - 17:00", "preferred_duration": 45, "past_sessions": []}'; $headers = @{"Content-Type"="application/json"; "Authorization"="Bearer test-token"}; (Invoke-WebRequest -Uri http://localhost:5000/predict_schedule -Method POST -Headers $headers -Body $body).Content

Write-Host "`nTesting /sessions/start..." -ForegroundColor Cyan
$body = '{"user_id": "test-user", "start_time": "2025-10-20 09:00:00", "focus_rating": 4, "subject": "Math"}'; $headers = @{"Content-Type"="application/json"}; (Invoke-WebRequest -Uri http://localhost:5000/sessions/start -Method POST -Headers $headers -Body $body).Content

Write-Host "`nTesting /test_ml..." -ForegroundColor Cyan
(Invoke-WebRequest -Uri http://localhost:5000/test_ml -Method GET).Content | ConvertFrom-Json | Select-Object -ExpandProperty results | Select-Object -First 3

Write-Host "`nAll tests completed!" -ForegroundColor Green
```
