import React from 'react';

const RecommendationCard = ({ recommendations, isLoading }) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="recommendation-card loading">
        <h4>Study Plan</h4>
        <div className="recommendation-details">
          <p>Loading personalized study plan...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!recommendations || !recommendations.recommended_schedule || recommendations.recommended_schedule.length === 0) {
    return (
      <div className="recommendation-card empty">
        <h4>Study Plan</h4>
        <div className="recommendation-details">
          <p>Select your subjects and preferences to get a personalized study plan.</p>
          <p>Start a study session to improve future recommendations.</p>
        </div>
      </div>
    );
  }

  // Get emoji for each subject
  const getSubjectEmoji = (subject) => {
    const emojiMap = {
      'Math': '📐',
      'Physics': '⚛️',
      'Chemistry': '🧪',
      'Biology': '🧬',
      'History': '📜',
      'English': '📚',
      'Programming': '💻',
      'Economics': '📊',
      'Psychology': '🧠',
      'Philosophy': '🤔',
      'Art': '🎨',
      'Music': '🎵',
      'Other': '📝'
    };
    return emojiMap[subject] || '📝';
  };

  return (
    <div className="recommendation-card">
      <h4>Personalized Study Plan</h4>
      
      {recommendations.confidence < 0.7 && (
        <div className="confidence-warning">
          <p>⚠️ Schedule may need adjustment — keep tracking progress!</p>
        </div>
      )}
      
      <div className="recommendation-details">
        <ul className="schedule-list">
          {recommendations.recommended_schedule.map((item, index) => {
            if (item.subject) {
              return (
                <li key={index} className="subject-item">
                  {getSubjectEmoji(item.subject)} <strong>{item.subject}</strong> — {item.start} to {item.end}
                </li>
              );
            } else if (item.break) {
              return (
                <li key={index} className="break-item">
                  ☕ <strong>Break</strong> — {item.break} mins
                </li>
              );
            }
            return null;
          })}
        </ul>
        
        {recommendations.confidence && (
          <div className="confidence-score">
            <p><strong>Confidence Score:</strong> {Math.round(recommendations.confidence * 100)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;