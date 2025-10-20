// src/components/Dashboard.jsx 
import { useState, useEffect } from "react"; 
import StudyTimer from "./StudyTimer"; 
import RecommendationCard from "./RecommendationCard"; 

const Dashboard = () => { 
  const [recommendation, setRecommendation] = useState("Loading..."); 

  // Function to fetch ML recommendation from backend 
  const fetchRecommendation = async () => { 
    try { 
      const token = await window.localStorage.getItem("firebaseToken"); // token stored after login 
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/recommendation`, { 
        method: "GET", 
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        } 
      }); 
      const data = await res.json(); 
      setRecommendation(data.recommended_time); 
    } catch (err) { 
      console.error(err); 
      setRecommendation("Error fetching recommendation"); 
    } 
  }; 

  useEffect(() => { 
    fetchRecommendation(); 
  }, []); 

  return ( 
    <div className="dashboard"> 
      <h2>Welcome Back!</h2> 
      <StudyTimer /> 
      <RecommendationCard recommendation={recommendation} /> 
    </div> 
  ); 
}; 

export default Dashboard;