// src/components/TokenSummary.jsx
import React, { useEffect, useState } from 'react';
import LoadingIndicator from './LoadingIndicator';

const TokenSummary = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      const response = await fetch('https://testnet-api.zigchain.com/zigchain/factory/denom', {
        headers: {
          accept: 'application/json'
        }
      });
      const data = await response.json();
      const tokensData = data.denom || [];
      setTokens(tokensData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  if (loading) return <LoadingIndicator/>;

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };
  const thStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#2d9cdb',
    color: 'white'
  };
  const tdStyle = {
    border: '1px solid #ccc',
    padding: '8px'
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2d9cdb' }}>Available Tokens</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Token</th>
            <th style={thStyle}>Max Supply</th>
            <th style={thStyle}>Creator</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, index) => (
            <tr key={index}>
              <td style={tdStyle}>{token.denom || token.symbol || 'Unknown'}</td>
              <td style={tdStyle}>{token.maxSupply || 'N/A'}</td>
              <td style={tdStyle}>{token.creator || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenSummary;
