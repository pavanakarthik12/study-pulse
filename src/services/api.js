import { auth } from '../firebase/config';

const API_BASE_URL = 'http://localhost:5000';

// Helper function to get the current user's token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    // Redirect to login if no user is found
    console.error('No authenticated user found. Please log in to continue.');
    // Add a small delay before redirecting to allow error logging
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
    throw new Error('User not authenticated');
  }
  
  try {
    // Force token refresh to ensure we have the latest token
    const token = await user.getIdToken(true);
    console.log('Successfully retrieved auth token');
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    // Add more detailed error information
    const errorMessage = error.message || 'Authentication failed';
    console.error(`Token error details: ${errorMessage}`);
    
    // Redirect to login on token error
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
    throw new Error('Authentication failed. Please log in again.');
  }
};

// Helper to make authenticated API requests
const fetchWithAuth = async (endpoint, options = {}, retryCount = 0) => {
  try {
    const token = await getAuthToken();
    
    console.log(`Making authenticated request to ${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh once
        if (retryCount === 0) {
          console.log('Authentication failed, attempting to refresh token and retry...');
          // Force a token refresh and retry the request
          await auth.currentUser?.getIdToken(true);
          return fetchWithAuth(endpoint, options, retryCount + 1);
        }
        
        // If we've already retried, redirect to login
        console.error('Authentication failed after token refresh');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
        throw new Error('Authentication failed. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error(`API error (${response.status}):`, errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Request to ${endpoint} successful`);
    return data;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};

// Study session API calls
export const startStudySession = async (subject) => {
  return fetchWithAuth('/sessions/start', {
    method: 'POST',
    body: JSON.stringify({
      subject,
      day_of_week: new Date().getDay()
    }),
  });
};

export const endStudySession = async (sessionId, focusRating) => {
  return fetchWithAuth('/sessions/end', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      focus_rating: focusRating
    }),
  });
};

// ML prediction API call
export const getStudyRecommendations = async (preferences) => {
  // Format data to match backend expectations
  const requestData = {
    subjects: preferences.subjects || ['Math'],
    focus_level: preferences.focus_level || preferences.focusLevel / 10 || 0.8,
    available_time: preferences.available_time || `${preferences.availableTimeStart || '09:00'} - ${preferences.availableTimeEnd || '18:00'}`,
    preferred_duration: preferences.preferred_duration || preferences.preferredDuration || 45,
    past_sessions: preferences.past_sessions || preferences.pastSessions || []
  };
  
  console.log('Sending study recommendation request:', requestData);
  
  return fetchWithAuth('/predict_schedule', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
};

// Create a named API object to fix ESLint warning
const apiService = {
  startStudySession,
  endStudySession,
  getStudyRecommendations
};

export default apiService;