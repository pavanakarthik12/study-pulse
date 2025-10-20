// src/components/RecommendationCard.jsx 
const RecommendationCard = ({ recommendation, isLoading, error }) => { 
  return ( 
    <div style={{ 
      marginTop: "20px", 
      padding: "15px", 
      background: "rgba(255,255,255,0.1)", 
      borderRadius: "10px" 
    }}> 
      <h4>Recommended Study Time:</h4> 
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && !error && recommendation ? (
        <p>{recommendation}</p>
      ) : (
        !isLoading && !error && <p>No recommendation yet</p>
      )}
    </div> 
  ); 
}; 

// Default props
RecommendationCard.defaultProps = {
  recommendation: null,
  isLoading: false,
  error: null
};

export default RecommendationCard;