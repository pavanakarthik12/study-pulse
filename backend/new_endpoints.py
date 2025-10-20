"""
New API endpoints for user-specific features.
Add these routes to app.py
"""

# Add to imports at top of app.py
import firebase_utils

# Add after existing routes

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get authenticated user's profile information."""
    user_info = authenticate_request()
    if not user_info:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        profile = firebase_utils.get_user_profile(user_info['uid'])
        # Merge with auth info
        profile['uid'] = user_info['uid']
        profile['name'] = user_info.get('name', profile.get('name', 'User'))
        profile['email'] = user_info.get('email', profile.get('email', ''))
        
        return jsonify(profile), 200
    except Exception as e:
        print(f"Error getting user profile: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/past-sessions', methods=['GET'])
def get_user_past_sessions():
    """Get user's past study sessions."""
    user_info = authenticate_request()
    if not user_info:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        limit = request.args.get('limit', 50, type=int)
        sessions = firebase_utils.get_past_sessions(user_info['uid'], limit=limit)
        
        return jsonify({
            'sessions': sessions,
            'count': len(sessions)
        }), 200
    except Exception as e:
        print(f"Error getting past sessions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/schedules', methods=['GET'])
def get_user_schedules():
    """Get user's predicted schedules."""
    user_info = authenticate_request()
    if not user_info:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        limit = request.args.get('limit', 10, type=int)
        status = request.args.get('status', None)
        
        schedules = firebase_utils.get_predicted_schedules(user_info['uid'], limit=limit, status=status)
        
        return jsonify({
            'schedules': schedules,
            'count': len(schedules)
        }), 200
    except Exception as e:
        print(f"Error getting schedules: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/schedules/<schedule_id>/confirm', methods=['POST'])
def confirm_schedule(schedule_id):
    """Confirm a predicted schedule."""
    user_info = authenticate_request()
    if not user_info:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        success = firebase_utils.update_schedule_status(user_info['uid'], schedule_id, 'confirmed')
        
        if success:
            return jsonify({'message': 'Schedule confirmed', 'schedule_id': schedule_id}), 200
        else:
            return jsonify({'error': 'Failed to confirm schedule'}), 500
    except Exception as e:
        print(f"Error confirming schedule: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/schedules/<schedule_id>/adjust', methods=['POST'])
def adjust_schedule(schedule_id):
    """Adjust a predicted schedule with user feedback."""
    user_info = authenticate_request()
    if not user_info:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        adjustments = data.get('adjustments', {})
        
        success = firebase_utils.update_schedule_status(
            user_info['uid'], 
            schedule_id, 
            'adjusted',
            adjustments=adjustments
        )
        
        if success:
            return jsonify({
                'message': 'Schedule adjusted',
                'schedule_id': schedule_id,
                'adjustments': adjustments
            }), 200
        else:
            return jsonify({'error': 'Failed to adjust schedule'}), 500
    except Exception as e:
        print(f"Error adjusting schedule: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/next-session', methods=['GET'])
def get_next_session():
    """Calculate next recommended high-focus session time."""
    user_info = authenticate_request()
    if not user_info:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        next_session_data = firebase_utils.calculate_next_high_focus_window(user_info['uid'])
        
        return jsonify(next_session_data), 200
    except Exception as e:
        print(f"Error calculating next session: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/notifications', methods=['GET'])
def get_notifications():
    """Get smart notifications for the user."""
    user_info = authenticate_request()
    if not user_info:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        notifications = []
        
        # Get next session info
        next_session = firebase_utils.calculate_next_high_focus_window(user_info['uid'])
        next_time = datetime.fromisoformat(next_session['next_session_time'])
        time_until = (next_time - datetime.now()).total_seconds() / 60  # minutes
        
        # Session reminder (15 minutes before)
        if 0 < time_until <= 15:
            notifications.append({
                'type': 'session_reminder',
                'title': 'Study Session Starting Soon!',
                'message': f"Your optimal study time starts in {int(time_until)} minutes!",
                'priority': 'high',
                'timestamp': datetime.now().isoformat()
            })
        
        # Get recent sessions to check for breaks
        past_sessions = firebase_utils.get_past_sessions(user_info['uid'], limit=1)
        if past_sessions:
            last_session = past_sessions[0]
            if 'end_time' in last_session:
                end_time = datetime.fromisoformat(last_session['end_time'])
                minutes_since_end = (datetime.now() - end_time).total_seconds() / 60
                
                # Hydration reminder every 30 mins
                if minutes_since_end > 30 and minutes_since_end < 35:
                    notifications.append({
                        'type': 'hydration',
                        'title': 'Stay Hydrated!',
                        'message': 'Don\'t forget to drink water! 💧',
                        'priority': 'medium',
                        'timestamp': datetime.now().isoformat()
                    })
        
        # Achievement notifications
        completed_schedules = firebase_utils.get_predicted_schedules(user_info['uid'], limit=1, status='completed')
        if completed_schedules:
            last_completed = completed_schedules[0]
            completed_time = datetime.fromisoformat(last_completed['timestamp'])
            if (datetime.now() - completed_time).total_seconds() < 300:  # Within 5 minutes
                notifications.append({
                    'type': 'achievement',
                    'title': 'Great Job!',
                    'message': 'You completed today\'s study plan! 🎉',
                    'priority': 'low',
                    'timestamp': datetime.now().isoformat()
                })
        
        return jsonify({
            'notifications': notifications,
            'count': len(notifications)
        }), 200
    except Exception as e:
        print(f"Error getting notifications: {e}")
        return jsonify({'error': str(e)}), 500
