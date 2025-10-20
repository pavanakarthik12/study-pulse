import os
import joblib
import numpy as np
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth

# Load environment variables
load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials."""
    try:
        # Initialize Firebase with project ID from environment variables
        if not firebase_admin._apps:
            firebase_project_id = os.getenv("FIREBASE_PROJECT_ID", "study-pulse-85ca1")
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": firebase_project_id,
                "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL", "")
            })
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully")
        return True
    except Exception as e:
        print(f"Firebase initialization error: {str(e)}")
        # Fall back to mock mode for development
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
        print("Firebase initialized in mock mode")
        return True

def verify_firebase_token(id_token):
    """Verify Firebase ID token and return user ID."""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

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

def predict_start_time(model, focus_rating, day_of_week, duration_sec):
    """Predict optimal start time using the trained model."""
    if model is None:
        return 9  # Default to 9 AM if model is not available
    
    try:
        features = np.array([[focus_rating, day_of_week, duration_sec]])
        predicted_hour = model.predict(features)[0]
        return int(predicted_hour)
    except Exception as e:
        print(f"Start time prediction error: {e}")
        return 9  # Default to 9 AM on error

def predict_duration(model, focus_rating, day_of_week, start_hour):
    """Predict optimal duration using the trained model."""
    if model is None:
        return 45  # Default to 45 minutes if model is not available
    
    try:
        features = np.array([[focus_rating, day_of_week, start_hour]])
        predicted_duration = model.predict(features)[0]
        return int(predicted_duration)
    except Exception as e:
        print(f"Duration prediction error: {e}")
        return 45  # Default to 45 minutes on error

def generate_dummy_data(num_samples=100):
    """Generate dummy data for ML model training."""
    np.random.seed(42)
    
    # Generate random features
    focus_ratings = np.random.randint(1, 6, num_samples)  # 1-5 rating
    days_of_week = np.random.randint(0, 7, num_samples)   # 0-6 (Monday-Sunday)
    start_hours = np.random.randint(6, 22, num_samples)   # 6 AM - 10 PM
    durations = np.random.randint(15, 120, num_samples)   # 15-120 minutes
    
    # Create feature matrices for both models
    X_start_time = np.column_stack((focus_ratings, days_of_week, durations))
    X_duration = np.column_stack((focus_ratings, days_of_week, start_hours))
    
    # Generate target variables with some patterns
    # Higher focus rating → earlier start times for weekdays
    y_start_time = np.clip(14 - focus_ratings + days_of_week//2, 7, 20)
    
    # Higher focus rating → longer durations
    y_duration = np.clip(30 + focus_ratings * 10 - abs(start_hours-14), 20, 90)
    
    return X_start_time, y_start_time, X_duration, y_duration