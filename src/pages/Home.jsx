// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MultiSearchBar from '../components/MultiSearchBar';
import LatestTxSummary from '../components/LatestTxSummary';
import BlockSummary from '../components/BlockSummary';
import TokenSummary from '../components/TokenSummary';
import LoadingIndicator from '../components/LoadingIndicator';


const Home = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Simulate API loading delay (3 seconds)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return loading ? (
    <LoadingIndicator />
  ) : (
    <div style={{  fontFamily: 'Arial, sans-serif', backgroundImage: "radial-gradient(circle, #320cf3, #2769d8, #1de1e2)", padding: "1rem" }}>
      <Navbar />
      <MultiSearchBar />
      <div style={{ display: 'grid', gridTemplateRows: 'auto auto', gap: '1rem', background: 'transparent' }}>
        <div>
          <LatestTxSummary />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <BlockSummary />
          <TokenSummary />
        </div>
      </div>
    </div>
  );
};

export default Home;
