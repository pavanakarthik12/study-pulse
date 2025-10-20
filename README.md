# Study Pulse

Study Pulse is an AI-powered study session tracker that provides personalized recommendations for optimal study times based on your past study patterns.

## Features

- **User Authentication**: Secure login and signup with Firebase
- **Study Timer**: Track your study sessions with a simple timer
- **AI Recommendations**: Get personalized recommendations for optimal study times
- **Dashboard**: View your study statistics and recommendations

## Project Structure

```
study-pulse/
├── backend/           # Flask backend with ML models
└── src/               # React frontend
    ├── components/    # React components
    ├── firebase/      # Firebase configuration
    ├── App.jsx        # Main application component
    └── index.js       # Entry point
```

## Setup Instructions

### Prerequisites

- Node.js and npm
- Firebase account
- Python 3.7+ (for backend)

### Frontend Setup

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```
5. Start the development server:
   ```
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```
   python app.py
   ```

## Connecting Frontend to Backend

The frontend communicates with the backend through the following API endpoints:

- `POST /api/start-session`: Record the start of a study session
- `POST /api/end-session`: Record the end of a study session
- `GET /api/recommendation`: Get personalized study time recommendations

Authentication is handled through Firebase, and the Firebase ID token is sent in the Authorization header for all API requests.

## Future Enhancements

- Subject-specific recommendations
- Study streak tracking
- Social features for study groups
- Mobile app version