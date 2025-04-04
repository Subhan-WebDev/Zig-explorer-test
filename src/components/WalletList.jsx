import React, { useEffect, useState } from 'react';

const WalletList = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    try {
      const response = await fetch("https://testnet-api.zigchain.com/cosmos/auth/v1beta1/accounts", {
        headers: {
          'accept': 'application/json'
        }
      });
      const data = await response.json();
      
      // Adjust this based on the actual API response structure.
      // For Cosmos SDK, the accounts might be in data.accounts.
      const accounts = data.accounts || [];
      setWallets(accounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  if (loading) return <div>Loading wallets...</div>;

  return (
    <div>
      <h2>Wallets</h2>
      <ul>
        {wallets.length > 0 ? (
          wallets.map((wallet, index) => (
            <li key={index}>
              <strong>Address:</strong> {wallet.address || 'N/A'}
              {/* You can add more fields here, such as account number, sequence, etc. */}
            </li>
          ))
        ) : (
          <li>No wallet data available</li>
        )}
      </ul>
    </div>
  );
};

export default WalletList;
