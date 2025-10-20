import os
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
import utils

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-key")
CORS(app)

# Initialize Firebase
utils.initialize_firebase()

# Load ML models
start_time_model, duration_model = utils.load_ml_models()

# Database setup
DATABASE = 'study_pulse.db'

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
        
        # Create sessions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            subject TEXT NOT NULL,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            focus_rating INTEGER,
            day_of_week INTEGER,
            duration_sec INTEGER
        )
        ''')
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
    user_id = authenticate_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    if not data or 'subject' not in data:
        return jsonify({'error': 'Subject is required'}), 400
    
    subject = data.get('subject')
    day_of_week = data.get('day_of_week', datetime.now().weekday())
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'INSERT INTO sessions (user_id, subject, start_time, day_of_week) VALUES (?, ?, ?, ?)',
        (user_id, subject, datetime.now(), day_of_week)
    )
    db.commit()
    
    return jsonify({
        'message': 'Session started successfully',
        'session_id': cursor.lastrowid
    }), 201

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
    user_id = authenticate_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid request data'}), 400
    
    focus_rating = data.get('focus_rating', 3)
    day_of_week = data.get('day_of_week', datetime.now().weekday())
    
    # Get user's average session duration for duration prediction
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'SELECT AVG(duration_sec) as avg_duration FROM sessions WHERE user_id = ? AND focus_rating IS NOT NULL',
        (user_id,)
    )
    result = cursor.fetchone()
    avg_duration_sec = result['avg_duration'] if result and result['avg_duration'] else 2700  # Default to 45 minutes
    
    # Predict optimal start time
    recommended_start_hour = utils.predict_start_time(
        start_time_model, focus_rating, day_of_week, avg_duration_sec
    )
    
    # Predict optimal duration
    recommended_duration_minutes = utils.predict_duration(
        duration_model, focus_rating, day_of_week, recommended_start_hour
    )
    
    return jsonify({
        'recommended_start_hour': recommended_start_hour,
        'recommended_duration_minutes': recommended_duration_minutes
    }), 200

@app.route('/test_ml', methods=['GET'])
def test_ml():
    # Generate dummy data
    X_start_time, y_start_time, X_duration, y_duration = utils.generate_dummy_data(10)
    
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