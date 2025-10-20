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
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split('Bearer ')[1]
    try:
        # Verify token
        decoded_token = utils.verify_firebase_token(token)
        if not decoded_token or 'uid' not in decoded_token:
            return None
        return decoded_token.get('uid')
    except Exception as e:
        app.logger.error(f"Token validation error: {str(e)}")
        return None

# API Routes
@app.route('/api/start-session', methods=['POST'])
def start_session():
    """Start a new study session."""
    user_id = authenticate_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized - Invalid or missing token'}), 401
    
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Invalid request - No JSON data provided'}), 400
            
        subject = data.get('subject', 'General Study')
        
        # Insert new session into database
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO sessions (user_id, subject, start_time, day_of_week) VALUES (?, ?, ?, ?)',
            (user_id, subject, datetime.now().isoformat(), datetime.now().weekday())
        )
        db.commit()
        
        return jsonify({
            'message': 'Session started successfully', 
            'session_id': cursor.lastrowid
        }), 201
    except Exception as e:
        app.logger.error(f"Error starting session: {str(e)}")
        return jsonify({'error': f'Failed to start session: {str(e)}'}), 500

@app.route('/api/end-session', methods=['POST'])
def end_session():
    """End an existing study session."""
    user_id = authenticate_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized - Invalid or missing token'}), 401
    
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Invalid request - No JSON data provided'}), 400
            
        session_id = data.get('session_id')
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
            
        focus_rating = data.get('focus_rating', 5)  # Default to 5 if not provided
        
        # Update session in database
        db = get_db()
        cursor = db.cursor()
        
        # Get the start time of the session and verify user owns this session
        cursor.execute('SELECT start_time, user_id FROM sessions WHERE id = ?', (session_id,))
        session = cursor.fetchone()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
            
        # Verify user owns this session
        if session[1] != user_id:
            return jsonify({'error': 'Unauthorized - You do not own this session'}), 403
        
        start_time = datetime.fromisoformat(session[0])
        end_time = datetime.now()
        
        # Calculate duration in seconds
        duration_sec = int((end_time - start_time).total_seconds())
        
        # Update session with end time, focus rating, and duration
        cursor.execute(
            'UPDATE sessions SET end_time = ?, focus_rating = ?, duration_sec = ? WHERE id = ?',
            (end_time.isoformat(), focus_rating, duration_sec, session_id)
        )
        db.commit()
        
        return jsonify({
            'message': 'Session ended successfully', 
            'duration_sec': duration_sec
        }), 200
    except Exception as e:
        app.logger.error(f"Error ending session: {str(e)}")
        return jsonify({'error': f'Failed to end session: {str(e)}'}), 500

@app.route('/api/recommendation', methods=['GET'])
def get_recommendation():
    user_id = authenticate_request()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Get current day of week
    day_of_week = datetime.now().weekday()
    
    # Get user's average focus rating and session duration
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'SELECT AVG(focus_rating) as avg_focus, AVG(duration_sec) as avg_duration FROM sessions WHERE user_id = ? AND focus_rating IS NOT NULL',
        (user_id,)
    )
    result = cursor.fetchone()
    
    # Default values if no previous sessions
    focus_rating = int(result['avg_focus']) if result and result['avg_focus'] else 3
    avg_duration_sec = result['avg_duration'] if result and result['avg_duration'] else 2700  # Default to 45 minutes
    
    try:
        # Predict optimal start time
        recommended_start_hour = utils.predict_start_time(
            start_time_model, focus_rating, day_of_week, avg_duration_sec
        )
        
        # Predict optimal duration
        recommended_duration_minutes = utils.predict_duration(
            duration_model, focus_rating, day_of_week, recommended_start_hour
        )
        
        # Format the recommendation as a time range string
        start_time = f"{int(recommended_start_hour)}:{0 if recommended_start_hour.is_integer() else 30:02d}"
        end_hour = recommended_start_hour + (recommended_duration_minutes / 60)
        end_time = f"{int(end_hour)}:{int((end_hour % 1) * 60):02d}"
        
        # Convert to 12-hour format with AM/PM
        start_hour_12 = int(recommended_start_hour) % 12
        if start_hour_12 == 0:
            start_hour_12 = 12
        start_period = "AM" if recommended_start_hour < 12 else "PM"
        
        end_hour_12 = int(end_hour) % 12
        if end_hour_12 == 0:
            end_hour_12 = 12
        end_period = "AM" if end_hour < 12 else "PM"
        
        start_time_12 = f"{start_hour_12}:{0 if recommended_start_hour.is_integer() else 30:02d} {start_period}"
        end_time_12 = f"{end_hour_12}:{int((end_hour % 1) * 60):02d} {end_period}"
        
        recommended_time = f"{start_time_12} - {end_time_12}"
        
        return jsonify({
            'recommended_time': recommended_time,
            'recommended_start_hour': recommended_start_hour,
            'recommended_duration_minutes': recommended_duration_minutes
        }), 200
    except Exception as e:
        return jsonify({
            'error': f'Error generating recommendation: {str(e)}'
        }), 500

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