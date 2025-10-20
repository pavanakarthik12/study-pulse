import os
import joblib
import numpy as np
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth
from datetime import datetime

# Load environment variables
load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials."""
    try:
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            # Get Firebase credentials from environment variables
            firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
            firebase_client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
            firebase_private_key = os.getenv("FIREBASE_PRIVATE_KEY")

            if firebase_project_id and firebase_client_email and firebase_private_key:
                # Initialize with service account details from environment variables
                try:
                    cred = credentials.Certificate({
                        "type": "service_account",
                        "project_id": firebase_project_id,
                        "private_key": firebase_private_key.replace('\n', '\\n'),  # Replace newline characters
                        "client_email": firebase_client_email,
                    })
                    firebase_admin.initialize_app(cred)
                    print("Firebase initialized with service account details from environment variables")
                    return True
                except Exception as e:
                    print(f"Error initializing Firebase with env vars: {e}")
            else:
                print("Firebase environment variables not found, using mock Firebase")

            # Skip trying application default credentials and use mock directly
            # For development only - create a mock Firebase app
            print("WARNING: Using mock Firebase for development only")
            mock_cred = credentials.Certificate({
                "type": "service_account",
                "project_id": "study-pulse-dev",
                "private_key_id": "mock-key-id",
                "private_key": "-----BEGIN PRIVATE KEY-----\nmock-key\n-----END PRIVATE KEY-----\n",
                "client_email": "mock@study-pulse-dev.iam.gserviceaccount.com",
                "client_id": "mock-client-id",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mock"
            })
            firebase_admin.initialize_app(mock_cred, {'projectId': 'study-pulse-dev'})

        print("Firebase initialized successfully")
        return True
    except Exception as e:
        print(f"Firebase initialization error: {str(e)}")
        # Continue without Firebase for development purposes
        return False

def verify_firebase_token(id_token):
    """Verify Firebase ID token and return user ID."""
    # For development purposes, return a mock user ID
    # IMPORTANT: Remove this in production!
    print("DEVELOPMENT MODE: Bypassing token verification")
    return "dev-user-123"
    
    # The code below is commented out for development but should be used in production
    """
    if not id_token:
        print("No token provided")
        return None
    
    # Handle 'Bearer ' prefix if present
    if id_token.startswith('Bearer '):
        id_token = id_token[7:]
        
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except auth.InvalidIdTokenError:
        print("Invalid token: The token is malformed or expired")
        return None
    except auth.ExpiredIdTokenError:
        print("Expired token: The token has expired")
        return None
    except auth.RevokedIdTokenError:
        print("Revoked token: The token has been revoked")
        return None
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return None
    """

def load_ml_models():
    """Load ML models from pickle files."""
    try:
        # Use absolute paths to the model files
        model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
        start_time_model_path = os.path.join(model_dir, 'start_time_model.pkl')
        duration_model_path = os.path.join(model_dir, 'duration_model.pkl')
        
        # Check if models exist, if not, create them
        if not os.path.exists(start_time_model_path) or not os.path.exists(duration_model_path):
            print("Models not found. Training new models...")
            # Run the training scripts
            import subprocess
            ml_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ml')
            subprocess.run(['python', os.path.join(ml_dir, 'train_start_time.py')], check=True)
            subprocess.run(['python', os.path.join(ml_dir, 'train_duration.py')], check=True)
        
        # Load the models
        start_time_model = joblib.load(start_time_model_path)
        duration_model = joblib.load(duration_model_path)
        return start_time_model, duration_model
    except Exception as e:
        print(f"Model loading error: {e}")
        return None, None

def predict_start_time(model, focus_rating, day_of_week, duration_sec, past_sessions=None):
    """
    Predict optimal start time using the trained model and past sessions data.

    Args:
        model: The trained ML model
        focus_rating: User's focus rating (1-5)
        day_of_week: Day of the week (0-6)
        duration_sec: Expected duration in seconds
        past_sessions: Optional list of past sessions data

    Returns:
        Predicted optimal start hour (int)
    """
    if model is None:
        return 9  # Default to 9 AM if model is not available

    # Input validation
    if not 1 <= focus_rating <= 5:
        print(f"Invalid focus_rating: {focus_rating}")
        return 9
    if not 0 <= day_of_week <= 6:
        print(f"Invalid day_of_week: {day_of_week}")
        return 9
    if duration_sec <= 0:
        print(f"Invalid duration_sec: {duration_sec}")
        return 9

    try:
        # Log the input parameters
        print(f"predict_start_time - focus_rating: {focus_rating}, day_of_week: {day_of_week}, duration_sec: {duration_sec}, past_sessions: {past_sessions}")

        # Prepare features for prediction
        features = np.array([[focus_rating, day_of_week, duration_sec]])

        # Adjust features based on past sessions
        if past_sessions:
            # Calculate average start time from past sessions
            start_times = [s['start'] for s in past_sessions if 'start' in s]
            if start_times:
                # Convert start times to datetime objects
                start_hours = []
                for t in start_times:
                    try:
                        start_time_obj = datetime.strptime(t, "%I:%M %p")
                        start_hours.append(start_time_obj.hour)
                    except ValueError:
                        print(f"Invalid start time format: {t}")

                if start_hours:
                    avg_start_hour = sum(start_hours) / len(start_hours)
                    # Add average start hour as a feature
                    features = np.append(features, avg_start_hour)

        # Base prediction from model
        predicted_hour = model.predict(features.reshape(1, -1))[0]

        # Log the predicted hour
        print(f"Predicted start hour: {predicted_hour}")

        # Apply day of week adjustments (earlier on weekdays, later on weekends)
        if day_of_week < 5:  # Weekday
            predicted_hour = max(8, predicted_hour)  # Not earlier than 8 AM on weekdays
        else:  # Weekend
            predicted_hour = max(9, predicted_hour)  # Not earlier than 9 AM on weekends

        # Ensure reasonable hours (between 6 AM and 9 PM)
        predicted_hour = max(6, min(21, predicted_hour))

        return int(predicted_hour)
    except Exception as e:
        print(f"Start time prediction error: {e}")
        return 9  # Default to 9 AM on error

def predict_duration(model, focus_rating, day_of_week, start_hour, subject_type=None, past_sessions=None):
    """
    Predict optimal duration using the trained model and past sessions data.

    Args:
        model: The trained ML model
        focus_rating: User's focus rating (1-5)
        day_of_week: Day of the week (0-6)
        start_hour: Hour of the day to start studying
        subject_type: Optional string indicating subject type
        past_sessions: Optional list of past sessions data

    Returns:
        Predicted optimal duration in minutes (int)
    """
    if model is None:
        return 45  # Default to 45 minutes if model is not available

    # Input validation
    if not 1 <= focus_rating <= 5:
        print(f"Invalid focus_rating: {focus_rating}")
        return 45
    if not 0 <= day_of_week <= 6:
        print(f"Invalid day_of_week: {day_of_week}")
        return 45
    if not 0 <= start_hour <= 23:
        print(f"Invalid start_hour: {start_hour}")
        return 45

    try:
        # Log the input parameters
        print(f"predict_duration - focus_rating: {focus_rating}, day_of_week: {day_of_week}, start_hour: {start_hour}, past_sessions: {past_sessions}")

        # Prepare features for prediction
        features = np.array([[focus_rating, day_of_week, start_hour]])

         # Adjust features based on past sessions
        if past_sessions:
            # Calculate average duration from past sessions
            durations = [s['duration'] for s in past_sessions if 'duration' in s]
            if durations:
                avg_duration = sum(durations) / len(durations)
                # Add average duration as a feature
                features = np.append(features, avg_duration)

        # Base prediction from model
        predicted_duration = model.predict(features.reshape(1, -1))[0]

        # Log the predicted duration
        print(f"Predicted duration: {predicted_duration}")
        
        # Subject-specific adjustments
        if subject_type:
            subject_type = subject_type.lower()
            # Adjust duration based on subject type
            if 'math' in subject_type or 'physics' in subject_type:
                # Math/Physics often need more focused time
                predicted_duration *= 1.1
            elif 'language' in subject_type or 'english' in subject_type:
                # Language subjects may benefit from shorter, more frequent sessions
                predicted_duration *= 0.9
            elif 'history' in subject_type or 'reading' in subject_type:
                # Reading-heavy subjects may need longer sessions
                predicted_duration *= 1.2
        
        # Time of day adjustments
        if 8 <= start_hour <= 11:  # Morning
            predicted_duration *= 1.1  # People tend to focus better in the morning
        elif 13 <= start_hour <= 15:  # Early afternoon (post-lunch dip)
            predicted_duration *= 0.9  # Shorter sessions during the afternoon slump
        elif start_hour >= 20:  # Evening
            predicted_duration *= 0.95  # Slightly shorter sessions in the evening
        
        # Ensure reasonable duration (between 20 and 90 minutes)
        predicted_duration = max(20, min(90, predicted_duration))

        return int(predicted_duration)
    except Exception as e:
        print(f"Duration prediction error: {e}")
        return 45  # Default to 45 minutes on error

def generate_dummy_data(num_samples=100):
    """Generate dummy data for ML model training."""
    np.random.seed(42)

    # Generate random features with some correlation
    base_focus = np.random.randint(2, 5, num_samples)  # Base focus level (2-4)
    focus_noise = np.random.normal(0, 1, num_samples)  # Add some noise to focus
    focus_ratings = np.clip(base_focus + focus_noise, 1, 5).astype(int)  # Clip to 1-5
    days_of_week = np.random.randint(0, 7, num_samples)   # 0-6 (Monday-Sunday)
    base_start_hour = np.clip(10 - focus_ratings + days_of_week // 2, 7, 18)  # Earlier on weekdays, influenced by focus
    start_noise = np.random.normal(0, 2, num_samples)
    start_hours = np.clip(base_start_hour + start_noise, 6, 22).astype(int)  # 6 AM - 10 PM
    duration_base = 45 + focus_ratings * 5  # Higher focus -> longer duration
    duration_noise = np.random.normal(0, 10, num_samples)
    durations = np.clip(duration_base + duration_noise, 20, 120).astype(int)  # 15-120 minutes

    # Generate past sessions data with influence from base variables
    past_sessions_list = []
    for i in range(num_samples):
        num_sessions = np.random.randint(1, 4)  # 1-3 past sessions
        past_sessions = []
        for _ in range(num_sessions):
            past_focus_rating = np.clip(base_focus[i] + np.random.normal(0, 0.5), 1, 5).astype(int)
            past_start_hour = np.clip(base_start_hour[i] + np.random.normal(0, 1), 6, 22).astype(int)
            past_duration = np.clip(duration_base[i] + np.random.normal(0, 5), 20, 120).astype(int)
            past_sessions.append({
                "focus_rating": past_focus_rating,
                "start": datetime.now().replace(hour=past_start_hour, minute=0, second=0).strftime("%I:%M %p"),
                "duration": past_duration
            })
        past_sessions_list.append(past_sessions)

    # Create feature matrices for both models
    X_start_time = np.column_stack((focus_ratings, days_of_week, durations))
    X_duration = np.column_stack((focus_ratings, days_of_week, start_hours))

    # Generate target variables with some patterns (using the base variables)
    y_start_time = np.clip(14 - base_focus + days_of_week//2, 7, 20)
    y_duration = np.clip(30 + base_focus * 10 - abs(base_start_hour-14), 20, 90)

    return X_start_time, y_start_time, X_duration, y_duration, past_sessions_list

def generate_study_schedule(subjects, focus_rating, day_of_week, start_hour, available_hours, 
                           preferred_duration, past_sessions, start_time_model, duration_model):
    """
    Generate a comprehensive study schedule for multiple subjects.
    
    Args:
        subjects: List of subjects to study
        focus_rating: User's focus rating (1-5)
        day_of_week: Day of the week (0-6)
        start_hour: Starting hour for the schedule
        available_hours: Total hours available for studying
        preferred_duration: Preferred duration per session in minutes
        past_sessions: List of past study sessions
        start_time_model: ML model for predicting start times
        duration_model: ML model for predicting durations
    
    Returns:
        Dictionary with recommended_schedule and confidence score
    """
    try:
        print(f"Generating schedule for {len(subjects)} subjects")
        
        # Calculate confidence based on available data
        base_confidence = 0.75
        if past_sessions and len(past_sessions) > 5:
            base_confidence = 0.85
        elif past_sessions and len(past_sessions) > 2:
            base_confidence = 0.80
        
        # Adjust confidence based on focus rating
        confidence = min(0.95, base_confidence + (focus_rating - 3) * 0.05)
        
        schedule = []
        current_hour = start_hour
        current_minute = 0
        total_minutes_available = available_hours * 60
        total_minutes_used = 0
        
        # Prioritize subjects based on past performance if available
        subjects_with_priority = []
        for subject in subjects:
            priority_score = focus_rating  # Default priority
            
            # Check past sessions for this subject
            if past_sessions:
                subject_sessions = [s for s in past_sessions if s.get('subject', '').lower() == subject.lower()]
                if subject_sessions:
                    # Lower focus ratings in past sessions = higher priority now
                    avg_past_focus = sum(s.get('focus_rating', 3) for s in subject_sessions) / len(subject_sessions)
                    priority_score = 6 - avg_past_focus  # Invert so lower focus = higher priority
            
            subjects_with_priority.append((subject, priority_score))
        
        # Sort subjects by priority (higher priority first)
        subjects_with_priority.sort(key=lambda x: x[1], reverse=True)
        
        # Generate schedule for each subject
        for idx, (subject, priority) in enumerate(subjects_with_priority):
            # Predict optimal duration for this subject
            predicted_duration = predict_duration(
                duration_model, 
                focus_rating, 
                day_of_week, 
                current_hour,
                subject_type=subject,
                past_sessions=past_sessions
            )
            
            # Ensure duration fits in available time
            remaining_minutes = total_minutes_available - total_minutes_used
            
            # Reserve time for breaks and remaining subjects
            subjects_left = len(subjects_with_priority) - idx
            break_time = (subjects_left - 1) * 10  # 10 min breaks between subjects
            min_time_per_subject = 20  # Minimum 20 minutes per subject
            reserve_time = (subjects_left - 1) * min_time_per_subject + break_time
            
            max_duration = remaining_minutes - reserve_time
            duration = min(predicted_duration, max_duration, 90)  # Cap at 90 minutes
            duration = max(duration, 20)  # Minimum 20 minutes
            
            # Calculate end time
            end_hour = current_hour
            end_minute = current_minute + duration
            
            while end_minute >= 60:
                end_hour += 1
                end_minute -= 60
            
            # Format times
            start_time = datetime.now().replace(hour=current_hour, minute=current_minute).strftime("%I:%M %p")
            end_time = datetime.now().replace(hour=end_hour, minute=end_minute).strftime("%I:%M %p")
            
            # Add subject to schedule
            schedule.append({
                "subject": subject,
                "start": start_time,
                "end": end_time,
                "duration": duration,
                "priority": round(priority, 2)
            })
            
            total_minutes_used += duration
            current_hour = end_hour
            current_minute = end_minute
            
            # Add break after each subject except the last one
            if idx < len(subjects_with_priority) - 1:
                break_duration = 10 if duration >= 45 else 5
                
                # Check if we have time for a break
                if total_minutes_used + break_duration <= total_minutes_available:
                    schedule.append({
                        "break": break_duration
                    })
                    
                    total_minutes_used += break_duration
                    current_minute += break_duration
                    
                    while current_minute >= 60:
                        current_hour += 1
                        current_minute -= 60
                else:
                    # No time for break, end schedule
                    break
        
        return {
            "recommended_schedule": schedule,
            "confidence": round(confidence, 2)
        }
        
    except Exception as e:
        print(f"Error generating study schedule: {e}")
        import traceback
        traceback.print_exc()
        return None