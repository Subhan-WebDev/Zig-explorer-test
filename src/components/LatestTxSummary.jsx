// src/components/LatestTxSummary.jsx
import React, { useEffect, useState } from 'react';
import LoadingIndicator from './LoadingIndicator';

const LatestTxSummary = () => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const POLL_INTERVAL = 10000;

  const fetchTxs = async () => {
    try {
      const txSearchUrl =
        'https://testnet-rpc.zigchain.com/tx_search?query=%22tx.height%3E0%22&prove=true&page=1&per_page=10&order_by=%22desc%22';
      const response = await fetch(txSearchUrl);
      const data = await response.json();
      if (data.result && data.result.txs) {
        setTxs(data.result.txs);
      } else {
        setTxs([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTxs([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
    const interval = setInterval(fetchTxs, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) return  <LoadingIndicator />;

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

  // Helper functions
  const convertMicroAmount = (amountStr) => {
    const match = amountStr.match(/^([\d.]+)([a-zA-Z]+)$/);
    if (match) {
      let value = parseFloat(match[1]);
      const denom = match[2];
      if (denom === 'uzig') {
        return { value: value / 1e6, denom: 'ZIG' };
      }
      return { value, denom };
    }
    return { value: amountStr, denom: '' };
  };

  const extractTxDetails = (tx) => {
    let sender = 'N/A',
      receiver = 'N/A',
      amountStr = 'N/A';
    if (tx.tx_result && tx.tx_result.events) {
      const transferEvents = tx.tx_result.events.filter(event => event.type === 'transfer');
      if (transferEvents.length >= 2) {
        const secondTransfer = transferEvents[1];
        secondTransfer.attributes.forEach(attr => {
          if (attr.key === 'sender') sender = attr.value;
          if (attr.key === 'recipient') receiver = attr.value;
          if (attr.key === 'amount') {
            const { value, denom } = convertMicroAmount(attr.value);
            amountStr = `${value} ${denom}`;
          }
        });
      } else if (transferEvents.length === 1) {
        transferEvents[0].attributes.forEach(attr => {
          if (attr.key === 'sender') sender = attr.value;
          if (attr.key === 'recipient') receiver = attr.value;
          if (attr.key === 'amount') {
            const { value, denom } = convertMicroAmount(attr.value);
            amountStr = `${value} ${denom}`;
          }
        });
      }
    }
    return { sender, receiver, amount: amountStr };
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2d9cdb' }}>Latest Transactions</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Tx Hash</th>
            <th style={thStyle}>Block Height</th>
            <th style={thStyle}>Sender</th>
            <th style={thStyle}>Receiver</th>
            <th style={thStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {txs.map((tx, index) => {
            const details = extractTxDetails(tx);
            return (
              <tr key={index}>
                <td style={tdStyle}>
                  <a style={{ color: '#2d9cdb' }} href={`/transaction/${tx.hash}`}>
                    {tx.hash.substring(0, 10)}...
                  </a>
                </td>
                <td style={tdStyle}>{tx.height}</td>
                <td style={tdStyle}>{details.sender.substring(0, 10)}...</td>
                <td style={tdStyle}>{details.receiver.substring(0, 10)}...</td>
                <td style={tdStyle}>{details.amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LatestTxSummary;
