// src/components/MultiSearchBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MultiSearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // If input is all digits, assume block number.
    if (/^\d+$/.test(trimmedQuery)) {
      navigate(`/block/${trimmedQuery}`);
    }
    // If input starts with "zig" (wallet address prefix).
    else if (trimmedQuery.toLowerCase().startsWith('zig')) {
      navigate(`/wallet/${trimmedQuery}`);
    }
    // Otherwise, assume it's a transaction hash.
    else {
      navigate(`/transaction/${trimmedQuery}`);
    }
  };

  return (
    <div style={searchBarStyle}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter block number, tx hash, or wallet address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Search
        </button>
      </form>
    </div>
  );
};

const searchBarStyle = {
  margin: '1rem 0',
  textAlign: 'center'
};

const inputStyle = {
  padding: '0.5rem',
  width: '300px',
  marginRight: '0.5rem'
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#2d9cdb',
  color: 'white',
  border: 'none',
  cursor: 'pointer'
};

export default MultiSearchBar;
