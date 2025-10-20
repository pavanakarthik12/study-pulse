// src/components/Dashboard.jsx 
import { useState, useEffect } from "react"; 
import StudyTimer from "./StudyTimer"; 
import RecommendationCard from "./RecommendationCard"; 
import { auth } from "../firebase/config";

const Dashboard = () => { 
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("User");
  const [lastUpdated, setLastUpdated] = useState(null);

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
      
      const token = await user.getIdToken(true); // Force refresh token
      // Store token in localStorage for other components
      localStorage.setItem("firebaseToken", token);
      
      // Set backend URL with fallback
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      
      console.log("Fetching recommendation from:", `${backendUrl}/api/recommendation`);
      
      const res = await fetch(`${backendUrl}/api/recommendation`, { 
        method: "GET", 
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        cache: "no-cache" // Prevent caching
      }); 
      
      const data = await res.json(); 
      
      if (!res.ok) {
        throw new Error(data.error || `Server responded with status: ${res.status}`);
      }
      
      console.log("Recommendation data:", data);
      
      if (data.error) {
        // Handle server-side error but with fallback recommendation
        console.warn("Server reported error but provided fallback:", data.error);
        setError(data.message || "Server reported an issue with recommendation");
      }
      
      // Always set recommendation if available (even with error, we might have a fallback)
      if (data.recommended_time) {
        setRecommendation(data.recommended_time);
        setLastUpdated(new Date().toLocaleTimeString());
      }
      
      setIsLoading(false);
    } catch (err) { 
      console.error("Error fetching recommendation:", err); 
      setError(err.message || "Failed to fetch recommendation");
      setIsLoading(false);
    } 
  }; 

  // Update user info when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || user.email?.split('@')[0] || "User");
        fetchRecommendation();
      } else {
        setUserName("User");
        setRecommendation(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Set up recommendation refresh interval
  useEffect(() => { 
    // Fetch recommendation immediately if user is logged in
    if (auth.currentUser && !recommendation) {
      fetchRecommendation();
    }
    
    // Set up interval to refresh recommendation every 15 minutes
    const intervalId = setInterval(fetchRecommendation, 15 * 60 * 1000);
    
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
      {lastUpdated && (
        <p style={{ fontSize: "0.8rem", color: "#aaa", textAlign: "right", marginTop: "5px" }}>
          Last updated: {lastUpdated}
        </p>
      )}
    </div> 
  ); 
}; 

export default Dashboard;