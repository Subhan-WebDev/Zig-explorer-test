import React from 'react';
import logo from '../assets/images.png'; // adjust path if needed
import './LoadingIndicator.css'; // include the CSS file

const LoadingIndicator = () => {
  return (
    <div className="loading-container">
      <img src={logo} alt="Zigchians Logo" className="loading-logo" />
      <div className="loading-bar">
        <div className="loading-bar-progress"></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
