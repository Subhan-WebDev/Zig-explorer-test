// src/pages/Transaction.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MultiSearchBar from '../components/MultiSearchBar';
import LoadingIndicator from '../components/LoadingIndicator';

const convertMicroAmount = (amountStr) => {
  const m = amountStr.match(/^([\d.]+)([a-zA-Z]+)$/);
  if (!m) return { value: amountStr, denom: '' };
  let [ , num, denom ] = m;
  let value = parseFloat(num);
  if (denom === 'uzig') return { value: value / 1e6, denom: 'ZIG' };
  return { value, denom };
};

const extractTransfer = (events) => {
  const transfers = events.filter(e => e.type === 'transfer');
  if (!transfers.length) return null;
  const ev = transfers.length >= 2 ? transfers[1] : transfers[0];
  const out = { sender: 'N/A', receiver: 'N/A', amount: 'N/A' };
  ev.attributes.forEach(({ key, value }) => {
    if (key === 'sender') out.sender = value;
    if (key === 'recipient') out.receiver = value;
    if (key === 'amount') {
      const { value: v, denom } = convertMicroAmount(value);
      out.amount = `${v} ${denom}`;
    }
  });
  return out;
};

const extractTxDetails = (tx) => {
  const t = extractTransfer(tx.tx_result?.events || []);
  return t || { sender: 'N/A', receiver: 'N/A', amount: 'N/A' };
};

const Transaction = () => {
  const { hash } = useParams();

  // Main tx data
  const [txData, setTxData] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI toggles
  const [showRaw, setShowRaw] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  // Extracted transfer
  const [transfer, setTransfer] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Sender & Receiver tx lists
  const [txsSender, setTxsSender] = useState([]);
  const [txsReceiver, setTxsReceiver] = useState([]);
  const [loadingSender, setLoadingSender] = useState(false);
  const [loadingReceiver, setLoadingReceiver] = useState(false);

  // 1️⃣ Fetch the main transaction
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`https://rpc.zigscan.net//tx?hash=0x${hash}&prove=true`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setTxData(data.result);
          setTransfer(extractTransfer(data.result.tx_result?.events || []));
        }
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [hash]);

  // 2️⃣ Fetch sender's last txs
  useEffect(() => {
    if (!transfer?.sender) return;
    setLoadingSender(true);
    const querySender = `"transfer.sender='${transfer.sender}'"`;
    const urlSender = 
      `https://rpc.zigscan.net/tx_search?query=${encodeURIComponent(querySender)}` +
      `&prove=true&page=1&per_page=10&order_by=%22desc%22`;
    fetch(urlSender)
      .then(r => r.json())
      .then(data => setTxsSender(data.result?.txs || []))
      .catch(console.error)
      .finally(() => setLoadingSender(false));
  }, [transfer, page, perPage]);

  // 3️⃣ Fetch receiver's last txs
  useEffect(() => {
    if (!transfer?.receiver) return;
    setLoadingReceiver(true);
    const queryRecipient = `"transfer.recipient='${transfer.receiver}'"`;
    const urlRecipient = 
      `https://rpc.zigscan.net/tx_search?query=${encodeURIComponent(queryRecipient)}` +
      `&prove=true&page=1&per_page=10&order_by=%22desc%22`;
    fetch(urlRecipient)
      .then(r => r.json())
      .then(data => setTxsReceiver(data.result?.txs || []))
      .catch(console.error)
      .finally(() => setLoadingReceiver(false));
  }, [transfer, page, perPage]);

  if (loading) return <LoadingIndicator />;
  if (!txData) return <div style={styles.error}>No transaction data found.</div>;

  const events = txData.tx_result?.events || [];

  return (
    <div style={styles.container}>
      <Navbar />
      <MultiSearchBar />

      <h2 style={styles.title}>Transaction Details</h2>
      <div style={styles.card}>
        <p><strong>Hash:</strong> {txData.hash}</p>
        <p><strong>Block Height:</strong> {txData.height}</p>

        <h3 style={styles.subtitle}>Transfer Details</h3>
        {transfer ? (
          <div style={styles.detailBox}>
            <p><strong>Sender:</strong> {transfer.sender}</p>
            <p><strong>Receiver:</strong> {transfer.receiver}</p>
            <p><strong>Amount:</strong> {transfer.amount}</p>
          </div>
        ) : (
          <p>No transfer event found.</p>
        )}

        <div style={styles.buttonGroup}>
          <button onClick={() => setShowRaw(r => !r)}   style={styles.toggleButton}>
            {showRaw ? 'Hide Raw JSON' : 'Show Raw JSON'}
          </button>
          <button onClick={() => setShowEvents(e => !e)} style={styles.toggleButton}>
            {showEvents ? 'Hide Events' : 'Show Events'}
          </button>
        </div>

        {showRaw && (
          <pre style={styles.rawJson}>{JSON.stringify(txData, null, 2)}</pre>
        )}
        {showEvents && (
          <div style={styles.eventsContainer}>
            <h3>Transaction Events</h3>
            {events.map((ev, i) => (
              <div key={i} style={styles.eventBox}>
                <h4 style={styles.eventType}>{ev.type}</h4>
                {ev.attributes.map((a, j) => (
                  <p key={j} style={styles.eventAttribute}>
                    <strong>{a.key}:</strong> {a.value}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sender Table */}
      <h3 style={styles.subtitle}>Last {perPage} Transactions by Sender</h3>
      {loadingSender ? (
        <div>Loading sender’s transactions…</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Hash</th>
              <th style={styles.th}>Sender</th>
              <th style={styles.th}>Receiver</th>
              <th style={styles.th}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {txsSender.map((tx, i) => {
              const d = extractTxDetails(tx);
              return (
                <tr key={i}>
                  <td style={styles.td}>
                    <a style={styles.link} href={`/transaction/${tx.hash}`}>
                      {tx.hash.slice(0,20)}…
                    </a>
                  </td>
                  <td style={styles.td}>{d.sender.slice(0,20)}…</td>
                  <td style={styles.td}>{d.receiver.slice(0,20)}…</td>
                  <td style={styles.td}>{d.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Receiver Table */}
      <h3 style={styles.subtitle}>Last {perPage} Transactions by Receiver</h3>
      {loadingReceiver ? (
        <div>Loading receiver’s transactions…</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Hash</th>
              <th style={styles.th}>Sender</th>
              <th style={styles.th}>Receiver</th>
              <th style={styles.th}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {txsReceiver.map((tx, i) => {
              const d = extractTxDetails(tx);
              return (
                <tr key={i}>
                  <td style={styles.td}>
                    <a style={styles.link} href={`/transaction/${tx.hash}`}>
                      {tx.hash.slice(0,20)}…
                    </a>
                  </td>
                  <td style={styles.td}>{d.sender.slice(0,20)}…</td>
                  <td style={styles.td}>{d.receiver.slice(0,20)}…</td>
                  <td style={styles.td}>{d.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: { color: '#2d9cdb' },
  card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '1.5rem' },
  subtitle: { marginTop: '1.5rem', color: '#2d9cdb' },
  detailBox: { marginTop: '1rem' },
  buttonGroup: { marginTop: '1rem', marginBottom: '1rem' },
  toggleButton: { backgroundColor: '#2d9cdb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' },
  rawJson: { marginTop: '1rem', backgroundColor: '#eef6fc', padding: '1rem', borderRadius: '4px', overflowX: 'auto' },
  eventsContainer: { marginTop: '1rem', backgroundColor: '#f4f4f4', padding: '1rem', borderRadius: '4px' },
  eventBox: { backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  eventType: { color: '#2d9cdb', marginBottom: '0.5rem' },
  eventAttribute: { margin: '0.25rem 0' },
  loading: { padding: '2rem' },
  error: { padding: '2rem', color: 'red' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
  th: { border: '1px solid #ccc', padding: '8px', backgroundColor: '#2d9cdb', color: '#fff' },
  td: { border: '1px solid #ccc', padding: '8px' },
  link: { color: '#2d9cdb', textDecoration: 'none' },
  pagination: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' },
  pageButton: { backgroundColor: '#2d9cdb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
  pageInfo: {},
  label: {},
  select: { padding: '0.5rem' }
};

export default Transaction;
