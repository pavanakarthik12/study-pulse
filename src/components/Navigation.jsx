import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

const Navigation = () => {
  const [user] = useAuthState(auth);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Study Pulse
        </Link>
        <div className="nav-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button onClick={() => auth.signOut()} className="nav-link btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;