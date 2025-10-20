// src/components/HeroSection.jsx
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Study Pulse</h1>
        <p>Optimize your study sessions with AI-powered recommendations</p>
        <Link to="/signup" className="cta-button">Get Started</Link>
      </div>
    </div>
  );
};

export default HeroSection;