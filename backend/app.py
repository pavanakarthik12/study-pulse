from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
import utils
import os
import sqlite3
from datetime import datetime, timedelta
from http import HTTPStatus
import joblib
import numpy as np

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-key")
CORS(app)

# Initialize Firebase
utils.initialize_firebase()

# Load ML models
start_time_model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'start_time_model.pkl')
duration_model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'duration_model.pkl')
try:
    start_time_model = joblib.load(start_time_model_path)
    duration_model = joblib.load(duration_model_path)
    print("ML models loaded successfully")
except Exception as e:
    start_time_model = None
    duration_model = None
    print(f"Error loading ML models: {e}")

# Database setup
DATABASE = os.getenv('DATABASE_PATH', 'study_pulse.db')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()

        # Create sessions table with all necessary fields
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            subject TEXT,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            focus_rating INTEGER,
            day_of_week INTEGER,
            duration_sec INTEGER
        )
        ''')
        
        # Check if subject column exists, add it if it doesn't
        try:
            cursor.execute("PRAGMA table_info(sessions)")
            columns = [row[1] for row in cursor.fetchall()]
            if 'subject' not in columns:
                cursor.execute('ALTER TABLE sessions ADD COLUMN subject TEXT')
                print("Added subject column to sessions table")
            if 'end_time' not in columns:
                cursor.execute('ALTER TABLE sessions ADD COLUMN end_time TIMESTAMP')
                print("Added end_time column to sessions table")
        except Exception as e:
            print(f"Error checking/updating table schema: {e}")
        
        db.commit()

# Authentication middleware
def authenticate_request():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split('Bearer ')[1]
    return utils.verify_firebase_token(token)

# API Routes
@app.route('/sessions/start', methods=['POST'])
def start_session():
    data = request.get_json(force=True, silent=True)

    if data is None:
        print("Error: Invalid JSON input")
        return jsonify({"error": "Invalid JSON input"}), HTTPStatus.UNPROCESSABLE_ENTITY

    required_fields = ["user_id", "start_time", "focus_rating"]
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        errors = {field: f"{field} is required" for field in missing_fields}
        print(f"Missing fields: {errors}")
        return jsonify({"errors": errors}), HTTPStatus.UNPROCESSABLE_ENTITY

    try:
        user_id = data["user_id"]
        start_time = data["start_time"]
        focus_rating = data["focus_rating"]
        subject = data.get("subject", "General")
        day_of_week = data.get("day_of_week", datetime.now().weekday())

        # Validate focus_rating range
        if not isinstance(focus_rating, (int, float)) or not 1 <= focus_rating <= 5:
            return jsonify({"error": "focus_rating must be between 1 and 5"}), HTTPStatus.UNPROCESSABLE_ENTITY

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO sessions (user_id, start_time, focus_rating, day_of_week, subject) VALUES (?, ?, ?, ?, ?)',
            (user_id, start_time, focus_rating, day_of_week, subject)
        )
        db.commit()

        return jsonify({"message": "Session started successfully", "session_id": cursor.lastrowid}), HTTPStatus.CREATED

    except Exception as e:
        print(f"Error starting session: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to start session: {str(e)}"}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/sessions/end', methods=['POST'])
def end_session():
    user_id = authenticate_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    if not data or 'session_id' not in data or 'focus_rating' not in data:
        return jsonify({'error': 'Session ID and focus rating are required'}), 400

    session_id = data.get('session_id')
    focus_rating = data.get('focus_rating')

    db = get_db()
    cursor = db.cursor()

    # Get session start time
    cursor.execute('SELECT start_time FROM sessions WHERE id = ? AND user_id = ?', (session_id, user_id))
    session = cursor.fetchone()

    if not session:
        return jsonify({'error': 'Session not found'}), 404

    # Calculate duration in seconds
    start_time = datetime.fromisoformat(session['start_time'])
    end_time = datetime.now()
    duration_sec = (end_time - start_time).total_seconds()

    # Update session with end time, focus rating, and duration
    cursor.execute(
        'UPDATE sessions SET end_time = ?, focus_rating = ?, duration_sec = ? WHERE id = ?',
        (end_time, focus_rating, duration_sec, session_id)
    )
    db.commit()

    return jsonify({
        'message': 'Session ended successfully',
        'duration_sec': duration_sec
    }), 200

@app.route('/predict_schedule', methods=['POST'])
def predict_schedule():
    try:
        print("predict_schedule called")
        data = request.get_json(force=True, silent=True)
        
        if data is None:
            print("Error: Invalid JSON input or empty data")
            return jsonify({"error": "Invalid JSON input"}), HTTPStatus.UNPROCESSABLE_ENTITY

        # Extract and validate input fields
        subjects = data.get('subjects', [])
        focus_level = data.get('focus_level')
        available_time = data.get('available_time')
        past_sessions = data.get('past_sessions', [])
        preferred_duration = data.get('preferred_duration', 45)
        
        # Validate required fields
        missing_fields = []
        if not subjects or len(subjects) == 0:
            missing_fields.append('subjects')
        if focus_level is None:
            missing_fields.append('focus_level')
        if not available_time:
            missing_fields.append('available_time')
            
        if missing_fields:
            print(f"Error: Missing required fields: {missing_fields}")
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), HTTPStatus.UNPROCESSABLE_ENTITY

        if start_time_model is None or duration_model is None:
            print("Error: ML models not loaded")
            return jsonify({"error": "ML models not loaded"}), HTTPStatus.INTERNAL_SERVER_ERROR

        # Parse available time range
        try:
            time_parts = available_time.split(' - ')
            start_time_str = time_parts[0].strip()
            end_time_str = time_parts[1].strip()
            
            start_hour = int(start_time_str.split(':')[0])
            end_hour = int(end_time_str.split(':')[0])
            available_hours = end_hour - start_hour
        except Exception as e:
            print(f"Error parsing available_time: {e}")
            return jsonify({"error": "Invalid available_time format. Expected 'HH:MM - HH:MM'"}), HTTPStatus.UNPROCESSABLE_ENTITY

        # Convert focus_level (0-1) to focus_rating (1-5)
        focus_rating = max(1, min(5, int(focus_level * 5)))
        day_of_week = datetime.now().weekday()
        
        print(f"Input: subjects={subjects}, focus_rating={focus_rating}, day_of_week={day_of_week}, available_hours={available_hours}")
        
        # Generate study schedule for multiple subjects
        schedule = utils.generate_study_schedule(
            subjects=subjects,
            focus_rating=focus_rating,
            day_of_week=day_of_week,
            start_hour=start_hour,
            available_hours=available_hours,
            preferred_duration=preferred_duration,
            past_sessions=past_sessions,
            start_time_model=start_time_model,
            duration_model=duration_model
        )
        
        if not schedule or 'recommended_schedule' not in schedule:
            print("Error: Schedule generation failed")
            return jsonify({"error": "Failed to generate schedule"}), HTTPStatus.INTERNAL_SERVER_ERROR

        print(f"Generated schedule: {schedule}")
        return jsonify(schedule), HTTPStatus.OK

    except Exception as e:
        print(f"Error in /predict_schedule: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/test_ml', methods=['GET'])
def test_ml():
    # Generate dummy data
    X_start_time, y_start_time, X_duration, y_duration, _ = utils.generate_dummy_data(10)

    # Make predictions
    results = []
    for i in range(len(X_start_time)):
        focus_rating = int(X_start_time[i][0])
        day_of_week = int(X_start_time[i][1])
        duration_sec = int(X_start_time[i][2])

        predicted_start_hour = utils.predict_start_time(
            start_time_model, focus_rating, day_of_week, duration_sec
        )

        predicted_duration = utils.predict_duration(
            duration_model, focus_rating, day_of_week, predicted_start_hour
        )

        results.append({
            'focus_rating': focus_rating,
            'day_of_week': day_of_week,
            'predicted_start_hour': predicted_start_hour,
            'predicted_duration_minutes': predicted_duration
        })

    return jsonify({
        'message': 'ML test completed successfully',
        'results': results
    }), 200

# Initialize database
init_db()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)