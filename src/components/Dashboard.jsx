// src/components/Dashboard.jsx 
import { useState, useEffect } from "react"; 
import StudyTimer from "./StudyTimer"; 
import RecommendationCard from "./RecommendationCard"; 
import { auth } from "../firebase/config";

const Dashboard = () => { 
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");

  // Function to fetch ML recommendation from backend 
  const fetchRecommendation = async () => { 
    setIsLoading(true);
    setError(null);
    
    try { 
      // Get current user token
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const token = await user.getIdToken();
      // Store token in localStorage for other components
      localStorage.setItem("firebaseToken", token);
      
      // Set backend URL with fallback
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      
      const res = await fetch(`${backendUrl}/api/recommendation`, { 
        method: "GET", 
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        } 
      }); 
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const data = await res.json(); 
      setRecommendation(data.recommended_time);
      setIsLoading(false);
    } catch (err) { 
      console.error("Error fetching recommendation:", err); 
      setError(err.message || "Failed to fetch recommendation");
      setIsLoading(false);
    } 
  }; 

  useEffect(() => { 
    // Set user name from Firebase
    if (auth.currentUser) {
      setUserName(auth.currentUser.email?.split('@')[0] || "User");
    }
    
    // Fetch recommendation on component mount
    fetchRecommendation(); 
    
    // Set up interval to refresh recommendation every 30 minutes
    const intervalId = setInterval(fetchRecommendation, 30 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []); 

  return ( 
    <div className="dashboard"> 
      <h2>Welcome Back, {userName}!</h2> 
      <StudyTimer onSessionEnd={fetchRecommendation} /> 
      <RecommendationCard 
        recommendation={recommendation} 
        isLoading={isLoading}
        error={error}
      /> 
    </div> 
  ); 
}; 

export default Dashboard;