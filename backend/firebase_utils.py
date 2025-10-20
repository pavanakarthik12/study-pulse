"""
Firebase Firestore utility functions for Study Pulse.
Handles user data storage, past sessions, and predicted schedules.
"""

from datetime import datetime, timedelta
from firebase_admin import firestore

# Firestore client will be initialized by main app
db = None

def set_firestore_client(client):
    """Set the Firestore client instance."""
    global db
    db = client

def store_past_session(user_id, session_data):
    """
    Store a completed study session in Firebase Firestore.
    
    Args:
        user_id: User's Firebase UID
        session_data: Dictionary containing session details
    """
    try:
        if db is None:
            print("Firestore not initialized, skipping session storage")
            return False
        
        # Add timestamp if not present
        if 'timestamp' not in session_data:
            session_data['timestamp'] = datetime.now().isoformat()
        
        # Store in users/{user_id}/past_sessions collection
        db.collection('users').document(user_id).collection('past_sessions').add(session_data)
        print(f"Stored past session for user {user_id}")
        return True
    except Exception as e:
        print(f"Error storing past session: {e}")
        return False

def get_past_sessions(user_id, limit=50):
    """
    Retrieve past study sessions for a user from Firebase Firestore.
    
    Args:
        user_id: User's Firebase UID
        limit: Maximum number of sessions to retrieve
        
    Returns:
        List of session dictionaries
    """
    try:
        if db is None:
            print("Firestore not initialized, returning empty sessions")
            return []
        
        # Query past sessions ordered by timestamp
        sessions_ref = db.collection('users').document(user_id).collection('past_sessions')
        sessions = sessions_ref.order_by('timestamp', direction='DESCENDING').limit(limit).stream()
        
        result = []
        for session in sessions:
            session_data = session.to_dict()
            session_data['id'] = session.id
            result.append(session_data)
        
        print(f"Retrieved {len(result)} past sessions for user {user_id}")
        return result
    except Exception as e:
        print(f"Error retrieving past sessions: {e}")
        return []

def store_predicted_schedule(user_id, schedule_data):
    """
    Store a predicted schedule in Firebase Firestore.
    
    Args:
        user_id: User's Firebase UID
        schedule_data: Dictionary containing schedule details
    """
    try:
        if db is None:
            print("Firestore not initialized, skipping schedule storage")
            return False
        
        # Add timestamp and status
        schedule_data['timestamp'] = datetime.now().isoformat()
        schedule_data['status'] = 'pending'  # pending, confirmed, adjusted, completed
        
        # Store in users/{user_id}/predicted_schedules collection
        doc_ref = db.collection('users').document(user_id).collection('predicted_schedules').add(schedule_data)
        print(f"Stored predicted schedule for user {user_id}")
        return doc_ref[1].id  # Return document ID
    except Exception as e:
        print(f"Error storing predicted schedule: {e}")
        return None

def get_predicted_schedules(user_id, limit=10, status=None):
    """
    Retrieve predicted schedules for a user from Firebase Firestore.
    
    Args:
        user_id: User's Firebase UID
        limit: Maximum number of schedules to retrieve
        status: Filter by status (pending, confirmed, adjusted, completed)
        
    Returns:
        List of schedule dictionaries
    """
    try:
        if db is None:
            print("Firestore not initialized, returning empty schedules")
            return []
        
        # Query predicted schedules
        schedules_ref = db.collection('users').document(user_id).collection('predicted_schedules')
        
        if status:
            schedules = schedules_ref.where('status', '==', status).order_by('timestamp', direction='DESCENDING').limit(limit).stream()
        else:
            schedules = schedules_ref.order_by('timestamp', direction='DESCENDING').limit(limit).stream()
        
        result = []
        for schedule in schedules:
            schedule_data = schedule.to_dict()
            schedule_data['id'] = schedule.id
            result.append(schedule_data)
        
        print(f"Retrieved {len(result)} predicted schedules for user {user_id}")
        return result
    except Exception as e:
        print(f"Error retrieving predicted schedules: {e}")
        return []

def update_schedule_status(user_id, schedule_id, status, adjustments=None):
    """
    Update the status of a predicted schedule.
    
    Args:
        user_id: User's Firebase UID
        schedule_id: Document ID of the schedule
        status: New status (confirmed, adjusted, completed)
        adjustments: Optional dictionary of adjustments made by user
    """
    try:
        if db is None:
            print("Firestore not initialized, skipping status update")
            return False
        
        update_data = {
            'status': status,
            'updated_at': datetime.now().isoformat()
        }
        
        if adjustments:
            update_data['adjustments'] = adjustments
        
        # Update document
        db.collection('users').document(user_id).collection('predicted_schedules').document(schedule_id).update(update_data)
        print(f"Updated schedule {schedule_id} status to {status}")
        return True
    except Exception as e:
        print(f"Error updating schedule status: {e}")
        return False

def get_user_profile(user_id):
    """
    Get user profile data from Firestore.
    
    Args:
        user_id: User's Firebase UID
        
    Returns:
        Dictionary with user profile data
    """
    try:
        if db is None:
            print("Firestore not initialized, returning default profile")
            return {'name': 'User', 'email': 'user@example.com'}
        
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            return user_doc.to_dict()
        else:
            return {'name': 'User', 'email': 'user@example.com'}
    except Exception as e:
        print(f"Error retrieving user profile: {e}")
        return {'name': 'User', 'email': 'user@example.com'}

def update_user_profile(user_id, profile_data):
    """
    Update user profile data in Firestore.
    
    Args:
        user_id: User's Firebase UID
        profile_data: Dictionary with profile data to update
    """
    try:
        if db is None:
            print("Firestore not initialized, skipping profile update")
            return False
        
        profile_data['updated_at'] = datetime.now().isoformat()
        db.collection('users').document(user_id).set(profile_data, merge=True)
        print(f"Updated profile for user {user_id}")
        return True
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return False

def calculate_next_high_focus_window(user_id):
    """
    Calculate the next predicted high-focus time window based on past sessions.
    
    Args:
        user_id: User's Firebase UID
        
    Returns:
        Dictionary with next_session_time and focus_score
    """
    try:
        past_sessions = get_past_sessions(user_id, limit=20)
        
        if len(past_sessions) < 3:
            # Not enough data, return default
            next_hour = (datetime.now() + timedelta(hours=1)).replace(minute=0, second=0)
            return {
                'next_session_time': next_hour.isoformat(),
                'focus_score': 0.7,
                'confidence': 'low'
            }
        
        # Analyze past sessions to find patterns
        hour_focus = {}
        for session in past_sessions:
            if 'start_time' in session and 'focus_rating' in session:
                try:
                    start_time = datetime.fromisoformat(session['start_time'])
                    hour = start_time.hour
                    focus = session['focus_rating']
                    
                    if hour not in hour_focus:
                        hour_focus[hour] = []
                    hour_focus[hour].append(focus)
                except:
                    continue
        
        # Calculate average focus for each hour
        hour_avg_focus = {hour: sum(scores) / len(scores) for hour, scores in hour_focus.items()}
        
        # Find next high-focus hour
        current_hour = datetime.now().hour
        best_hour = None
        best_focus = 0
        
        for i in range(1, 13):  # Look ahead 12 hours
            check_hour = (current_hour + i) % 24
            if check_hour in hour_avg_focus and hour_avg_focus[check_hour] > best_focus:
                best_hour = check_hour
                best_focus = hour_avg_focus[check_hour]
        
        if best_hour is None:
            # Default to next hour
            best_hour = (current_hour + 1) % 24
            best_focus = 0.7
        
        next_time = datetime.now().replace(hour=best_hour, minute=0, second=0, microsecond=0)
        if next_time <= datetime.now():
            next_time += timedelta(days=1)
        
        confidence = 'high' if len(past_sessions) >= 10 else 'medium' if len(past_sessions) >= 5 else 'low'
        
        return {
            'next_session_time': next_time.isoformat(),
            'focus_score': min(best_focus / 5, 1.0),  # Normalize to 0-1
            'confidence': confidence
        }
    except Exception as e:
        print(f"Error calculating next high-focus window: {e}")
        next_hour = (datetime.now() + timedelta(hours=1)).replace(minute=0, second=0)
        return {
            'next_session_time': next_hour.isoformat(),
            'focus_score': 0.7,
            'confidence': 'low'
        }
