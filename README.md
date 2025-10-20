# Study Pulse Backend

A prototype backend for Study Pulse that tracks study sessions, integrates ML models for optimal study time prediction, and verifies Firebase ID tokens.

## Features

- User authentication via Firebase ID tokens
- Study session tracking (start/end times, focus ratings)
- ML-based predictions for optimal study start time and duration
- SQLite database for data storage
- RESTful API endpoints

## Project Structure

```
study-pulse/
│
├─ backend/
│   ├─ app.py                 # Flask main app
│   ├─ models/
│   │   ├─ start_time_model.pkl
│   │   └─ duration_model.pkl
│   ├─ ml/
│   │   ├─ train_start_time.py
│   │   └─ train_duration.py
│   ├─ utils.py               # Helper functions
│   └─ requirements.txt
├─ .env                       # Environment variables
└─ README.md
```

## Setup Instructions

1. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

2. Configure your `.env` file with Firebase credentials:
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_service_account_private_key
   FLASK_SECRET_KEY=your_flask_secret_key
   START_TIME_MODEL_PATH=./models/start_time_model.pkl
   DURATION_MODEL_PATH=./models/duration_model.pkl
   ```

3. Train the ML models:
   ```
   cd backend/ml
   python train_start_time.py
   python train_duration.py
   ```

4. Run the Flask application:
   ```
   cd backend
   python app.py
   ```

## API Endpoints

### Start a Study Session
- **URL**: `/sessions/start`
- **Method**: POST
- **Auth**: Bearer token (Firebase ID token)
- **Request Body**:
  ```json
  {
    "subject": "Math",
    "day_of_week": 1
  }
  ```
- **Response**:
  ```json
  {
    "message": "Session started successfully",
    "session_id": 1
  }
  ```

### End a Study Session
- **URL**: `/sessions/end`
- **Method**: POST
- **Auth**: Bearer token (Firebase ID token)
- **Request Body**:
  ```json
  {
    "session_id": 1,
    "focus_rating": 4
  }
  ```
- **Response**:
  ```json
  {
    "message": "Session ended successfully",
    "duration_sec": 3600
  }
  ```

### Get Personalized Schedule Predictions
- **URL**: `/predict_schedule`
- **Method**: POST
- **Auth**: Bearer token (Firebase ID token)
- **Request Body**:
  ```json
  {
    "focus_rating": 4,
    "day_of_week": 1
  }
  ```
- **Response**:
  ```json
  {
    "recommended_start_hour": 10,
    "recommended_duration_minutes": 45
  }
  ```

### Test ML Models
- **URL**: `/test_ml`
- **Method**: GET
- **Auth**: None (for testing purposes)
- **Response**: Sample predictions for dummy data