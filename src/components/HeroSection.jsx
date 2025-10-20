import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Study Pulse</h1>
        <p>Track and optimize your study sessions for maximum productivity</p>
        <div className="hero-btns">
          <Link to="/signup" className="cta-button primary">Get Started</Link>
          <Link to="/login" className="cta-button secondary">Login</Link>
        </div>
        <div className="hero-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Track Progress</h3>
            <p>Monitor your study habits and see improvements over time</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⏱️</span>
            <h3>Optimize Time</h3>
            <p>Find your most productive study times and durations</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <h3>Achieve Goals</h3>
            <p>Set targets and watch yourself reach them faster</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;