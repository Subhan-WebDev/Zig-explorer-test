import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// mode prop: "block" for block search or "tx" for transaction search
const TransactionSearch = ({ mode = 'block' }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'block') {
      // Navigate to block detail page if mode is block
      navigate(`/block/${query}`);
    } else if (mode === 'tx') {
      // Navigate to transaction detail page if mode is tx
      navigate(`/transaction/${query}`);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2>Search</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={mode === 'block' ? "Enter block number" : "Enter transaction hash"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button type="submit" style={{ padding: '0.5rem', marginLeft: '0.5rem' }}>
          Search
        </button>
      </form>
    </div>
  );
};

export default TransactionSearch;
