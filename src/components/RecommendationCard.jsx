// src/components/RecommendationCard.jsx 
const RecommendationCard = ({ recommendation }) => { 
  return ( 
    <div style={{ 
      marginTop: "20px", 
      padding: "15px", 
      background: "rgba(255,255,255,0.1)", 
      borderRadius: "10px" 
    }}> 
      <h4>Recommended Study Time:</h4> 
      <p>{recommendation}</p> 
    </div> 
  ); 
}; 

export default RecommendationCard;