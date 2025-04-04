import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MultiSearchBar from '../components/MultiSearchBar';
import LatestTxSummary from '../components/LatestTxSummary';

const convertMicroAmount = (amountStr) => {
  const match = amountStr.match(/^([\d.]+)([a-zA-Z]+)$/);
  if (match) {
    let value = parseFloat(match[1]);
    const denom = match[2];
    if (denom === "uzig") {
      return { value: value / 1e6, denom: "ZIG" };
    }
    return { value, denom };
  }
  return { value: amountStr, denom: "" };
};

const Transaction = () => {
  const { hash } = useParams();
  const [txData, setTxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const fetchTransactionDetail = async () => {
    try {
      const response = await fetch(`https://testnet-rpc.zigchain.com/tx?hash=0x${hash}&prove=true`);
      const data = await response.json();
      setTxData(data.result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionDetail();
  }, [hash]);

  if (loading) return <div style={styles.loading}>Loading transaction details...</div>;
  if (!txData) return <div style={styles.error}>No transaction data found.</div>;

  // Basic fields
  const txHash = txData.hash || "N/A";
  const blockHeight = txData.height || "N/A";
  const timestamp = "N/A";

  // Extract transfer events for display of sender, receiver, and amount
  let transferEvents = [];
  if (txData.tx_result && txData.tx_result.events) {
    transferEvents = txData.tx_result.events.filter(event => event.type === "transfer");
  }
  let secondSender = "N/A";
  let secondReceiver = "N/A";
  let secondAmountValue = "N/A";
  let secondToken = "N/A";
  if (transferEvents.length >= 2) {
    const secondTransfer = transferEvents[1];
    secondTransfer.attributes.forEach(attr => {
      if (attr.key === "sender") secondSender = attr.value;
      if (attr.key === "recipient") secondReceiver = attr.value;
      if (attr.key === "amount") {
        const { value, denom } = convertMicroAmount(attr.value);
        secondAmountValue = value;
        secondToken = denom;
      }
    });
  }

  // Extract all events for the Events button
  const events = txData.tx_result && txData.tx_result.events ? txData.tx_result.events : [];

  return (
    <div style={styles.container}>
      <Navbar />
      <MultiSearchBar />
      <h2 style={styles.title}>Transaction Details</h2>
      <div style={styles.card}>
        <p><strong>Hash:</strong> {txHash}</p>
        <p><strong>Block Height:</strong> {blockHeight}</p>
        <p><strong>Timestamp:</strong> {timestamp}</p>
        <h3 style={styles.subtitle}>Transfer Details</h3>
        {transferEvents.length >= 2 ? (
          <div style={styles.detailBox}>
            <p><strong>Sender:</strong> {secondSender}</p>
            <p><strong>Receiver:</strong> {secondReceiver}</p>
            <p>
              <strong>Amount:</strong> {secondAmountValue} {secondToken}
            </p>
          </div>
        ) : (
          <p>No second transfer event found.</p>
        )}
        <div style={styles.buttonGroup}>
          <button onClick={() => setShowRaw(!showRaw)} style={styles.toggleButton}>
            {showRaw ? 'Hide Raw JSON' : 'Show Raw JSON'}
          </button>
          <button onClick={() => setShowEvents(!showEvents)} style={styles.toggleButton}>
            {showEvents ? 'Hide Events' : 'Show Events'}
          </button>
        </div>
        {showRaw && (
          <pre style={styles.rawJson}>{JSON.stringify(txData, null, 2)}</pre>
        )}
        {showEvents && (
          <div style={styles.eventsContainer}>
            <h3>Transaction Events</h3>
            {events.length > 0 ? (
              events.map((event, idx) => (
                <div key={idx} style={styles.eventBox}>
                  <h4 style={styles.eventType}>{event.type}</h4>
                  {event.attributes.map((attr, i) => (
                    <p key={i} style={styles.eventAttribute}>
                      <strong>{attr.key}:</strong> {attr.value}
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <p>No events found.</p>
            )}
          </div>
        )}
      </div>
      <LatestTxSummary />
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  title: {
    color: '#2d9cdb'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginTop: '1rem'
  },
  subtitle: {
    marginTop: '1rem',
    color: '#2d9cdb'
  },
  detailBox: {
    marginBottom: '1rem'
  },
  buttonGroup: {
    marginTop: '1rem',
    marginBottom: '1rem'
  },
  toggleButton: {
    backgroundColor: '#2d9cdb',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  },
  rawJson: {
    marginTop: '1rem',
    backgroundColor: '#eef6fc',
    padding: '1rem',
    borderRadius: '4px',
    overflowX: 'auto'
  },
  eventsContainer: {
    marginTop: '1rem',
    backgroundColor: '#f4f4f4',
    padding: '1rem',
    borderRadius: '4px'
  },
  eventBox: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  eventType: {
    color: '#2d9cdb',
    marginBottom: '0.5rem'
  },
  eventAttribute: {
    margin: '0.25rem 0'
  },
  loading: {
    fontFamily: 'Arial, sans-serif',
    padding: '2rem'
  },
  error: {
    fontFamily: 'Arial, sans-serif',
    padding: '2rem',
    color: 'red'
  }
};

export default Transaction;
