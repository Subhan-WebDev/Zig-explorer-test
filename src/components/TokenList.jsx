import React, { useEffect, useState } from 'react';

const TokenList = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      const response = await fetch('https://testnet-api.zigchain.com/zigchain/factory/denom', {
        headers: {
          'accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Token data:', data);
      
      // Use the 'denom' property since the API returns an object with denom and pagination.
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

  if (loading) return <div>Loading tokens...</div>;

  return (
    <div>
      <h2>Available Tokens</h2>
      <ul>
        {tokens.length > 0 ? (
          tokens.map((token, index) => (
            <li key={index}>
              {/* Adjust the display fields according to the actual token object structure */}
              <strong>{token.denom || token.symbol || 'Unknown Token'}</strong>
              {token.description && ` - ${token.description}`}
              {/* For debugging, you can also output the whole token object */}
              <pre>{JSON.stringify(token, null, 2)}</pre>
            </li>
          ))
        ) : (
          <li>No token data available</li>
        )}
      </ul>
    </div>
  );
};

export default TokenList;
